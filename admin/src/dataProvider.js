// Simple data provider for JerseyNexus Admin
// In production, this would connect to your actual API

const API_URL = 'http://localhost:5003/api';

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
    
    // Handle different response structures for different resources
    let items = [];
    let total = 0;

    if (data.data[resource]) {
      items = data.data[resource];
      total = data.data.pagination?.totalItems || data.data[resource].length;
    } else if (data.data.orders && resource === 'orders') {
      items = data.data.orders;
      total = data.data.orders.length;
    } else if (data.data.users && resource === 'users') {
      items = data.data.users;
      total = data.data.pagination?.totalUsers || data.data.users.length;
    } else if (data.data.products && resource === 'products') {
      items = data.data.products;
      total = data.data.pagination?.totalItems || data.data.products.length;
    } else if (data.data.categories && resource === 'categories') {
      items = data.data.categories;
      total = data.data.categories.length;
    } else if (data.data.reviews && resource === 'reviews') {
      items = data.data.reviews;
      total = data.data.reviews.length;
    } else if (data.data.blogs && resource === 'blogs') {
      items = data.data.blogs;
      total = data.data.blogs.length;
    } else {
      items = data.data || [];
      total = items.length;
    }

    return {
      data: items,
      total: total,
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

    // Handle different response structures
    let record = data.data;
    if (data.data[resource.slice(0, -1)]) {
      record = data.data[resource.slice(0, -1)];
    } else if (data.data[resource]) {
      record = data.data[resource];
    }

    return { data: record };
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