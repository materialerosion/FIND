import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFormulas, getFilterOptions } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/FormulaList.scss';

function FormulaList() {
  const [formulas, setFormulas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noResultsWithFilters, setNoResultsWithFilters] = useState(false);
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    lifecyclePhases: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    brand: '',
    category: '',
    lifecyclePhase: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Load formulas with applied filters
  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      setError(null);
      setNoResultsWithFilters(false);
      
      try {
        const data = await getFormulas(currentPage, 12, selectedFilters);
        setFormulas(data.formulas);
        setPagination(data.pagination);
        
        // Check if we have no results but filters are applied
        const hasActiveFilters = Object.values(selectedFilters).some(filter => filter !== '');
        if (data.formulas.length === 0 && hasActiveFilters) {
          setNoResultsWithFilters(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching formulas:', error);
        setError('Failed to load formulas');
        setLoading(false);
      }
    };

    fetchFormulas();
  }, [currentPage, selectedFilters]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const clearFilters = () => {
    setSelectedFilters({
      brand: '',
      category: '',
      lifecyclePhase: ''
    });
    setCurrentPage(1);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading && formulas.length === 0 && !noResultsWithFilters) {
    return <div className="loading">Loading formulas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Check if database is empty (no filters applied and no results)
  const isDatabaseEmpty = formulas.length === 0 && 
                         !Object.values(selectedFilters).some(filter => filter !== '') && 
                         !noResultsWithFilters;

  return (
    <div className="formula-list">
      <div className="list-header">
        <h1>Formula Database</h1>
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`} 
          onClick={toggleFilters}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-container">
            <div className="filter-group">
              <label>Brand:</label>
              <select 
                value={selectedFilters.brand} 
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map((brand, index) => (
                  <option key={index} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={selectedFilters.category} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Lifecycle Phase:</label>
              <select 
                value={selectedFilters.lifecyclePhase} 
                onChange={(e) => handleFilterChange('lifecyclePhase', e.target.value)}
              >
                <option value="">All Phases</option>
                {filterOptions.lifecyclePhases.map((phase, index) => (
                  <option key={index} value={phase}>{phase}</option>
                ))}
              </select>
            </div>
            
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {isDatabaseEmpty ? (
        <div className="empty-state">
          <p>No formulas found in the database.</p>
          <p>Please upload data via the Database management page.</p>
          <Link to="/database" className="database-link">Go to Database Management</Link>
        </div>
      ) : (
        <>
          {noResultsWithFilters && (
            <div className="no-results-message">
              <p>No formulas found with the selected filters.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          )}
          
          {formulas.length > 0 && (
            <>
              {pagination && (
                <div className="formula-stats">
                  <p>Showing {formulas.length} of {pagination.total} formulas (Page {pagination.current_page} of {pagination.pages})</p>
                </div>
              )}
              
              {loading && <div className="loading-overlay">Loading...</div>}
              
              <div className="formula-grid">
                {formulas.map(formula => (
                  <Link to={`/formula/${formula.object_number}`} key={formula.id}>
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
          )}
        </>
      )}
    </div>
  );
}

export default FormulaList;