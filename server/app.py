from flask import Flask, request, jsonify
from flask_cors import CORS
from models.formula import db, Formula, Ingredient, FormulaIngredient
from sqlalchemy import and_
import os
import json
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///formulas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)

@app.route('/api/formulas', methods=['GET'])
def get_formulas():
    formulas = Formula.query.all()
    result = []
    for formula in formulas:
        formula_data = {
            'id': formula.id,
            'formulation_number': formula.formulation_number,
            'name': formula.name,
            'description': formula.description,
            'ingredients': []
        }
        
        for formula_ingredient in formula.ingredients:
            ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
            formula_data['ingredients'].append({
                'name': ingredient.name,
                'amount': formula_ingredient.amount,
                'unit': formula_ingredient.unit
            })
        
        result.append(formula_data)
    
    return jsonify(result)

@app.route('/api/formulas/search', methods=['GET'])
def search_formulas():
    ingredient_name = request.args.get('ingredient')
    min_amount = request.args.get('min_amount')
    max_amount = request.args.get('max_amount')
    
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
    
    if filters:
        query = query.filter(*filters)
    
    formulas = query.distinct().all()
    
    result = []
    for formula in formulas:
        formula_data = {
            'id': formula.id,
            'formulation_number': formula.formulation_number,
            'name': formula.name,
            'description': formula.description,
            'ingredients': []
        }
        
        for formula_ingredient in formula.ingredients:
            ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
            formula_data['ingredients'].append({
                'name': ingredient.name,
                'amount': formula_ingredient.amount,
                'unit': formula_ingredient.unit
            })
        
        result.append(formula_data)
    
    return jsonify(result)

@app.route('/api/formulas/<int:formula_id>', methods=['GET'])
def get_formula(formula_id):
    formula = Formula.query.get_or_404(formula_id)
    
    formula_data = {
        'id': formula.id,
        'formulation_number': formula.formulation_number,
        'name': formula.name,
        'description': formula.description,
        'ingredients': []
    }
    
    for formula_ingredient in formula.ingredients:
        ingredient = Ingredient.query.get(formula_ingredient.ingredient_id)
        formula_data['ingredients'].append({
            'name': ingredient.name,
            'amount': formula_ingredient.amount,
            'unit': formula_ingredient.unit
        })
    
    return jsonify(formula_data)

@app.route('/api/upload-database', methods=['POST'])
def upload_database():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and file.filename.endswith('.json'):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            try:
                # Load the JSON data
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Validate the structure
                if 'ingredients' not in data or 'formulas' not in data:
                    return jsonify({'error': 'Invalid JSON structure. Must contain "ingredients" and "formulas" keys.'}), 400
                
                # Clear existing data
                db.session.query(FormulaIngredient).delete()
                db.session.query(Formula).delete()
                db.session.query(Ingredient).delete()
                
                # Import ingredients
                for ingredient_data in data['ingredients']:
                    ingredient = Ingredient(id=ingredient_data['id'], name=ingredient_data['name'])
                    db.session.add(ingredient)
                
                db.session.commit()
                
                # Import formulas
                for formula_data in data['formulas']:
                    formula = Formula(
                        id=formula_data['id'],
                        formulation_number=formula_data['formulation_number'],
                        name=formula_data['name'],
                        description=formula_data['description']
                    )
                    db.session.add(formula)
                    
                    # Need to commit here to get the formula ID for the relationships
                    db.session.commit()
                    
                    # Add formula ingredients
                    for ingredient_data in formula_data['ingredients']:
                        formula_ingredient = FormulaIngredient(
                            formula_id=formula.id,
                            ingredient_id=ingredient_data['ingredient_id'],
                            amount=ingredient_data['amount'],
                            unit=ingredient_data['unit']
                        )
                        db.session.add(formula_ingredient)
                
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Database imported successfully',
                    'ingredients_count': len(data['ingredients']),
                    'formulas_count': len(data['formulas'])
                })
                
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'Error importing database: {str(e)}'}), 500
            
    except Exception as e:
        logger.exception('Unexpected error in upload_database')
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file format. Please upload a JSON file.'}), 400

@app.route('/api/export-database', methods=['GET'])
def export_database():
    try:
        # Get all ingredients
        ingredients = Ingredient.query.all()
        ingredients_data = [{'id': i.id, 'name': i.name} for i in ingredients]
        
        # Get all formulas with their ingredients
        formulas = Formula.query.all()
        formulas_data = []
        
        for formula in formulas:
            formula_data = {
                'id': formula.id,
                'formulation_number': formula.formulation_number,
                'name': formula.name,
                'description': formula.description,
                'ingredients': []
            }
            
            # Get ingredients for this formula
            formula_ingredients = FormulaIngredient.query.filter_by(formula_id=formula.id).all()
            
            for fi in formula_ingredients:
                formula_data['ingredients'].append({
                    'ingredient_id': fi.ingredient_id,
                    'amount': fi.amount,
                    'unit': fi.unit
                })
            
            formulas_data.append(formula_data)
        
        # Create the final data structure
        database = {
            'ingredients': ingredients_data,
            'formulas': formulas_data
        }
        
        return jsonify(database)
        
    except Exception as e:
        return jsonify({'error': f'Error exporting database: {str(e)}'}), 500



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000
