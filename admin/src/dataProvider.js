// Simple data provider for JerseyNexus Admin
// In production, this would connect to your actual API

const API_URL = 'http://localhost:5000/api';

const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      sortBy: field,
      sortOrder: order.toLowerCase(),
      ...params.filter,
    });

    const response = await fetch(`${API_URL}/${resource}?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    return {
      data: data.data[resource] || data.data || [],
      total: data.data.pagination?.totalItems || data.data.length || 0,
    };
  },

  getOne: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return { data: data.data[resource.slice(0, -1)] || data.data };
  },

  getMany: async (resource, params) => {
    const query = new URLSearchParams();
    params.ids.forEach(id => query.append('id', id));
    
    const response = await fetch(`${API_URL}/${resource}?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return { data: data.data[resource] || data.data || [] };
  },

  create: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params.data),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return { data: { ...params.data, id: data.data.id } };
  },

  update: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params.data),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return { data: data.data };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map(id =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(params.data),
      })
    );
    
    await Promise.all(promises);
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return { data: params.previousData };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map(id =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
    );
    
    await Promise.all(promises);
    return { data: params.ids };
  },
};

export default dataProvider;