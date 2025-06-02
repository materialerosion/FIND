import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchFormulas } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/SearchPage.scss';

function SearchPage() {
  const [ingredient, setIngredient] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setHasSearched(true);
    
    try {
      const data = await searchFormulas(ingredient, minAmount, maxAmount, brand, category);
      setResults(data);
    } catch (error) {
      console.error('Error searching formulas:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-page">
      <h1>Search Formulas</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>Ingredient Name</label>
            <input 
              type="text" 
              value={ingredient} 
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Enter ingredient name"
            />
          </div>
          
          <div className="form-group">
            <label>Brand</label>
            <input 
              type="text" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand name"
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Min Amount</label>
            <input 
              type="number" 
              value={minAmount} 
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Minimum amount"
            />
          </div>
          
          <div className="form-group">
            <label>Max Amount</label>
            <input 
              type="number" 
              value={maxAmount} 
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Maximum amount"
            />
          </div>
          
          <div className="form-group button-container">
            <button type="submit" className="search-button" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="search-results">
        <h2>Results</h2>
        {hasSearched ? (
          results.length > 0 ? (
            <div className="formula-grid">
              {results.map(formula => (
                <Link to={`/formula/${formula.id}`} key={formula.id}>
                  <FormulaCard formula={formula} />
                </Link>
              ))}
            </div>
          ) : (
            <p>No formulas found matching your criteria.</p>
          )
        ) : (
          <p className="search-prompt">Enter search criteria and click "Search" to find formulas.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;