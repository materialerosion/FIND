import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFormulas, getFilterOptions } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/FormulaList.scss';
import downloadLogo from '../assets/download_logo.svg';

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
  // Persisted view mode for FormulaList
  const getInitialViewMode = () => {
    const saved = localStorage.getItem('formulaListViewMode');
    return saved === 'list' || saved === 'card' ? saved : 'card';
  };
  const [viewMode, setViewModeState] = useState(getInitialViewMode);

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

  // Export to Excel handler
  const handleExportExcel = async () => {
    const params = new URLSearchParams();
    if (selectedFilters.brand) params.append('brand', selectedFilters.brand);
    if (selectedFilters.category) params.append('category', selectedFilters.category);
    if (selectedFilters.lifecyclePhase) params.append('lifecycle_phase', selectedFilters.lifecyclePhase);
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

  // Inline FormulaTable component for list view
  const [hoveredRow, setHoveredRow] = useState(null);
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
            onClick={() => window.location.href = `/formula/${formula.object_number}`}
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

  // Wrap setViewMode to also update localStorage
  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('formulaListViewMode', mode);
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
      <div className="list-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0px' }}>
        <h1 style={{ flex: '1' }}>Formula Database</h1>
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`} 
          onClick={toggleFilters}
          style={{ ...buttonStyle, marginLeft: '2rem' }}
          onMouseOver={e => (e.currentTarget.style.background = '#1565c0')}
          onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button
          className="export-excel"
          onClick={handleExportExcel}
          style={{ ...buttonStyle, marginLeft: '1rem' }}
          onMouseOver={e => (e.currentTarget.style.background = '#1565c0')}
          onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
        >
          <img src={downloadLogo} alt="Download Excel" style={{ width: '22px', height: '22px', marginRight: '8px' }} />
          Export to Excel
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
              {/* Stats and view toggle in a single flex row, aligned and touching content */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '0 0 16px 0' }}>
              {pagination && (
                  <div className="formula-stats" style={{ padding: 0, margin: 0, fontSize: '1rem' }}>
                    <p style={{ margin: 0, padding: 0 }}>Showing {formulas.length} of {pagination.total} formulas (Page {pagination.current_page} of {pagination.pages})</p>
                  </div>
                )}
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
              {viewMode === 'card' ? (
              <div className="formula-grid">
                {formulas.map(formula => (
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
                <FormulaTable formulas={formulas} />
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
          )}
        </>
      )}
    </div>
  );
}

export default FormulaList;