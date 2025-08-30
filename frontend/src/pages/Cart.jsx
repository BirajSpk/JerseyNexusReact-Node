import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Gift
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateQuantity, 
  removeFromCart, 
  clearCart 
} from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items, totalItems, totalAmount } = useSelector((state) => state.cart);
  
  const handleQuantityChange = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemKey);
    } else {
      dispatch(updateQuantity({ itemKey, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemKey) => {
    dispatch(removeFromCart(itemKey));
    toast.success('Item removed from cart');
  };
  
  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const shippingCost = totalAmount > 2000 ? 0 : 150;
  const finalTotal = totalAmount + shippingCost;
  
  if (items.length === 0) {
    return (
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-neutral rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-4">Your cart is empty</h1>
          <p className="text-muted mb-8">
            Looks like you haven't added anything to your cart yet. 
            Start shopping to fill it up!
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn btn-primary px-8 py-3 text-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Start Shopping</span>
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Shopping Cart</h1>
          <p className="text-muted">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-outline flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-soft overflow-hidden"
          >
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-dark">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-danger hover:text-danger/80 text-sm font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Items List */}
            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-neutral/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || 'https://placehold.co/120x120/e5e7eb/6b7280?text=Product'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/products/${item.slug}`)}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/120x120/e5e7eb/6b7280?text=Product';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-dark mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/products/${item.slug}`)}
                      >
                        {item.name}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-sm text-muted mb-2">Size: {item.selectedSize}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-dark">NPR {item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-muted line-through">NPR {item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-dark">NPR {item.price * item.quantity}</p>
                      <p className="text-sm text-muted">{item.quantity} x NPR {item.price}</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <button className="p-2 text-muted hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.key)}
                        className="p-2 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-soft p-6 sticky top-4"
          >
            <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
            
            {/* Summary Details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({totalItems} items)</span>
                <span>NPR {totalAmount}</span>
              </div>
              
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `NPR ${shippingCost}`}</span>
              </div>
              
              {shippingCost > 0 && (
                <div className="text-sm text-primary bg-primary/10 p-3 rounded-lg">
                  💡 Add NPR {2000 - totalAmount} more for free shipping!
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-dark">
                  <span>Total</span>
                  <span>NPR {finalTotal}</span>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center space-x-2 mb-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* Additional Options */}
            <div className="space-y-3">
              <button className="w-full btn btn-outline py-2 flex items-center justify-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>Add Gift Message</span>
              </button>
              
              <div className="text-center">
                <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                  Have a coupon code?
                </button>
              </div>
            </div>
            
            {/* Security Badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center space-x-4 text-xs text-muted">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Recommended Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-soft p-6 mt-6"
          >
            <h3 className="font-semibold text-dark mb-4">You might also like</h3>
            <div className="space-y-4">
              {[1, 2].map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-neutral/50 rounded-lg transition-colors cursor-pointer">
                  <img
                    src={`https://via.placeholder.com/60x60?text=Item+${index + 1}`}
                    alt={`Recommended item ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-dark line-clamp-1">
                      Recommended Item {index + 1}
                    </h4>
                    <p className="text-sm font-bold text-primary">NPR 1,500</p>
                  </div>
                  <button className="btn btn-primary btn-sm px-3 py-1 text-xs">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;