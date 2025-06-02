const API_URL = '/api';

export const getFormulas = async (page = 1, perPage = 20, filters = {}) => {
  let url = `${API_URL}/formulas?page=${page}&per_page=${perPage}`;
  
  // Add filters to URL if provided
  if (filters.brand) url += `&brand=${encodeURIComponent(filters.brand)}`;
  if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
  if (filters.lifecyclePhase) url += `&lifecycle_phase=${encodeURIComponent(filters.lifecyclePhase)}`;
  
  const response = await fetch(url);
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

export const searchFormulas = async (searchParams, page = 1, perPage = 20) => {
  let url = `${API_URL}/formulas/search?page=${page}&per_page=${perPage}`;
  
  // Add ingredient search parameters
  if (searchParams.ingredients && searchParams.ingredients.length > 0) {
    searchParams.ingredients.forEach((ing, index) => {
      url += `&ingredient${index+1}=${encodeURIComponent(ing)}`;
    });
  }
  
  // Add amount filters
  if (searchParams.minAmount) {
    url += `&min_amount=${encodeURIComponent(searchParams.minAmount)}`;
  }
  
  if (searchParams.maxAmount) {
    url += `&max_amount=${encodeURIComponent(searchParams.maxAmount)}`;
  }
  
  // Add other filters
  if (searchParams.brand) {
    url += `&brand=${encodeURIComponent(searchParams.brand)}`;
  }
  
  if (searchParams.category) {
    url += `&category=${encodeURIComponent(searchParams.category)}`;
  }
  
  if (searchParams.lifecyclePhase) {
    url += `&lifecycle_phase=${encodeURIComponent(searchParams.lifecyclePhase)}`;
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

// Get available filter options
export const getFilterOptions = async () => {
  const response = await fetch(`${API_URL}/filter-options`);
  if (!response.ok) {
    throw new Error('Failed to get filter options');
  }
  return response.json();
};