// Action types
export const CART_ADD_ITEM = 'cart/addToCart';
export const CART_REMOVE_ITEM = 'cart/removeFromCart';
export const CART_UPDATE_QUANTITY = 'cart/updateQuantity';
export const CART_CLEAR = 'cart/clearCart';
export const CART_TOGGLE = 'cart/toggleCart';
export const CART_CLOSE = 'cart/closeCart';

const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const initialState = {
  items: getCartFromStorage(),
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
};

// Calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return { totalItems, totalAmount };
};

// Action creators
export const addToCart = (payload) => ({ type: CART_ADD_ITEM, payload });
export const removeFromCart = (itemKey) => ({ type: CART_REMOVE_ITEM, payload: itemKey });
export const updateQuantity = (payload) => ({ type: CART_UPDATE_QUANTITY, payload });
export const clearCart = () => ({ type: CART_CLEAR });
export const toggleCart = () => ({ type: CART_TOGGLE });
export const closeCart = () => ({ type: CART_CLOSE });

// Initial state with calculated totals
const initialStateWithTotals = {
  ...initialState,
  ...calculateTotals(initialState.items),
};

// Reducer
const cartReducer = (state = initialStateWithTotals, action) => {
  switch (action.type) {
    case CART_ADD_ITEM: {
      const { product, quantity = 1, size, color } = action.payload;
      const itemKey = `${product.id}-${size || 'default'}-${color || 'default'}`;
      const existingItemIndex = state.items.findIndex(item => item.key === itemKey);

      // Process product image URL - handle different data types
      let productImage = '';
      if (product.images) {
        // Handle different image data formats
        if (typeof product.images === 'string') {
          productImage = product.images;
          if (!productImage.startsWith('http')) {
            productImage = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${productImage}`;
          }
        } else if (Array.isArray(product.images) && product.images.length > 0) {
          // Handle array of image objects
          const firstImage = product.images[0];
          if (typeof firstImage === 'string') {
            productImage = firstImage;
          } else if (firstImage && firstImage.url) {
            productImage = firstImage.url;
          }
          if (productImage && !productImage.startsWith('http')) {
            productImage = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${productImage}`;
          }
        }
      }

      // Fallback to placeholder if no valid image
      if (!productImage) {
        productImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
      }

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        const newItem = {
          key: itemKey,
          id: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          originalPrice: product.price,
          image: productImage,
          slug: product.slug,
          quantity,
          stock: product.stock,
          size: size || null,
          color: color || null,
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems);
      saveCartToStorage(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };
    }

    case CART_REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.key !== action.payload);
      const totals = calculateTotals(newItems);
      saveCartToStorage(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };
    }

    case CART_UPDATE_QUANTITY: {
      const { itemKey, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.key === itemKey);

      if (itemIndex >= 0 && quantity > 0 && quantity <= state.items[itemIndex].stock) {
        const newItems = [...state.items];
        newItems[itemIndex] = { ...newItems[itemIndex], quantity };

        const totals = calculateTotals(newItems);
        saveCartToStorage(newItems);

        return {
          ...state,
          items: newItems,
          totalItems: totals.totalItems,
          totalAmount: totals.totalAmount,
        };
      }
      return state;
    }

    case CART_CLEAR:
      saveCartToStorage([]);
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };

    case CART_TOGGLE:
      return { ...state, isOpen: !state.isOpen };

    case CART_CLOSE:
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

export default cartReducer;