const API_URL = 'http://localhost:5000/api';

export const getFormulas = async () => {
  const response = await fetch(`${API_URL}/formulas`);
  if (!response.ok) {
    throw new Error('Failed to fetch formulas');
  }
  return response.json();
};

export const getFormulaById = async (id) => {
  const response = await fetch(`${API_URL}/formulas/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch formula');
  }
  return response.json();
};

export const searchFormulas = async (ingredient, minAmount, maxAmount) => {
  let url = `${API_URL}/formulas/search?`;
  
  if (ingredient) {
    url += `ingredient=${encodeURIComponent(ingredient)}&`;
  }
  
  if (minAmount) {
    url += `min_amount=${encodeURIComponent(minAmount)}&`;
  }
  
  if (maxAmount) {
    url += `max_amount=${encodeURIComponent(maxAmount)}&`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search formulas');
  }
  return response.json();
};

export const uploadDatabase = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`\${API_URL}/upload-database`, {
      method: 'POST',
      body: formData,
    });
    
    const contentType = response.headers.get('content-type');
    
    // Check if the response is JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload database');
      }
      
      return data;
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server returned an invalid response. Please try again later.');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const exportDatabase = async () => {
  const response = await fetch(`\${API_URL}/export-database`);
  
  if (!response.ok) {
    throw new Error('Failed to export database');
  }
  
  return response.json();
};