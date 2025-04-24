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
  
  const response = await fetch(`${API_URL}/upload-database`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to upload database' }));
    throw new Error(errorData.error || 'Failed to upload database');
  }
  
  return response.json();
};

export const exportDatabase = async () => {
  const response = await fetch(`${API_URL}/export-database`);
  
  if (!response.ok) {
    throw new Error('Failed to export database');
  }
  
  return response.json();
};