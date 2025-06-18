const API_URL = process.env.REACT_APP_API_URL || '/api';

export const getFormulas = async (page = 1, perPage = 12, filters = {}) => {
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

export const getFormulaById = async (objectNumber) => {
  const response = await fetch(`${API_URL}/formulas/${objectNumber}`);
  if (!response.ok) {
    throw new Error('Failed to fetch formula');
  }
  return response.json();
};

export const searchFormulas = async (searchParams, page = 1, perPage = 12) => {
  let url = `${API_URL}/formulas/search?page=${page}&per_page=${perPage}`;
  
  // Add ingredient search parameters with coupled amount ranges
  if (searchParams.ingredientFilters && searchParams.ingredientFilters.length > 0) {
    searchParams.ingredientFilters.forEach((filter, index) => {
      if (filter.name) {
        url += `&ingredient${index+1}=${encodeURIComponent(filter.name)}`;
        
        if (filter.minAmount) {
          url += `&min_amount${index+1}=${encodeURIComponent(filter.minAmount)}`;
        }
        
        if (filter.maxAmount) {
          url += `&max_amount${index+1}=${encodeURIComponent(filter.maxAmount)}`;
        }
      }
    });
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

// Rest of the API service remains the same...
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

export const getFilterOptions = async () => {
  const response = await fetch(`${API_URL}/filter-options`);
  if (!response.ok) {
    throw new Error('Failed to get filter options');
  }
  return response.json();
};

export const getIngredients = async (page = 1, perPage = 50, search = '') => {
  let url = `${API_URL}/ingredients?page=${page}&per_page=${perPage}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch ingredients');
  }
  return response.json();
};

export const getIngredientAliases = async (ingredientId) => {
  const response = await fetch(`${API_URL}/ingredients/${ingredientId}/aliases`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch ingredient aliases');
  }
  return response.json();
};

export const addIngredientAlias = async (ingredientId, alias) => {
  const response = await fetch(`${API_URL}/ingredients/${ingredientId}/aliases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alias }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add alias');
  }
  return response.json();
};

export const deleteAlias = async (aliasId) => {
  const response = await fetch(`${API_URL}/aliases/${aliasId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete alias');
  }
  return response.json();
};

export const importAliases = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/aliases/import`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to import aliases');
  }
  return response.json();
};

export const exportAliases = async () => {
  window.location.href = `${API_URL}/aliases/export`;
  return true;
};

export const backupAliases = async () => {
  window.location.href = `${API_URL}/aliases/backup`;
  return true;
};

export const restoreAliases = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/aliases/restore`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to restore aliases');
  }
  return response.json();
};

export const createServerBackup = async () => {
  const response = await fetch(`${API_URL}/aliases/server-backup`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create server backup');
  }
  
  return response.json();
};

export const getServerBackups = async () => {
  const response = await fetch(`${API_URL}/aliases/server-backups`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get server backups');
  }
  
  return response.json();
};

export const restoreServerBackup = async (backupId, clearExisting = false) => {
  const response = await fetch(`${API_URL}/aliases/server-restore/${backupId}?clear=${clearExisting}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to restore server backup');
  }
  
  return response.json();
};

export const deleteServerBackup = async (backupId) => {
  const response = await fetch(`${API_URL}/aliases/server-backup/${backupId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete server backup');
  }
  
  return response.json();
};