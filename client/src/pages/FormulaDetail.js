// client/src/pages/FormulaDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFormulaById } from '../services/api';
import '../styles/FormulaDetail.scss';

function FormulaDetail() {
  const { objectNumber } = useParams();
  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormula = async () => {
      try {
        const data = await getFormulaById(objectNumber);
        setFormula(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching formula details:', error);
        setError('Failed to load formula details');
        setLoading(false);
      }
    };

    fetchFormula();
  }, [objectNumber]);

  if (loading) {
    return <div className="loading">Loading formula details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!formula) {
    return <div className="not-found">Formula not found</div>;
  }

  // Generate the Doris URL with the formula's object number
  const dorisQualUrl = `https://bayer-doris.veevavault.com/ui/#t/0TB000000000102/all?ivp=1&ivv=COMPACT&fcah=documentationGroup%2Cproduct%2CdocumentType%2Cstatus&initSrch=false&search=%257B%2522text%2522%253A%2522${formula.object_number}%2522%257D&ivr=0&iv=1&ivo=desc&ivs=&fcac=&allStudiesSites=&sm=112767931749564107788&smart=true&fcl=&fct=documentType%3Aquality`;
  const dorisUrl = `https://bayer-doris.veevavault.com/ui/#t/0TB000000000102/all?ivp=1&ivv=COMPACT&fcah=documentationGroup%2Cproduct%2CdocumentType%2Cstatus&initSrch=false&search=%257B%2522text%2522%253A%2522${formula.object_number}%2522%257D&ivr=0&iv=1&ivo=desc&ivs=&fcac=&allStudiesSites=&sm=112767931749570300723&smart=true`;

  return (
    <div className="formula-detail">
      <div className="back-link">
        <Link to="/">← Back to all formulas</Link>
      </div>
      
      <div className="formula-header">
        <h1>{formula.formulation_name}</h1>
        <div className="formula-number">Formula Number: {formula.object_number}</div>
        
        <div className="formula-meta">
          <div className="meta-item">
            <span className="label">Brand:</span>
            <span className="value">{formula.formula_brand}</span>
          </div>
          
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
      
        <div className="external-links">
          <a href={dorisQualUrl} target="_blank" rel="noopener noreferrer" className="doris-link">
            <span className="icon">📄</span> Quality Documents via Doris
          </a>
          &nbsp;
          <a href={dorisUrl} target="_blank" rel="noopener noreferrer" className="doris-link">
            <span className="icon">📃</span> All Regulatory Documents
          </a>
        </div>

      {(formula.predecessor_formulation_number || formula.successor_formulation_number) && (
        <div className="formula-relations">
          {formula.predecessor_formulation_number && (
            <div className="relation successor">
              <span className="label">Predecessor:</span>
              <Link to={`/formula/${formula.predecessor_formulation_number}`} className="value predecessor-link">
                {formula.predecessor_formulation_number}
              </Link>
            </div>
          )}
          
          {formula.successor_formulation_number && (
            <div className="relation successor">
              <span className="label">Successor:</span>
              <Link to={`/formula/${formula.successor_formulation_number}`} className="value successor-link">
                {formula.successor_formulation_number}
              </Link>
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