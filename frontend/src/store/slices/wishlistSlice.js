import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlist')) || [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (!existingItem) {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          category: product.category,
          brand: product.brand,
          rating: product.rating,
          reviewCount: product.reviewCount || 0,
          stock: product.stock,
          slug: product.slug,
          addedAt: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(state.items));
        
        toast.success(`${product.name} added to wishlist!`, {
          duration: 2000,
          position: 'bottom-right'
        });
      } else {
        toast.error('Product already in wishlist!', {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    },
    
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      const removedItem = state.items.find(item => item.id === productId);
      
      state.items = state.items.filter(item => item.id !== productId);
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(state.items));
      
      if (removedItem) {
        toast.success(`${removedItem.name} removed from wishlist!`, {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    },
    
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
      toast.success('Wishlist cleared!', {
        duration: 2000,
        position: 'bottom-right'
      });
    },
    
    moveToCart: (state, action) => {
      const { productId, cartDispatch } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item) {
        // Add to cart (this would be handled by the component)
        // Remove from wishlist
        state.items = state.items.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
        
        toast.success(`${item.name} moved to cart!`, {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      if (action.payload) {
        toast.error(action.payload, {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    }
  }
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  setLoading,
  setError
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (productId) => (state) => 
  state.wishlist.items.some(item => item.id === productId);
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;

export default wishlistSlice.reducer;
