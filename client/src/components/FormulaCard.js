import React from 'react';
import '../styles/FormulaCard.scss';

function FormulaCard({ formula }) {
  return (
    <div className="formula-card">
      <h3>{formula.formulation_name}</h3>
      <div className="formula-number">{formula.object_number}</div>
      
      <div className="formula-meta">
        <span className="brand">{formula.formula_brand}</span>
        {formula.lifecycle_phase && (
          <span className={`phase ${formula.lifecycle_phase.toLowerCase()}`}>
            {formula.lifecycle_phase}
          </span>
        )}
      </div>
      
      <div className="formula-category">{formula.sbu_category}</div>
      
      <div className="ingredients-preview">
        {formula.ingredients.slice(0, 3).map((ingredient, index) => (
          <span key={index} className="ingredient">
            {ingredient.name}
          </span>
        ))}
        {formula.ingredients.length > 3 && (
          <span className="ingredient more">+{formula.ingredients.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

export default FormulaCard;