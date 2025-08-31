// Action types
export const PRODUCT_SET_LOADING = 'products/setLoading';
export const PRODUCT_SET_ERROR = 'products/setError';
export const PRODUCT_SET_PRODUCTS = 'products/setProducts';
export const PRODUCT_SET_FEATURED = 'products/setFeaturedProducts';
export const PRODUCT_SET_CURRENT = 'products/setCurrentProduct';
export const PRODUCT_SET_CATEGORIES = 'products/setCategories';
export const PRODUCT_UPDATE_FILTERS = 'products/updateFilters';
export const PRODUCT_CLEAR_FILTERS = 'products/clearFilters';
export const PRODUCT_CLEAR_CURRENT = 'products/clearCurrentProduct';
export const PRODUCT_CLEAR_ERROR = 'products/clearError';

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

// Action creators
export const setLoading = (loading) => ({ type: PRODUCT_SET_LOADING, payload: loading });
export const setError = (error) => ({ type: PRODUCT_SET_ERROR, payload: error });
export const setProducts = (data) => ({ type: PRODUCT_SET_PRODUCTS, payload: data });
export const setFeaturedProducts = (products) => ({ type: PRODUCT_SET_FEATURED, payload: products });
export const setCurrentProduct = (product) => ({ type: PRODUCT_SET_CURRENT, payload: product });
export const setCategories = (categories) => ({ type: PRODUCT_SET_CATEGORIES, payload: categories });
export const updateFilters = (filters) => ({ type: PRODUCT_UPDATE_FILTERS, payload: filters });
export const clearFilters = () => ({ type: PRODUCT_CLEAR_FILTERS });
export const clearCurrentProduct = () => ({ type: PRODUCT_CLEAR_CURRENT });
export const clearError = () => ({ type: PRODUCT_CLEAR_ERROR });

// Reducer
const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case PRODUCT_SET_LOADING:
      return { ...state, loading: action.payload };

    case PRODUCT_SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case PRODUCT_SET_PRODUCTS:
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };

    case PRODUCT_SET_FEATURED:
      return {
        ...state,
        featuredProducts: action.payload,
        loading: false,
        error: null,
      };

    case PRODUCT_SET_CURRENT:
      return {
        ...state,
        currentProduct: action.payload,
        loading: false,
        error: null,
      };

    case PRODUCT_SET_CATEGORIES:
      return { ...state, categories: action.payload };

    case PRODUCT_UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case PRODUCT_CLEAR_FILTERS:
      return { ...state, filters: initialState.filters };

    case PRODUCT_CLEAR_CURRENT:
      return { ...state, currentProduct: null };

    case PRODUCT_CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

export default productReducer;