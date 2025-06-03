from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fing_item_number = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    description_expanded = db.Column(db.Text)
    aliases = db.relationship('IngredientAlias', backref='ingredient', lazy=True, cascade="all, delete-orphan")
    
class IngredientAlias(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    alias = db.Column(db.String(255), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Add a unique constraint to prevent duplicate aliases for the same ingredient
    __table_args__ = (db.UniqueConstraint('alias', 'ingredient_id', name='_alias_ingredient_uc'),)
    
class FormulaIngredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    formula_id = db.Column(db.Integer, db.ForeignKey('formula.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    
class Formula(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    object_number = db.Column(db.String(50), unique=True, nullable=False)
    formulation_name = db.Column(db.String(255), nullable=False)
    lifecycle_phase = db.Column(db.String(50))
    formula_brand = db.Column(db.String(100))
    sbu_category = db.Column(db.String(100))
    dossier_type = db.Column(db.String(100))
    regulatory_comments = db.Column(db.Text)
    general_comments = db.Column(db.Text)
    production_sites = db.Column(db.Text)
    predecessor_formulation_number = db.Column(db.String(50))
    successor_formulation_number = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    ingredients = db.relationship('FormulaIngredient', backref='formula', lazy=True)
