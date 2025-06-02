import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchFormulas, getFilterOptions } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/SearchPage.scss';

function SearchPage() {
  const [ingredients, setIngredients] = useState(['']);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [lifecyclePhase, setLifecyclePhase] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    lifecyclePhases: []
  });

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    loadFilterOptions();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setHasSearched(true);
    setCurrentPage(1);
    
    // Filter out empty ingredient inputs
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    
    try {
      const searchParams = {
        ingredients: filteredIngredients,
        minAmount,
        maxAmount,
        brand,
        category,
        lifecyclePhase
      };
      
      const data = await searchFormulas(searchParams, currentPage);
      setResults(data.formulas);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error searching formulas:', error);
    } finally {
      setSearching(false);
    }
  };
  
  const handlePageChange = async (newPage) => {
    setSearching(true);
    setCurrentPage(newPage);
    
    try {
      const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
      const searchParams = {
        ingredients: filteredIngredients,
        minAmount,
        maxAmount,
        brand,
        category,
        lifecyclePhase
      };
      
      const data = await searchFormulas(searchParams, newPage);
      setResults(data.formulas);
      setPagination(data.pagination);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error searching formulas:', error);
    } finally {
      setSearching(false);
    }
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  return (
    <div className="search-page">
      <h1>Search Formulas</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-section">
          <h3>Ingredients</h3>
          <div className="ingredients-container">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input 
                  type="text" 
                  value={ingredient} 
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`Enter ingredient ${index + 1}`}
                  className="ingredient-input"
                />
                {ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredientField(index)}
                    className="remove-ingredient"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addIngredientField}
              className="add-ingredient"
            >
              + Add Another Ingredient
            </button>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Amount Range</h3>
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
          </div>
        </div>
        
        <div className="form-section">
          <h3>Formula Properties</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Any Brand</option>
                {filterOptions.brands.map((brandOption, index) => (
                  <option key={index} value={brandOption}>{brandOption}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Any Category</option>
                {filterOptions.categories.map((categoryOption, index) => (
                  <option key={index} value={categoryOption}>{categoryOption}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Lifecycle Phase</label>
              <select 
                value={lifecyclePhase} 
                onChange={(e) => setLifecyclePhase(e.target.value)}
              >
                <option value="">Any Phase</option>
                {filterOptions.lifecyclePhases.map((phaseOption, index) => (
                  <option key={index} value={phaseOption}>{phaseOption}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="search-button" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      <div className="search-results">
        <h2>Results</h2>
        {hasSearched ? (
          results.length > 0 ? (
            <>
              {pagination && (
                <div className="result-stats">
                  <p>Found {pagination.total} formulas matching your criteria</p>
                </div>
              )}
              
              <div className="formula-grid">
                {results.map(formula => (
                  <Link to={`/formula/${formula.id}`} key={formula.id}>
                    <FormulaCard formula={formula} />
                  </Link>
                ))}
              </div>
              
              {pagination && pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    First
                  </button>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={!pagination.has_prev}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {pagination.current_page} of {pagination.pages}
                  </span>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={!pagination.has_next}
                    className="pagination-button"
                  >
                    Next
                  </button>
                  
                  <button 
                    onClick={() => handlePageChange(pagination.pages)} 
                    disabled={currentPage === pagination.pages}
                    className="pagination-button"
                  >
                    Last
                  </button>
                </div>
              )}
            </>
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