# server/data/seed_data.py (updated)
import json
import random
from datetime import datetime
from app import app, db
from models.formula import Formula, Ingredient, FormulaIngredient

# List of possible ingredients
ingredient_names = [
    "Sodium Chloride", "Potassium Chloride", "Calcium Carbonate", "Magnesium Oxide",
    "Zinc Sulfate", "Iron Oxide", "Copper Sulfate", "Vitamin A", "Vitamin B1",
    "Vitamin B2", "Vitamin B6", "Vitamin B12", "Vitamin C", "Vitamin D", "Vitamin E",
    "Folic Acid", "Niacin", "Biotin", "Pantothenic Acid", "Riboflavin", "Thiamine",
    "Phosphorus", "Iodine", "Manganese", "Selenium", "Chromium", "Molybdenum"
]

# Units of measurement
units = ["mg", "g", "mcg", "IU", "mL"]

def generate_sample_data():
    # Create data structure
    data = {
        "ingredients": [],
        "formulas": []
    }
    
    # Create ingredients
    for i, name in enumerate(ingredient_names, 1):
        data["ingredients"].append({
            "id": i,
            "name": name
        })
    
    # Create formulas with ingredients
    for i in range(1, 21):
        formula = {
            "id": i,
            "formulation_number": f"F{i:03d}",
            "name": f"Formula {i}",
            "description": f"This is a description for Formula {i}. It contains various ingredients in specific amounts.",
            "ingredients": []
        }
        
        # Add 4-8 random ingredients to each formula
        num_ingredients = random.randint(4, 8)
        selected_ingredient_ids = random.sample(range(1, len(ingredient_names) + 1), num_ingredients)
        
        for ingredient_id in selected_ingredient_ids:
            amount = round(random.uniform(0.1, 500), 2)
            unit = random.choice(units)
            
            formula["ingredients"].append({
                "ingredient_id": ingredient_id,
                "amount": amount,
                "unit": unit
            })
        
        data["formulas"].append(formula)
    
    return data

def seed_database():
    # Clear existing data
    db.drop_all()
    db.create_all()
    
    # Generate sample data
    data = generate_sample_data()
    
    # Save to JSON file
    with open('sample_database.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Sample JSON database generated: sample_database.json")
    
    # Import data into database
    for ingredient_data in data['ingredients']:
        ingredient = Ingredient(id=ingredient_data['id'], name=ingredient_data['name'])
        db.session.add(ingredient)
    
    db.session.commit()
    
    for formula_data in data['formulas']:
        formula = Formula(
            id=formula_data['id'],
            formulation_number=formula_data['formulation_number'],
            name=formula_data['name'],
            description=formula_data['description']
        )
        db.session.add(formula)
        db.session.commit()
        
        for ingredient_data in formula_data['ingredients']:
            formula_ingredient = FormulaIngredient(
                formula_id=formula.id,
                ingredient_id=ingredient_data['ingredient_id'],
                amount=ingredient_data['amount'],
                unit=ingredient_data['unit']
            )
            db.session.add(formula_ingredient)
    
    db.session.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_database()