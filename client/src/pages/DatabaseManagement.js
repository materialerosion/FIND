
import React, { useState } from 'react';
import { uploadDatabase, exportDatabase } from '../services/api';
import '../styles/DatabaseManagement.scss';

function DatabaseManagement() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    
    try {
      const result = await uploadDatabase(file);
      setUploadResult(result);
      setFile(null);
      // Reset the file input
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
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
      alert(`Error exporting database: \${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="database-management">
      <h1>Database Management</h1>
      
      <div className="card">
        <h2>Import Database</h2>
        <p>Upload a JSON file containing ingredients and formulas to replace the current database.</p>
        
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-container">
            <input
              type="file"
              id="file-upload"
              accept=".json"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className="file-label">
              {file ? file.name : 'Choose JSON file'}
            </label>
          </div>
          
          <button 
            type="submit" 
            className="upload-button"
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Database'}
          </button>
        </form>
        
        {uploadError && (
          <div className="error-message">
            <p>{uploadError}</p>
          </div>
        )}
        
        {uploadResult && (
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
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export Database'}
        </button>
      </div>
      
      <div className="card info-card">
        <h2>Database Format</h2>
        <p>The JSON file should have the following structure:</p>
        
        <pre className="json-structure">
{`{
  "ingredients": [
    {"id": 1, "name": "Ingredient Name"},
    ...
  ],
  "formulas": [
    {
      "id": 1,
      "formulation_number": "F001",
      "name": "Formula Name",
      "description": "Formula description",
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
    </div>
  );
}

export default DatabaseManagement;