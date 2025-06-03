import React, { useState, useEffect } from 'react';
import { 
  getIngredients, 
  getIngredientAliases, 
  addIngredientAlias, 
  deleteAlias,
  importAliases,
  exportAliases,
  backupAliases,
  restoreAliases,
  createServerBackup,
  getServerBackups,
  restoreServerBackup,
  deleteServerBackup
} from '../services/api';
import '../styles/AliasManagement.scss';

function AliasManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasSuccess, setAliasSuccess] = useState('');
  
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);
  const [restoring, setRestoring] = useState(false);
  
  // Add new state variables for server backups
  const [serverBackups, setServerBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backupError, setBackupError] = useState('');
  const [backupSuccess, setBackupSuccess] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [clearExistingOnRestore, setClearExistingOnRestore] = useState(false);
  
  // Load ingredients
  useEffect(() => {
    fetchIngredients(currentPage, searchTerm);
  }, [currentPage]);
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchIngredients(1, searchTerm);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Load server backups
  useEffect(() => {
    fetchServerBackups();
  }, []);
  
  const fetchServerBackups = async () => {
    try {
      setLoadingBackups(true);
      setBackupError('');
      const result = await getServerBackups();
      setServerBackups(result.backups);
    } catch (error) {
      setBackupError(`Failed to load backups: ${error.message}`);
    } finally {
      setLoadingBackups(false);
    }
  };
  
  const fetchIngredients = async (page = currentPage, search = searchTerm) => {
    try {
      setIsSearching(true);
      setLoading(true);
      setError(null);
      
      console.log(`Fetching ingredients: page=${page}, search=${search}`);
      const data = await getIngredients(page, 20, search);
      console.log('Ingredients data received:', data);
      
      setIngredients(data.ingredients);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError(`Failed to load ingredients: ${error.message}`);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };
  
  // Load aliases when an ingredient is selected
  useEffect(() => {
    if (!selectedIngredient) {
      setAliases([]);
      return;
    }
    
    const fetchAliases = async () => {
      try {
        const data = await getIngredientAliases(selectedIngredient.id);
        setAliases(data.aliases);
      } catch (error) {
        console.error('Error fetching aliases:', error);
      }
    };
    
    fetchAliases();
  }, [selectedIngredient]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      // If search is cleared, immediately fetch all ingredients
      setCurrentPage(1);
      fetchIngredients(1, '');
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchIngredients(1, searchTerm);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchIngredients(1, '');
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const handleIngredientSelect = (ingredient) => {
    setSelectedIngredient(ingredient);
    setNewAlias('');
    setAliasError('');
    setAliasSuccess('');
  };
  
  const handleAddAlias = async (e) => {
    e.preventDefault();
    
    if (!selectedIngredient) return;
    
    if (!newAlias.trim()) {
      setAliasError('Alias cannot be empty');
      return;
    }
    
    try {
      setAliasError('');
      const result = await addIngredientAlias(selectedIngredient.id, newAlias);
      
      // Add the new alias to the list
      setAliases([...aliases, { id: result.id, alias: result.alias }]);
      
      // Update the selected ingredient's aliases list
      setSelectedIngredient({
        ...selectedIngredient,
        aliases: [...selectedIngredient.aliases, result.alias]
      });
      
      // Clear the input and show success message
      setNewAlias('');
      setAliasSuccess('Alias added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAliasSuccess('');
      }, 3000);
    } catch (error) {
      setAliasError(error.message);
    }
  };
  
  const handleDeleteAlias = async (aliasId) => {
    if (!window.confirm('Are you sure you want to delete this alias?')) {
      return;
    }
    
    try {
      await deleteAlias(aliasId);
      
      // Find the alias to be deleted
      const deletedAlias = aliases.find(alias => alias.id === aliasId);
      
      // Remove the deleted alias from the list
      setAliases(aliases.filter(alias => alias.id !== aliasId));
      
      // Update the selected ingredient's aliases list
      if (deletedAlias) {
        setSelectedIngredient({
          ...selectedIngredient,
          aliases: selectedIngredient.aliases.filter(alias => alias !== deletedAlias.alias)
        });
      }
      
      // Show success message
      setAliasSuccess('Alias deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAliasSuccess('');
      }, 3000);
    } catch (error) {
      setAliasError(error.message);
    }
  };
  
  const handleImportFile = (e) => {
    if (e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };
  
  const handleImportAliases = async (e) => {
    e.preventDefault();
    
    if (!importFile) {
      setAliasError('Please select a CSV file to import');
      return;
    }
    
    try {
      setImporting(true);
      setAliasError('');
      const result = await importAliases(importFile);
      setImportResult(result);
      
      // Clear the file input
      document.getElementById('alias-import-file').value = '';
      setImportFile(null);
      
      // If an ingredient is selected, refresh its aliases
      if (selectedIngredient) {
        const data = await getIngredientAliases(selectedIngredient.id);
        setAliases(data.aliases);
      }
      
      // Refresh the ingredients list to show updated alias counts
      fetchIngredients(currentPage, searchTerm);
    } catch (error) {
      setAliasError(error.message);
    } finally {
      setImporting(false);
    }
  };
  
  const handleExportAliases = async () => {
    try {
      await exportAliases();
    } catch (error) {
      setAliasError('Failed to export aliases');
    }
  };
  
  const handleBackupAliases = async () => {
    try {
      await backupAliases();
    } catch (error) {
      setAliasError('Failed to backup aliases');
    }
  };

  const handleRestoreFile = (e) => {
    if (e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
      setRestoreResult(null);
    }
  };

  const handleRestoreAliases = async (e) => {
    e.preventDefault();
    
    if (!restoreFile) {
      setAliasError('Please select a JSON file to restore');
      return;
    }
    
    try {
      setRestoring(true);
      setAliasError('');
      const result = await restoreAliases(restoreFile);
      setRestoreResult(result);
      
      // Clear the file input
      document.getElementById('alias-restore-file').value = '';
      setRestoreFile(null);
      
      // If an ingredient is selected, refresh its aliases
      if (selectedIngredient) {
        const data = await getIngredientAliases(selectedIngredient.id);
        setAliases(data.aliases);
      }
      
      // Refresh the ingredients list to show updated alias counts
      fetchIngredients(currentPage, searchTerm);
    } catch (error) {
      setAliasError(error.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleCreateServerBackup = async () => {
    try {
      setIsCreatingBackup(true);
      setBackupError('');
      setBackupSuccess('');
      
      const result = await createServerBackup();
      
      setBackupSuccess('Backup created successfully');
      fetchServerBackups(); // Refresh the list of backups
    } catch (error) {
      setBackupError(`Failed to create backup: ${error.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };
  
  const handleRestoreServerBackup = async () => {
    if (!selectedBackupId) {
      setBackupError('Please select a backup to restore');
      return;
    }
    
    if (!window.confirm(
      clearExistingOnRestore 
        ? 'This will DELETE ALL existing aliases and restore from the selected backup. Continue?' 
        : 'This will merge the backup with existing aliases. Continue?'
    )) {
      return;
    }
    
    try {
      setIsRestoringBackup(true);
      setBackupError('');
      setBackupSuccess('');
      
      const result = await restoreServerBackup(selectedBackupId, clearExistingOnRestore);
      
      setBackupSuccess(`Restored ${result.aliases_restored} aliases successfully`);
      
      // If an ingredient is selected, refresh its aliases
      if (selectedIngredient) {
        const data = await getIngredientAliases(selectedIngredient.id);
        setAliases(data.aliases);
      }
      
      // Refresh the ingredients list to show updated alias counts
      fetchIngredients(currentPage, searchTerm);
    } catch (error) {
      setBackupError(`Failed to restore backup: ${error.message}`);
    } finally {
      setIsRestoringBackup(false);
    }
  };
  
  const handleDeleteServerBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteServerBackup(backupId);
      setBackupSuccess('Backup deleted successfully');
      fetchServerBackups(); // Refresh the list of backups
    } catch (error) {
      setBackupError(`Failed to delete backup: ${error.message}`);
    }
  };

  return (
    <div className="alias-management">
      <h1>Ingredient Aliases Management</h1>
      
      <div className="alias-management-container">
        <div className="ingredients-panel">
          <div className="panel-header">
            <h2>Ingredients</h2>
            <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
                <div className="input-wrapper">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search ingredients or aliases..."
                    className="search-input"
                />
                {searchTerm && (
                    <button 
                    type="button" 
                    className="clear-search" 
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    >
                    ✕
                    </button>
                )}
                </div>
                <button 
                type="submit" 
                className="search-button" 
                disabled={isSearching}
                >
                {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>
            <div className="search-help">
                Search by ingredient name, number, or alias
            </div>
            </form>
          </div>
          
          {loading && ingredients.length === 0 ? (
            <div className="loading">Loading ingredients...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : ingredients.length === 0 ? (
            <div className="no-results">No ingredients found</div>
          ) : (
            <>
              <ul className="ingredients-list">
                {ingredients.map(ingredient => {
                  // Check if this ingredient was found via alias match
                  const matchingAlias = searchTerm && ingredient.aliases.find(
                    alias => alias.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  return (
                    <li 
                      key={ingredient.id} 
                      className={selectedIngredient?.id === ingredient.id ? 'selected' : ''}
                      onClick={() => handleIngredientSelect(ingredient)}
                    >
                      <div className="ingredient-name">{ingredient.name}</div>
                      <div className="ingredient-number">{ingredient.fing_item_number}</div>
                      
                      {ingredient.aliases.length > 0 && (
                        <div className="ingredient-aliases">
                          {matchingAlias ? (
                            <div className="alias-match">
                              <span className="match-label">Matched alias:</span> 
                              <span className="matching-alias">{matchingAlias}</span>
                            </div>
                          ) : (
                            <div className="alias-count">{ingredient.aliases.length} aliases</div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              
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
        </div>
        
        <div className="aliases-panel">
          <div className="panel-header">
            <h2>Aliases</h2>
          </div>
          
          {selectedIngredient ? (
            <div className="aliases-content">
              <div className="selected-ingredient">
                <h3>{selectedIngredient.name}</h3>
                <div className="ingredient-details">
                  <span className="ingredient-number">{selectedIngredient.fing_item_number}</span>
                  {selectedIngredient.description && (
                    <span className="ingredient-description">{selectedIngredient.description}</span>
                  )}
                </div>
                
                {selectedIngredient.aliases.length > 0 && (
                  <div className="current-aliases">
                    <h4>Current Aliases:</h4>
                    <div className="aliases-tags">
                      {selectedIngredient.aliases.map((alias, index) => (
                        <span key={index} className="alias-tag">{alias}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAddAlias} className="add-alias-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="Enter new alias..."
                    className="alias-input"
                  />
                  <button type="submit" className="add-button">Add Alias</button>
                </div>
                
                {aliasError && <div className="error-message">{aliasError}</div>}
                {aliasSuccess && <div className="success-message">{aliasSuccess}</div>}
              </form>
              
              {aliases.length > 0 ? (
                <ul className="aliases-list">
                  {aliases.map(alias => (
                    <li key={alias.id} className="alias-item">
                      <span className="alias-text">{alias.alias}</span>
                      <button 
                        onClick={() => handleDeleteAlias(alias.id)}
                        className="delete-button"
                        aria-label="Delete alias"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-aliases">
                  No aliases found for this ingredient. Add an alias to help with searching.
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              Select an ingredient from the list to manage its aliases.
            </div>
          )}
        </div>
      </div>
      
      <div className="import-export-section">
        <h2>Import/Export Aliases</h2>
        
        <div className="import-export-container">
          <div className="import-panel">
            <h3>Import Aliases</h3>
            <p className="help-text">
              Upload a CSV file with ingredient names and aliases. 
              Format: "Ingredient Name, Alias" (one per line).
            </p>
            
            <form onSubmit={handleImportAliases} className="import-form">
              <div className="file-input-container">
                <input
                  type="file"
                  id="alias-import-file"
                  accept=".csv"
                  onChange={handleImportFile}
                  disabled={importing}
                />
                <label htmlFor="alias-import-file" className="file-label">
                  {importFile ? importFile.name : 'Choose CSV file'}
                </label>
              </div>
              
              <button 
                type="submit" 
                className="import-button"
                disabled={!importFile || importing}
              >
                {importing ? 'Importing...' : 'Import Aliases'}
              </button>
            </form>
            
            {importResult && (
              <div className="import-result">
                <div className="success-message">
                  {importResult.message}
                  <div className="import-stats">
                    <span>Added: {importResult.aliases_added}</span>
                    <span>Errors: {importResult.errors}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="export-panel">
            <h3>Export Aliases</h3>
            <p className="help-text">
              Download all ingredient aliases as a CSV file that can be edited and re-imported.
            </p>
            
            <button 
              onClick={handleExportAliases}
              className="export-button"
            >
              Export All Aliases
            </button>
            
            <div className="csv-format">
              <h4>CSV Format Example:</h4>
              <pre>
                Ingredient Name,Alias<br/>
                Acetylsalicylic Acid,Aspirin<br/>
                Acetylsalicylic Acid,ASA<br/>
                Paracetamol,Acetaminophen
              </pre>
            </div>
          </div>
        </div>
        
        <div className="backup-restore-panel">
          <h3>Backup & Restore</h3>
          <p className="help-text">
            Backup your aliases to a JSON file or restore from a previous backup.
          </p>
          
          <div className="backup-restore-actions">
            <button 
              onClick={handleBackupAliases}
              className="backup-button"
            >
              Backup Aliases
            </button>
            
            <form onSubmit={handleRestoreAliases} className="restore-form">
              <div className="file-input-container">
                <input
                  type="file"
                  id="alias-restore-file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  disabled={restoring}
                />
                <label htmlFor="alias-restore-file" className="file-label">
                  {restoreFile ? restoreFile.name : 'Choose JSON backup'}
                </label>
              </div>
              
              <button 
                type="submit" 
                className="restore-button"
                disabled={!restoreFile || restoring}
              >
                {restoring ? 'Restoring...' : 'Restore Aliases'}
              </button>
            </form>
          </div>
          
          {restoreResult && (
            <div className="restore-result">
              <div className="success-message">
                {restoreResult.message}
                <div className="restore-stats">
                  <span>Restored: {restoreResult.aliases_restored}</span>
                  <span>Skipped: {restoreResult.aliases_skipped}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="server-backups-section">
          <h3>Server Backups</h3>
          <p className="help-text">
            Create and manage backups stored on the server. These backups can be restored at any time.
          </p>
          
          <div className="server-backup-actions">
            <button 
              className="create-backup-button"
              onClick={handleCreateServerBackup}
              disabled={isCreatingBackup}
            >
              {isCreatingBackup ? 'Creating...' : 'Create New Backup'}
            </button>
            
            {backupError && <div className="error-message">{backupError}</div>}
            {backupSuccess && <div className="success-message">{backupSuccess}</div>}
          </div>
          
          <div className="server-backup-restore">
            <h4>Restore from Server Backup</h4>
            
            <div className="restore-options">
              <div className="select-backup">
                <label>Select Backup:</label>
                <select 
                  value={selectedBackupId}
                  onChange={(e) => setSelectedBackupId(e.target.value)}
                  disabled={loadingBackups || isRestoringBackup}
                >
                  <option value="">-- Select a backup --</option>
                  {serverBackups.map(backup => (
                    <option key={backup.id} value={backup.id}>
                      {new Date(backup.created_at).toLocaleString()} ({backup.aliases_count} aliases)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="restore-option">
                <label>
                  <input 
                    type="checkbox"
                    checked={clearExistingOnRestore}
                    onChange={(e) => setClearExistingOnRestore(e.target.checked)}
                    disabled={isRestoringBackup}
                  />
                  Clear existing aliases before restore
                </label>
              </div>
              
              <button 
                className="restore-button"
                onClick={handleRestoreServerBackup}
                disabled={!selectedBackupId || isRestoringBackup}
              >
                {isRestoringBackup ? 'Restoring...' : 'Restore Selected Backup'}
              </button>
            </div>
          </div>
          
          <div className="server-backups-list">
            <h4>Available Backups</h4>
            
            {loadingBackups ? (
              <p>Loading backups...</p>
            ) : serverBackups.length === 0 ? (
              <p>No backups available</p>
            ) : (
              <table className="backups-table">
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Aliases</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serverBackups.map(backup => (
                    <tr key={backup.id}>
                      <td>{new Date(backup.created_at).toLocaleString()}</td>
                      <td>{backup.aliases_count}</td>
                      <td>{(backup.size / 1024).toFixed(1)} KB</td>
                      <td>
                        <button 
                          className="delete-backup-button"
                          onClick={() => handleDeleteServerBackup(backup.id)}
                          title="Delete backup"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AliasManagement;