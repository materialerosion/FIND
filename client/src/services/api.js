const API_URL = 'http://localhost:5000/api';

export const getFormulas = async (page = 1, perPage = 20) => {
  const response = await fetch(`${API_URL}/formulas?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch formulas');
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

export const searchFormulas = async (ingredient, minAmount, maxAmount, brand, category, page = 1, perPage = 20) => {
  let url = `${API_URL}/formulas/search?page=${page}&per_page=${perPage}`;
  
  if (ingredient) {
    url += `&ingredient=${encodeURIComponent(ingredient)}`;
  }
  
  if (minAmount) {
    url += `&min_amount=${encodeURIComponent(minAmount)}`;
  }
  
  if (maxAmount) {
    url += `&max_amount=${encodeURIComponent(maxAmount)}`;
  }
  
  if (brand) {
    url += `&brand=${encodeURIComponent(brand)}`;
  }
  
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search formulas');
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

export const uploadExcelDatabase = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/upload-excel`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload Excel database');
  }
  
  return response.json();
};

export const initializeDatabase = async () => {
  const response = await fetch(`${API_URL}/initialize-database`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to initialize database');
  }
  
  return response.json();
};

export const getDatabaseStatus = async () => {
  const response = await fetch(`${API_URL}/database-status`);
  if (!response.ok) {
    throw new Error('Failed to get database status');
  }
  return response.json();
};