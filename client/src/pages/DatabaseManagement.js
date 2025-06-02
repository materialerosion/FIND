// client/src/pages/DatabaseManagement.js
import React, { useState, useEffect } from 'react';
import { uploadDatabase, exportDatabase, uploadExcelDatabase, initializeDatabase, getDatabaseStatus } from '../services/api';
import '../styles/DatabaseManagement.scss';

function DatabaseManagement() {
  const [jsonFile, setJsonFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('excel'); // 'excel' or 'json'
  const [isInitializing, setIsInitializing] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Check database status on component mount
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const status = await getDatabaseStatus();
        setDbStatus(status);
      } catch (error) {
        console.error("Error checking database status:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    
    checkDatabaseStatus();
  }, []);

  const handleJsonFileChange = (e) => {
    if (e.target.files[0]) {
      setJsonFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleExcelFileChange = (e) => {
    if (e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleJsonUpload = async (e) => {
    e.preventDefault();
    
    if (!jsonFile) {
      setUploadError('Please select a JSON file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    
    try {
      const result = await uploadDatabase(jsonFile);
      setUploadResult(result);
      setJsonFile(null);
      // Reset the file input
      document.getElementById('json-file-upload').value = '';
      
      // Refresh database status
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    
    if (!excelFile) {
      setUploadError('Please select an Excel file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    
    try {
      const result = await uploadExcelDatabase(excelFile);
      setUploadResult(result);
      setExcelFile(null);
      // Reset the file input
      document.getElementById('excel-file-upload').value = '';
      
      // Refresh database status
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const data = await exportDatabase();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'formula_database.json';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      alert(`Error exporting database: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleInitializeDatabase = async () => {
    setIsInitializing(true);
    setUploadError(null);
    setUploadResult(null);
    
    try {
      const result = await initializeDatabase();
      setUploadResult(result);
      
      // Refresh database status
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="database-management">
      <h1>Database Management</h1>
      
      {/* Database Status Card */}
      <div className="card status-card">
        <h2>Database Status</h2>
        {statusLoading ? (
          <p>Loading database status...</p>
        ) : dbStatus ? (
          <div className="status-info">
            <p className={dbStatus.has_data ? "status-good" : "status-warning"}>
              {dbStatus.has_data ? "Database contains data" : "Database is empty"}
            </p>
            {dbStatus.counts && (
              <ul className="status-counts">
                <li><strong>Ingredients:</strong> {dbStatus.counts.ingredients}</li>
                <li><strong>Formulas:</strong> {dbStatus.counts.formulas}</li>
                <li><strong>Formula-Ingredient Relationships:</strong> {dbStatus.counts.formula_ingredients}</li>
              </ul>
            )}
          </div>
        ) : (
          <p className="status-error">Unable to fetch database status</p>
        )}
      </div>
      
      <div className="tabs">
        <button 
          className={activeTab === 'excel' ? 'active' : ''} 
          onClick={() => setActiveTab('excel')}
        >
          Excel Import
        </button>
        <button 
          className={activeTab === 'json' ? 'active' : ''} 
          onClick={() => setActiveTab('json')}
        >
          JSON Import/Export
        </button>
      </div>
      
      {activeTab === 'excel' && (
        <>
          <div className="card">
            <h2>Load Default Database</h2>
            <p>Initialize the database from the pre-loaded Excel file (Synaps Full 2025 Q1.xlsx) in the server.</p>
            
            <button 
              className="initialize-button"
              onClick={handleInitializeDatabase}
              disabled={isInitializing}
            >
              {isInitializing ? 'Initializing...' : 'Initialize Database'}
            </button>
            
            {uploadResult && !uploadError && (
              <div className="success-message">
                <p>{uploadResult.message}</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2>Import Excel Database</h2>
            <p>Upload an Excel file (.xlsx or .xls) containing formula and ingredient data.</p>
            
            <form onSubmit={handleExcelUpload} className="upload-form">
              <div className="file-input-container">
                <input
                  type="file"
                  id="excel-file-upload"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileChange}
                  disabled={isUploading}
                />
                <label htmlFor="excel-file-upload" className="file-label">
                  {excelFile ? excelFile.name : 'Choose Excel file'}
                </label>
              </div>
              
              <button 
                type="submit" 
                className="upload-button"
                disabled={!excelFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Excel Database'}
              </button>
            </form>
            
            {uploadError && (
              <div className="error-message">
                <p>{uploadError}</p>
              </div>
            )}
            
            {uploadResult && !uploadError && (
              <div className="success-message">
                <p>{uploadResult.message}</p>
                {uploadResult.formulas_created && (
                  <p>
                    Imported {uploadResult.ingredients_created} ingredients, {uploadResult.formulas_created} formulas, 
                    and {uploadResult.formula_ingredients_created} formula-ingredient relationships.
                  </p>
                )}
              </div>
            )}
            
            <div className="info-card">
              <h3>Expected Excel Format</h3>
              <p>The Excel file should contain the following columns:</p>
              <ul className="column-list">
                <li>Number + Name + Unit</li>
                <li>FING_ITEM_NUMBER</li>
                <li>FING_DESCRIPTION</li>
                <li>Ingredient Description Expanded</li>
                <li>FING_QUANTITY</li>
                <li>FING_UNIT</li>
                <li>OBJECT_NUMBER</li>
                <li>LIFECYCLE_PHASE</li>
                <li>FORMULATION_NAME</li>
                <li>FORMULA_BRAND</li>
                <li>SBU_CATEGORY</li>
                <li>DOSSIER_TYPE</li>
                <li>REGULATORY_COMMENTS</li>
                <li>GENERAL_COMMENTS</li>
                <li>PRODUCTION_SITES_AVAILABLE</li>
                <li>PREDECESSORFORMULATIONNUMBER</li>
                <li>SUCCESSORFORMULATIONNUMBER</li>
              </ul>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'json' && (
        <>
          <div className="card">
            <h2>Import JSON Database</h2>
            <p>Upload a JSON file containing ingredients and formulas to replace the current database.</p>
            
            <form onSubmit={handleJsonUpload} className="upload-form">
              <div className="file-input-container">
                <input
                  type="file"
                  id="json-file-upload"
                  accept=".json"
                  onChange={handleJsonFileChange}
                  disabled={isUploading}
                />
                <label htmlFor="json-file-upload" className="file-label">
                  {jsonFile ? jsonFile.name : 'Choose JSON file'}
                </label>
              </div>
              
              <button 
                type="submit" 
                className="upload-button"
                disabled={!jsonFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload JSON Database'}
              </button>
            </form>
            
            {uploadError && activeTab === 'json' && (
              <div className="error-message">
                <p>{uploadError}</p>
              </div>
            )}
            
            {uploadResult && activeTab === 'json' && (
              <div className="success-message">
                <p>{uploadResult.message}</p>
                <p>Imported {uploadResult.ingredients_count} ingredients and {uploadResult.formulas_count} formulas.</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2>Export Database</h2>
            <p>Download the current database as a JSON file that can be imported later.</p>
            
            <button 
              className="export-button"
              onClick={handleExport}
              disabled={isExporting || !dbStatus?.has_data}
            >
              {isExporting ? 'Exporting...' : 'Export Database'}
            </button>
            
            {!dbStatus?.has_data && (
              <p className="note">Export is disabled because the database is empty.</p>
            )}
          </div>
          
          <div className="card info-card">
            <h2>JSON Database Format</h2>
            <p>The JSON file should have the following structure:</p>
            
            <pre className="json-structure">
{`{
  "ingredients": [
    {"id": 1, "name": "Ingredient Name", "fing_item_number": "FING00001"},
    ...
  ],
  "formulas": [
    {
      "id": 1,
      "object_number": "1600559",
      "formulation_name": "Formula Name",
      "lifecycle_phase": "Active",
      "formula_brand": "Brand Name",
      "sbu_category": "Category",
      "dossier_type": "Type",
      "regulatory_comments": "Comments",
      "general_comments": "Comments",
      "production_sites": "Sites",
      "predecessor_formulation_number": "1600558",
      "successor_formulation_number": "1600560",
      "ingredients": [
        {"ingredient_id": 1, "amount": 100, "unit": "mg"},
        ...
      ]
    },
    ...
  ]
}`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default DatabaseManagement;