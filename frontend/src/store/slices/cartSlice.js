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
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '',
          slug: product.slug,
          quantity,
          stock: product.stock,
        });
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      
      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
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