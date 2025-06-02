# server/app.py
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.formula import db, Formula, Ingredient, FormulaIngredient
from sqlalchemy import and_
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///formulas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure uploads directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)

def initialize_database_from_excel():
    """Load the database from a predefined Excel file on server startup"""
    excel_path = os.path.join(app.config['UPLOAD_FOLDER'], "Synaps Full 2025 Q1.xlsx")
    
    if not os.path.exists(excel_path):
        print(f"Warning: Default database file not found at {excel_path}")
        return False
    
    try:
        print(f"Loading database from {excel_path}...")
        df = pd.read_excel(excel_path)
        
        print(f"Successfully read Excel file with {len(df)} rows and {len(df.columns)} columns")
        
        # Clear existing data
        print("Clearing existing database records...")
        db.session.query(FormulaIngredient).delete()
        db.session.query(Formula).delete()
        db.session.query(Ingredient).delete()
        db.session.commit()
        
        # Process the data
        ingredients_dict = {}
        formulas_dict = {}
        formula_ingredients_created = 0
        errors = 0
        
        # Process each row in the Excel file
        print("Processing Excel data...")
        for index, row in df.iterrows():
            if index % 5000 == 0:
                print(f"Processing row {index}/{len(df)}...")
            
            try:
                # Process ingredient if it doesn't exist
                fing_item_number = str(row['FING_ITEM_NUMBER'])
                if fing_item_number not in ingredients_dict:
                    ingredient = Ingredient(
                        fing_item_number=fing_item_number,
                        name=str(row['FING_DESCRIPTION']),
                        description=str(row['FING_DESCRIPTION']),
                        description_expanded=str(row['Ingredient Description Expanded'])
                    )
                    db.session.add(ingredient)
                    db.session.flush()  # Get the ID without committing
                    ingredients_dict[fing_item_number] = ingredient.id
                
                # Process formula if it doesn't exist
                object_number = str(row['OBJECT_NUMBER'])
                if object_number not in formulas_dict:
                    formula = Formula(
                        object_number=object_number,
                        formulation_name=str(row['FORMULATION_NAME']),
                        lifecycle_phase=str(row['LIFECYCLE_PHASE']),
                        formula_brand=str(row['FORMULA_BRAND']),
                        sbu_category=str(row['SBU_CATEGORY']),
                        dossier_type=str(row['DOSSIER_TYPE']),
                        regulatory_comments=str(row['REGULATORY_COMMENTS']) if 'REGULATORY_COMMENTS' in row and not pd.isna(row['REGULATORY_COMMENTS']) else '',
                        general_comments=str(row['GENERAL_COMMENTS']) if 'GENERAL_COMMENTS' in row and not pd.isna(row['GENERAL_COMMENTS']) else '',
                        production_sites=str(row['PRODUCTION_SITES_AVAILABLE']) if 'PRODUCTION_SITES_AVAILABLE' in row and not pd.isna(row['PRODUCTION_SITES_AVAILABLE']) else '',
                        predecessor_formulation_number=str(row['PREDECESSORFORMULATIONNUMBER']) if 'PREDECESSORFORMULATIONNUMBER' in row and not pd.isna(row['PREDECESSORFORMULATIONNUMBER']) else '',
                        successor_formulation_number=str(row['SUCCESSORFORMULATIONNUMBER']) if 'SUCCESSORFORMULATIONNUMBER' in row and not pd.isna(row['SUCCESSORFORMULATIONNUMBER']) else ''
                    )
                    db.session.add(formula)
                    db.session.flush()  # Get the ID without committing
                    formulas_dict[object_number] = formula.id
                
                # Create formula ingredient relationship
                # Handle NaN values in the amount field
                amount = 0.0  # Default value
                if 'FING_QUANTITY' in row:
                    if pd.notna(row['FING_QUANTITY']):
                        try:
                            # Try to convert to float
                            amount = float(row['FING_QUANTITY'])
                        except (ValueError, TypeError):
                            # If conversion fails, use the default value
                            if isinstance(row['FING_QUANTITY'], str) and row['FING_QUANTITY'].strip().upper() == 'Q.S.':
                                # Special case for "Q.S." (Quantum Satis - as much as needed)
                                amount = 0.0  # Use 0 as a placeholder
                                print(f"Row {index}: Q.S. value found, using 0.0 as placeholder")
                            else:
                                print(f"Row {index}: Invalid amount value: {row['FING_QUANTITY']}, using 0.0")
                
                unit = str(row['FING_UNIT']) if pd.notna(row['FING_UNIT']) else ''
                
                formula_ingredient = FormulaIngredient(
                    formula_id=formulas_dict[object_number],
                    ingredient_id=ingredients_dict[fing_item_number],
                    amount=amount,
                    unit=unit
                )
                db.session.add(formula_ingredient)
                formula_ingredients_created += 1
                
            except Exception as e:
                errors += 1
                print(f"Error processing row {index}: {str(e)}")
                if errors >= 100:  # Limit the number of errors before giving up
                    raise Exception(f"Too many errors ({errors}) during import. Last error: {str(e)}")
                continue
            
            # Commit in batches to avoid memory issues
            if index % 1000 == 0:
                try:
                    db.session.commit()
                    print(f"Committed batch at row {index}")
                except Exception as e:
                    db.session.rollback()
                    print(f"Error committing batch at row {index}: {str(e)}")
                    # Continue with the next batch
        
        # Final commit
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error during final commit: {str(e)}")
            return False
        
        print(f"Successfully loaded database from Excel:")
        print(f"  - {len(ingredients_dict)} ingredients")
        print(f"  - {len(formulas_dict)} formulas")
        print(f"  - {formula_ingredients_created} formula-ingredient relationships")
        print(f"  - {errors} errors encountered and skipped")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"Error loading database from Excel: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

