// client/src/pages/FormulaDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFormulaById } from '../services/api';
import '../styles/FormulaDetail.scss';

function FormulaDetail() {
  const { id } = useParams();
  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormula = async () => {
      try {
        const data = await getFormulaById(id);
        setFormula(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching formula details:', error);
        setError('Failed to load formula details');
        setLoading(false);
      }
    };

    fetchFormula();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading formula details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!formula) {
    return <div className="not-found">Formula not found</div>;
  }

  return (
    <div className="formula-detail">
      <div className="back-link">
        <Link to="/">← Back to all formulas</Link>
      </div>
      
      <div className="formula-header">
        <h1>{formula.formulation_name}</h1>
        <div className="formula-number">Object Number: {formula.object_number}</div>
        
        <div className="formula-meta">
          <div className="meta-item">
            <span className="label">Brand:</span>
            <span className="value">{formula.formula_brand}</span>
          </div>
          
// client/src/pages/FormulaDetail.js (continued)
          <div className="meta-item">
            <span className="label">Lifecycle Phase:</span>
            <span className={`value phase ${formula.lifecycle_phase?.toLowerCase()}`}>
              {formula.lifecycle_phase}
            </span>
          </div>
          
          <div className="meta-item">
            <span className="label">Category:</span>
            <span className="value">{formula.sbu_category}</span>
          </div>
          
          <div className="meta-item">
            <span className="label">Dossier Type:</span>
            <span className="value">{formula.dossier_type}</span>
          </div>
        </div>
      </div>
      
      {(formula.predecessor_formulation_number || formula.successor_formulation_number) && (
        <div className="formula-relations">
          {formula.predecessor_formulation_number && (
            <div className="relation predecessor">
              <span className="label">Predecessor:</span>
              <span className="value">{formula.predecessor_formulation_number}</span>
            </div>
          )}
          
          {formula.successor_formulation_number && (
            <div className="relation successor">
              <span className="label">Successor:</span>
              <span className="value">{formula.successor_formulation_number}</span>
            </div>
          )}
        </div>
      )}
      
      {formula.regulatory_comments && (
        <div className="comments regulatory">
          <h3>Regulatory Comments</h3>
          <p>{formula.regulatory_comments}</p>
        </div>
      )}
      
      {formula.general_comments && (
        <div className="comments general">
          <h3>General Comments</h3>
          <p>{formula.general_comments}</p>
        </div>
      )}
      
      {formula.production_sites && (
        <div className="production-sites">
          <h3>Production Sites</h3>
          <p>{formula.production_sites}</p>
        </div>
      )}
      
      <div className="ingredients-section">
        <h2>Ingredients</h2>
        <div className="ingredients-table">
          <table>
            <thead>
              <tr>
                <th>Item Number</th>
                <th>Ingredient</th>
                <th>Amount</th>
                <th>Unit</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {formula.ingredients.map((ingredient, index) => (
                <tr key={index}>
                  <td className="item-number">{ingredient.fing_item_number}</td>
                  <td>{ingredient.name}</td>
                  <td className="amount">{ingredient.amount}</td>
                  <td>{ingredient.unit}</td>
                  <td className="description">{ingredient.description_expanded || ingredient.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FormulaDetail;