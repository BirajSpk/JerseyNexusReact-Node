import { createSlice } from '@reduxjs/toolkit';

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

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    ...calculateTotals(initialState.items),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size, color } = action.payload;

      // Create unique item key based on product ID, size, and color
      const itemKey = `${product.id}-${size || 'default'}-${color || 'default'}`;
      const existingItem = state.items.find(item => item.key === itemKey);

      // Process single product image URL
      let productImage = '';
      if (product.images) {
        // Backend contains single image URL as string
        productImage = product.images;

        // Ensure image has proper URL prefix
        if (!productImage.startsWith('http')) {
          productImage = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}${productImage}`;
        }
      }

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
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
        });
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;

      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action) => {
      const itemKey = action.payload;
      state.items = state.items.filter(item => item.key !== itemKey);
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action) => {
      const { itemKey, quantity } = action.payload;
      const item = state.items.find(item => item.key === itemKey);
      
      if (item && quantity > 0 && quantity <= item.stock) {
        item.quantity = quantity;
        
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        
        saveCartToStorage(state.items);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      saveCartToStorage([]);
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;