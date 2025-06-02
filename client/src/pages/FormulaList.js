import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFormulas } from '../services/api';
import FormulaCard from '../components/FormulaCard';
import '../styles/FormulaList.scss';

function FormulaList() {
  const [formulas, setFormulas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFormulas(currentPage, 20);
        setFormulas(data.formulas);
        setPagination(data.pagination);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching formulas:', error);
        setError('Failed to load formulas');
        setLoading(false);
      }
    };

    fetchFormulas();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="loading">Loading formulas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (formulas.length === 0) {
    return (
      <div className="formula-list empty">
        <h1>Formula Database</h1>
        <div className="empty-state">
          <p>No formulas found in the database.</p>
          <p>Please upload data via the Database management page.</p>
          <Link to="/database" className="database-link">Go to Database Management</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="formula-list">
      <h1>Formula Database</h1>
      
      {pagination && (
        <div className="formula-stats">
          <p>Showing {formulas.length} of {pagination.total} formulas (Page {pagination.current_page} of {pagination.pages})</p>
        </div>
      )}
      
      <div className="formula-grid">
        {formulas.map(formula => (
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
    </div>
  );
}

export default FormulaList;