@app.route('/api/formulas', methods=['GET'])
def get_formulas():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit maximum per_page to avoid overwhelming responses
        per_page = min(per_page, 100)
        
        print(f"Fetching formulas (page {page}, per_page {per_page})...")
        
        # Get paginated formulas
        pagination = Formula.query.paginate(page=page, per_page=per_page, error_out=False)
        formulas = pagination.items
        
        print(f"Found {len(formulas)} formulas for this page")
        
        result = []
        for formula in formulas:
            formula_data = {
                'id': formula.id,
                'object_number': formula.object_number,
                'formulation_name': formula.formulation_name,
                'lifecycle_phase': formula.lifecycle_phase,
                'formula_brand': formula.formula_brand,
                'sbu_category': formula.sbu_category,
                'ingredients': []
            }
            
            for formula_ingredient in formula.ingredients:
                ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
                formula_data['ingredients'].append({
                    'id': ingredient.id,
                    'name': ingredient.name,
                    'fing_item_number': ingredient.fing_item_number,
                    'amount': formula_ingredient.amount,
                    'unit': formula_ingredient.unit
                })
            
            result.append(formula_data)
        
        # Include pagination metadata
        pagination_data = {
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
        
        print(f"Returning {len(result)} formulas with pagination data")
        return jsonify({
            'formulas': result,
            'pagination': pagination_data
        })
    except Exception as e:
        print(f"Error in get_formulas: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/formulas/<int:formula_id>', methods=['GET'])
def get_formula(formula_id):
    formula = Formula.query.get_or_404(formula_id)
    
    formula_data = {
        'id': formula.id,
        'object_number': formula.object_number,
        'formulation_name': formula.formulation_name,
        'lifecycle_phase': formula.lifecycle_phase,
        'formula_brand': formula.formula_brand,
        'sbu_category': formula.sbu_category,
        'dossier_type': formula.dossier_type,
        'regulatory_comments': formula.regulatory_comments,
        'general_comments': formula.general_comments,
        'production_sites': formula.production_sites,
        'predecessor_formulation_number': formula.predecessor_formulation_number,
        'successor_formulation_number': formula.successor_formulation_number,
        'ingredients': []
    }
    
    for formula_ingredient in formula.ingredients:
        ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
        formula_data['ingredients'].append({
            'id': ingredient.id,
            'name': ingredient.name,
            'fing_item_number': ingredient.fing_item_number,
            'description': ingredient.description,
            'description_expanded': ingredient.description_expanded,
            'amount': formula_ingredient.amount,
            'unit': formula_ingredient.unit
        })
    
    return jsonify(formula_data)

@app.route('/api/formulas/search', methods=['GET'])
def search_formulas():
    try:
        ingredient_name = request.args.get('ingredient')
        min_amount = request.args.get('min_amount')
        max_amount = request.args.get('max_amount')
        brand = request.args.get('brand')
        category = request.args.get('category')
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit maximum per_page to avoid overwhelming responses
        per_page = min(per_page, 100)
        
        query = Formula.query.join(FormulaIngredient).join(Ingredient)
        
        filters = []
        if ingredient_name:
            filters.append(Ingredient.name.ilike(f'%{ingredient_name}%'))
        
        if min_amount and max_amount:
            filters.append(and_(FormulaIngredient.amount >= float(min_amount), 
                               FormulaIngredient.amount <= float(max_amount)))
        elif min_amount:
            filters.append(FormulaIngredient.amount >= float(min_amount))
        elif max_amount:
            filters.append(FormulaIngredient.amount <= float(max_amount))
        
        if brand:
            filters.append(Formula.formula_brand.ilike(f'%{brand}%'))
        
        if category:
            filters.append(Formula.sbu_category.ilike(f'%{category}%'))
        
        if filters:
            query = query.filter(*filters)
        
        # Make the query distinct to avoid duplicates
        query = query.distinct()
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination
        formulas = query.paginate(page=page, per_page=per_page, error_out=False).items
        
        result = []
        for formula in formulas:
            formula_data = {
                'id': formula.id,
                'object_number': formula.object_number,
                'formulation_name': formula.formulation_name,
                'lifecycle_phase': formula.lifecycle_phase,
                'formula_brand': formula.formula_brand,
                'sbu_category': formula.sbu_category,
                'ingredients': []
            }
            
            for formula_ingredient in formula.ingredients:
                ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
                formula_data['ingredients'].append({
                    'id': ingredient.id,
                    'name': ingredient.name,
                    'fing_item_number': ingredient.fing_item_number,
                    'amount': formula_ingredient.amount,
                    'unit': formula_ingredient.unit
                })
            
            result.append(formula_data)
        
        # Calculate pagination metadata
        total_pages = (total + per_page - 1) // per_page  # Ceiling division
        
        pagination_data = {
            'total': total,
            'pages': total_pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
        
        return jsonify({
            'formulas': result,
            'pagination': pagination_data
        })
        
    except Exception as e:
        print(f"Error in search_formulas: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload-excel', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Load the Excel file
            df = pd.read_excel(file_path)
            
            # Check if required columns exist
            required_columns = [
                'FING_ITEM_NUMBER', 'FING_DESCRIPTION', 
                'Ingredient Description Expanded', 'FING_QUANTITY', 'FING_UNIT', 
                'OBJECT_NUMBER', 'LIFECYCLE_PHASE', 'FORMULATION_NAME'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return jsonify({
                    'error': f'Missing required columns: {", ".join(missing_columns)}'
                }), 400
            
            # Clear existing data
            db.session.query(FormulaIngredient).delete()
            db.session.query(Formula).delete()
            db.session.query(Ingredient).delete()
            db.session.commit()
            
            # Process the data
            ingredients_dict = {}
            formulas_dict = {}
            formula_ingredients_created = 0
            errors = 0
            
            # Process each row in the Excel file
            for index, row in df.iterrows():
                try:
                    # Process ingredient if it doesn't exist
                    fing_item_number = str(row['FING_ITEM_NUMBER'])
                    if fing_item_number not in ingredients_dict:
                        ingredient = Ingredient(
                            fing_item_number=fing_item_number,
                            name=str(row['FING_DESCRIPTION']),
                            description=str(row['FING_DESCRIPTION']),
                            description_expanded=str(row['Ingredient Description Expanded'])
                        )
                        db.session.add(ingredient)
                        db.session.flush()
                        ingredients_dict[fing_item_number] = ingredient.id
                    
                    # Process formula if it doesn't exist
                    object_number = str(row['OBJECT_NUMBER'])
                    if object_number not in formulas_dict:
                        formula = Formula(
                            object_number=object_number,
                            formulation_name=str(row['FORMULATION_NAME']),
                            lifecycle_phase=str(row['LIFECYCLE_PHASE']),
                            formula_brand=str(row['FORMULA_BRAND']) if 'FORMULA_BRAND' in row else '',
                            sbu_category=str(row['SBU_CATEGORY']) if 'SBU_CATEGORY' in row else '',
                            dossier_type=str(row['DOSSIER_TYPE']) if 'DOSSIER_TYPE' in row else '',
                            regulatory_comments=str(row['REGULATORY_COMMENTS']) if 'REGULATORY_COMMENTS' in row and not pd.isna(row['REGULATORY_COMMENTS']) else '',
                            general_comments=str(row['GENERAL_COMMENTS']) if 'GENERAL_COMMENTS' in row and not pd.isna(row['GENERAL_COMMENTS']) else '',
                            production_sites=str(row['PRODUCTION_SITES_AVAILABLE']) if 'PRODUCTION_SITES_AVAILABLE' in row and not pd.isna(row['PRODUCTION_SITES_AVAILABLE']) else '',
                            predecessor_formulation_number=str(row['PREDECESSORFORMULATIONNUMBER']) if 'PREDECESSORFORMULATIONNUMBER' in row and not pd.isna(row['PREDECESSORFORMULATIONNUMBER']) else '',
                            successor_formulation_number=str(row['SUCCESSORFORMULATIONNUMBER']) if 'SUCCESSORFORMULATIONNUMBER' in row and not pd.isna(row['SUCCESSORFORMULATIONNUMBER']) else ''
                        )
                        db.session.add(formula)
                        db.session.flush()
                        formulas_dict[object_number] = formula.id
                    
                    # Create formula ingredient relationship
                    # Handle NaN values in the amount field
                    amount = 0.0  # Default value
                    if 'FING_QUANTITY' in row:
                        if pd.notna(row['FING_QUANTITY']):
                            try:
                                # Try to convert to float
                                amount = float(row['FING_QUANTITY'])
                            except (ValueError, TypeError):
                                # If conversion fails, use the default value
                                if isinstance(row['FING_QUANTITY'], str) and row['FING_QUANTITY'].strip().upper() == 'Q.S.':
                                    # Special case for "Q.S." (Quantum Satis - as much as needed)
                                    amount = 0.0  # Use 0 as a placeholder
                                else:
                                    print(f"Row {index}: Invalid amount value: {row['FING_QUANTITY']}, using 0.0")
                    
                    unit = str(row['FING_UNIT']) if pd.notna(row['FING_UNIT']) else ''
                    
                    formula_ingredient = FormulaIngredient(
                        formula_id=formulas_dict[object_number],
                        ingredient_id=ingredients_dict[fing_item_number],
                        amount=amount,
                        unit=unit
                    )
                    db.session.add(formula_ingredient)
                    formula_ingredients_created += 1
                    
                except Exception as e:
                    errors += 1
                    print(f"Error processing row {index}: {str(e)}")
                    continue
                
                # Commit in batches
                if index % 1000 == 0:
                    try:
                        db.session.commit()
                    except Exception as e:
                        db.session.rollback()
                        print(f"Error committing batch at row {index}: {str(e)}")
            
            # Final commit
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Excel file imported successfully',
                'ingredients_created': len(ingredients_dict),
                'formulas_created': len(formulas_dict),
                'formula_ingredients_created': formula_ingredients_created,
                'errors': errors
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Error importing Excel file: {str(e)}'}), 500
        finally:
            # Clean up the uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    return jsonify({'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls).'}), 400

@app.route('/api/database-status', methods=['GET'])
def database_status():
    try:
        ingredient_count = Ingredient.query.count()
        formula_count = Formula.query.count()
        formula_ingredient_count = FormulaIngredient.query.count()
        
        return jsonify({
            'success': True,
            'status': 'Database is available',
            'counts': {
                'ingredients': ingredient_count,
                'formulas': formula_count,
                'formula_ingredients': formula_ingredient_count
            },
            'has_data': ingredient_count > 0 and formula_count > 0
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': f'Error checking database: {str(e)}',
            'has_data': False
        })

@app.route('/api/initialize-database', methods=['POST'])
def initialize_database():
    try:
        success = initialize_database_from_excel()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Database initialized successfully from Excel file'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to initialize database. Check server logs for details.'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error initializing database: {str(e)}'
        }), 500

if __name__ == '__main__':
    with app.app_context():
        # Drop and recreate all tables
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        
        # Try to initialize from Excel
        print("Attempting to initialize database from Excel file...")
        success = initialize_database_from_excel()
        
        if success:
            print("Database successfully initialized from Excel file!")
        else:
            print("Failed to initialize database from Excel file.")
            
    app.run(debug=True, port=5000)