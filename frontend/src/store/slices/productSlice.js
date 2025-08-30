import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,
  pagination: null,
  filters: {
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setProducts: (state, action) => {
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setProducts,
  setFeaturedProducts,
  setCurrentProduct,
  setCategories,
  updateFilters,
  clearFilters,
  clearCurrentProduct,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;