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
        <h1>{formula.name}</h1>
        <div className="formula-number">{formula.formulation_number}</div>
      </div>
      
      <div className="formula-description">
        <p>{formula.description}</p>
      </div>
      
      <div className="ingredients-section">
        <h2>Ingredients</h2>
        <div className="ingredients-table">
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Amount</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {formula.ingredients.map((ingredient, index) => (
                <tr key={index}>
                  <td>{ingredient.name}</td>
                  <td>{ingredient.amount}</td>
                  <td>{ingredient.unit}</td>
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