import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchFormulas, getFilterOptions, getIngredients } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/SearchPage.scss';
import downloadLogo from '../assets/download_logo.svg';

function SearchPage() {
  const [ingredientInputs, setIngredientInputs] = useState([
    { name: '', minAmount: '', maxAmount: '' }
  ]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [lifecyclePhase, setLifecyclePhase] = useState('');
  const [formulationName, setFormulationName] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    lifecyclePhases: [],
    productionSites: []
  });

  const [excludeIngredients, setExcludeIngredients] = useState([]);
  const [excludeInput, setExcludeInput] = useState('');
  const [excludeSuggestions, setExcludeSuggestions] = useState([]);

  const [productionSite, setProductionSite] = useState('');

  // Combobox state for brand and production site
  const [brandInput, setBrandInput] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [productionSiteInput, setProductionSiteInput] = useState('');
  const [productionSiteDropdownOpen, setProductionSiteDropdownOpen] = useState(false);

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

  // Autocomplete for exclude ingredients
  useEffect(() => {
    let active = true;
    if (excludeInput.trim() === '') {
      setExcludeSuggestions([]);
      return;
    }
    getIngredients(1, 10, excludeInput).then(res => {
      if (active) {
        setExcludeSuggestions(res.ingredients || res.results || []);
      }
    });
    return () => { active = false; };
  }, [excludeInput]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setHasSearched(true);
    setCurrentPage(1);
    
    // Filter out empty ingredient inputs
    const filteredIngredients = ingredientInputs.filter(ing => ing.name.trim() !== '');
    
    try {
      const searchParams = {
        ingredientFilters: filteredIngredients,
        brand,
        category,
        lifecyclePhase,
        formulation_name: formulationName,
        production_site: productionSite,
      };
      
      // Add exclude ingredients as exclude_ingredient1, exclude_ingredient2, ...
      excludeIngredients.forEach((ing, idx) => {
        searchParams[`exclude_ingredient${idx+1}`] = ing.name;
      });
      
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
      const filteredIngredients = ingredientInputs.filter(ing => ing.name.trim() !== '');
      const searchParams = {
        ingredientFilters: filteredIngredients,
        brand,
        category,
        lifecyclePhase,
        formulation_name: formulationName,
        production_site: productionSite, // ensure production site is included
      };
      // Add exclude ingredients as exclude_ingredient1, exclude_ingredient2, ...
      excludeIngredients.forEach((ing, idx) => {
        searchParams[`exclude_ingredient${idx+1}`] = ing.name;
      });
      const data = await searchFormulas(searchParams, newPage);
      setResults(data.formulas);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error searching formulas:', error);
    } finally {
      setSearching(false);
    }
  };

  const addIngredientField = () => {
    setIngredientInputs([...ingredientInputs, { name: '', minAmount: '', maxAmount: '' }]);
  };

  const removeIngredientField = (index) => {
    const newIngredients = [...ingredientInputs];
    newIngredients.splice(index, 1);
    setIngredientInputs(newIngredients);
  };

  const updateIngredientInput = (index, field, value) => {
    const newIngredients = [...ingredientInputs];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredientInputs(newIngredients);
  };

  const handleAddExcludeIngredient = (ingredient) => {
    if (!excludeIngredients.some(e => e.id === ingredient.id)) {
      setExcludeIngredients([...excludeIngredients, ingredient]);
    }
    setExcludeInput('');
    setExcludeSuggestions([]);
  };

  const handleRemoveExcludeIngredient = (id) => {
    setExcludeIngredients(excludeIngredients.filter(e => e.id !== id));
  };

  const buttonStyle = {
    background: '#1976d2',
    color: 'white',
    padding: '0.35rem 0.8rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'normal',
    fontSize: '0.92rem',
    height: '36px',
    minWidth: '110px',
    justifyContent: 'center',
  };

  // Export to Excel handler (reuse logic, but for search results, you may want to implement a backend endpoint in the future)
  const handleExportExcel = async () => {
    // For now, export the same as the main list (filters only)
    // You may want to add a dedicated search export endpoint for full fidelity
    const params = new URLSearchParams();
    if (brand) params.append('brand', brand);
    if (category) params.append('category', category);
    if (lifecyclePhase) params.append('lifecycle_phase', lifecyclePhase);
    if (productionSite) params.append('production_site', productionSite);
    if (formulationName) params.append('formulation_name', formulationName);
    // Add ingredient filters
    const filteredIngredients = ingredientInputs.filter(ing => ing.name.trim() !== '');
    filteredIngredients.forEach((ing, idx) => {
      params.append(`ingredientFilters[${idx}][name]`, ing.name);
      if (ing.minAmount) params.append(`ingredientFilters[${idx}][minAmount]`, ing.minAmount);
      if (ing.maxAmount) params.append(`ingredientFilters[${idx}][maxAmount]`, ing.maxAmount);
    });
    // Add exclude ingredients
    excludeIngredients.forEach((ing, idx) => {
      params.append(`exclude_ingredient${idx+1}`, ing.name);
    });
    const url = `/api/formulas/export?${params.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to export Excel file');
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'formulas_export.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export Excel file.');
    }
  };

  // Inline FormulaTable component for list view
  const FormulaTable = ({ formulas }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginTop: '0' }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Object Number</th>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Formulation Name</th>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Lifecycle Phase</th>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Brand</th>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Category</th>
        </tr>
      </thead>
      <tbody>
        {formulas.map((formula, idx) => (
          <tr
            key={formula.id}
            style={{
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              background: hoveredRow === idx ? '#e3eafc' : 'white',
              transition: 'background 0.15s',
            }}
            onClick={() => window.open(`/formula/${formula.object_number}`, '_blank')}
            onMouseEnter={() => setHoveredRow(idx)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <td style={{ padding: '10px' }}>{formula.object_number}</td>
            <td style={{ padding: '10px' }}>{formula.formulation_name}</td>
            <td style={{ padding: '10px' }}>{formula.lifecycle_phase}</td>
            <td style={{ padding: '10px' }}>{formula.formula_brand}</td>
            <td style={{ padding: '10px' }}>{formula.sbu_category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Persisted view mode for SearchPage
  const getInitialViewMode = () => {
    const saved = localStorage.getItem('searchPageViewMode');
    return saved === 'list' || saved === 'card' ? saved : 'card';
  };
  const [viewMode, setViewModeState] = useState(getInitialViewMode);

  // Wrap setViewMode to also update localStorage
  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('searchPageViewMode', mode);
  };

  return (
    <div className="search-page">
      <h1>Search Formulas</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-section">
          <h3>Ingredients</h3>
          <div className="ingredients-container">
            {ingredientInputs.map((input, index) => (
              <div key={index} className="ingredient-row">
                <div className="ingredient-input-group">
                  <label>Ingredient Name</label>
                  <input 
                    type="text" 
                    value={input.name} 
                    onChange={(e) => updateIngredientInput(index, 'name', e.target.value)}
                    placeholder={`Enter ingredient ${index + 1}`}
                    className="ingredient-input"
                  />
                </div>
                
                <div className="amount-inputs">
                  <div className="amount-input-group">
                    <label>Min Amount</label>
                    <input 
                      type="number" 
                      value={input.minAmount} 
                      onChange={(e) => updateIngredientInput(index, 'minAmount', e.target.value)}
                      placeholder="Min ingredient amount (mg)"
                      className="amount-input"
                    />
                  </div>
                  
                  <div className="amount-input-group">
                    <label>Max Amount</label>
                    <input 
                      type="number" 
                      value={input.maxAmount} 
                      onChange={(e) => updateIngredientInput(index, 'maxAmount', e.target.value)}
                      placeholder="Maxingredient amount (mg)"
                      className="amount-input"
                    />
                  </div>
                </div>
                
                {ingredientInputs.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredientField(index)}
                    className="remove-ingredient"
                    aria-label="Remove ingredient"
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
          <h3>Exclude Ingredients</h3>
          <div className="exclude-ingredients-container" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {excludeIngredients.map(ingredient => (
                <span key={ingredient.id} className="exclude-chip">
                  {ingredient.name}
                  <button type="button" onClick={() => handleRemoveExcludeIngredient(ingredient.id)} aria-label="Remove excluded ingredient">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={excludeInput}
              onChange={e => setExcludeInput(e.target.value)}
              placeholder="Type to exclude ingredient..."
              style={{ width: 260, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            {excludeSuggestions.length > 0 && (
              <div className="exclude-suggestions">
                {excludeSuggestions.map(sug => (
                  <div key={sug.id} className="exclude-suggestion-item" onClick={() => handleAddExcludeIngredient(sug)}>
                    {sug.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Formula Properties</h3>
          {/* Formulation Name search row */}
          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ width: '100%' }}>
              <label>Formulation Name</label>
              <input
                type="text"
                value={formulationName}
                onChange={e => setFormulationName(e.target.value)}
                placeholder="Enter formulation name..."
                style={{ width: 260, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={brandInput !== '' || brand === '' ? brandInput : brand}
                  placeholder="Any Brand"
                  onFocus={() => setBrandDropdownOpen(true)}
                  onChange={e => {
                    setBrandInput(e.target.value);
                    setBrandDropdownOpen(true);
                  }}
                  onBlur={() => setTimeout(() => setBrandDropdownOpen(false), 150)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', height: '40px' }}
                />
                {brandDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    width: '100%',
                    maxHeight: 180,
                    overflowY: 'auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div
                      style={{ padding: '6px 10px', cursor: 'pointer', color: brand === '' ? '#1976d2' : undefined }}
                      onMouseDown={() => {
                        setBrand('');
                        setBrandInput('');
                        setBrandDropdownOpen(false);
                      }}
                    >Any Brand</div>
                    {filterOptions.brands
                      .filter(b => !brandInput || b.toLowerCase().includes(brandInput.toLowerCase()))
                      .map((brandOption, index) => (
                        <div
                          key={index}
                          style={{ padding: '6px 10px', cursor: 'pointer', color: brand === brandOption ? '#1976d2' : undefined }}
                          onMouseDown={() => {
                            setBrand(brandOption);
                            setBrandInput(brandOption);
                            setBrandDropdownOpen(false);
                          }}
                        >{brandOption}</div>
                      ))}
                  </div>
                )}
              </div>
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
            <div className="form-group">
              <label>Production Site</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={productionSiteInput !== '' || productionSite === '' ? productionSiteInput : productionSite}
                  placeholder="Any Production Site"
                  onFocus={() => setProductionSiteDropdownOpen(true)}
                  onChange={e => {
                    setProductionSiteInput(e.target.value);
                    setProductionSiteDropdownOpen(true);
                  }}
                  onBlur={() => setTimeout(() => setProductionSiteDropdownOpen(false), 150)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', height: '40px' }}
                />
                {productionSiteDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    width: '100%',
                    maxHeight: 180,
                    overflowY: 'auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div
                      style={{ padding: '6px 10px', cursor: 'pointer', color: productionSite === '' ? '#1976d2' : undefined }}
                      onMouseDown={() => {
                        setProductionSite('');
                        setProductionSiteInput('');
                        setProductionSiteDropdownOpen(false);
                      }}
                    >Any Production Site</div>
                    {filterOptions.productionSites && filterOptions.productionSites
                      .filter(site => !productionSiteInput || site.toLowerCase().includes(productionSiteInput.toLowerCase()))
                      .map((site, idx) => (
                        <div
                          key={idx}
                          style={{ padding: '6px 10px', cursor: 'pointer', color: productionSite === site ? '#1976d2' : undefined }}
                          onMouseDown={() => {
                            setProductionSite(site);
                            setProductionSiteInput(site);
                            setProductionSiteDropdownOpen(false);
                          }}
                        >{site}</div>
                      ))}
                  </div>
                )}
              </div>
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
        {/* Stats, export, and view toggle row */}
        {hasSearched && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '0 0 15px 0' }}>
            <div className="result-stats" style={{ padding: 0, margin: 0, fontSize: '1rem', background: 'none', boxShadow: 'none' }}>
              {pagination && (
                <p style={{ margin: 0, padding: 0, background: 'none', boxShadow: 'none' }}>Found {pagination.total} formulas matching your criteria</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="export-excel"
                onClick={handleExportExcel}
                style={{ ...buttonStyle, minWidth: 'auto', height: '38px' }}
                onMouseOver={e => (e.currentTarget.style.background = '#1565c0')}
                onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
              >
                <img src={downloadLogo} alt="Download Excel" style={{ width: '22px', height: '22px', marginRight: '8px' }} />
                Export to Excel
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e3eafc', borderRadius: '6px', padding: '4px 8px' }}>
                <button
                  aria-label="Card view"
                  onClick={() => setViewMode('card')}
                  style={{
                    background: viewMode === 'card' ? '#1976d2' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Grid icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="2" fill={viewMode === 'card' ? '#fff' : '#1976d2'} />
                    <rect x="14" y="3" width="7" height="7" rx="2" fill={viewMode === 'card' ? '#fff' : '#1976d2'} />
                    <rect x="14" y="14" width="7" height="7" rx="2" fill={viewMode === 'card' ? '#fff' : '#1976d2'} />
                    <rect x="3" y="14" width="7" height="7" rx="2" fill={viewMode === 'card' ? '#fff' : '#1976d2'} />
                  </svg>
                </button>
                <button
                  aria-label="List view"
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? '#1976d2' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* List icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="6" width="16" height="2.5" rx="1" fill={viewMode === 'list' ? '#fff' : '#1976d2'} />
                    <rect x="4" y="11" width="16" height="2.5" rx="1" fill={viewMode === 'list' ? '#fff' : '#1976d2'} />
                    <rect x="4" y="16" width="16" height="2.5" rx="1" fill={viewMode === 'list' ? '#fff' : '#1976d2'} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        {hasSearched ? (
          results.length > 0 ? (
            <>
              {viewMode === 'card' ? (
                <div className="formula-grid">
                  {results.map(formula => (
                    <a
                      href={`/formula/${formula.object_number}`}
                      key={formula.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <FormulaCard formula={formula} />
                    </a>
                  ))}
                </div>
              ) : (
                <FormulaTable formulas={results} />
              )}
              
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