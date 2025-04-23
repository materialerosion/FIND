import React from 'react';
import '../styles/FormulaCard.scss';

function FormulaCard({ formula }) {
  return (
    <div className="formula-card">
      <h3>{formula.name}</h3>
      <div className="formula-number">{formula.formulation_number}</div>
      <p className="formula-description">{formula.description?.substring(0, 100)}...</p>
      
      <div className="ingredients-preview">
        {formula.ingredients.slice(0, 3).map((ingredient, index) => (
          <span key={index} className="ingredient">
            {ingredient.name}
          </span>
        ))}
        {formula.ingredients.length > 3 && (
          <span className="ingredient">+{formula.ingredients.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

export default FormulaCard;