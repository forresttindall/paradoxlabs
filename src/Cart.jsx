import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext.jsx';
import './Cart.css';

// Debug utility for cart page operations
const debugCartPage = {
  log: (action, data) => {
    console.group(`🛒 CART PAGE DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ CART PAGE ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  userAction: (action, data) => {
    console.group(`👤 USER ACTION: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Action data:', data);
    console.groupEnd();
  }
};

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartShipping } = useContext(CartContext);
    
    // Debug component initialization and cart state
    useEffect(() => {
      debugCartPage.log('CART_PAGE_LOADED', {
        cartItemCount: cartItems.length,
        cartTotal: getCartTotal(),
        cartShipping: getCartShipping(),
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }, [cartItems, getCartTotal, getCartShipping]);
    
    // Enhanced remove function with debugging
    const handleRemoveFromCart = (itemId, itemName) => {
      debugCartPage.userAction('REMOVE_ITEM_CLICKED', {
        itemId: itemId,
        itemName: itemName
      });
      try {
        removeFromCart(itemId);
        debugCartPage.log('ITEM_REMOVED_SUCCESS', { itemId, itemName });
      } catch (error) {
        debugCartPage.error('REMOVE_ITEM_ERROR', error);
      }
    };
    
    // Enhanced quantity update function with debugging
    const handleUpdateQuantity = (itemId, itemName, currentQuantity, newQuantity) => {
      debugCartPage.userAction('QUANTITY_UPDATE_CLICKED', {
        itemId: itemId,
        itemName: itemName,
        currentQuantity: currentQuantity,
        newQuantity: newQuantity,
        quantityChange: newQuantity - currentQuantity
      });
      try {
        updateQuantity(itemId, newQuantity);
        debugCartPage.log('QUANTITY_UPDATE_SUCCESS', {
          itemId,
          itemName,
          newQuantity
        });
      } catch (error) {
        debugCartPage.error('QUANTITY_UPDATE_ERROR', error);
      }
    };

  if (cartItems.length === 0) {
    debugCartPage.log('EMPTY_CART_DISPLAYED', 'Showing empty cart message');
    return (
      <div className="cart-page">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <span>Cart</span>
          </div>
          
          <h1 className="cart-title">Shopping Cart</h1>
          
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/shop" className="btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <span>Cart</span>
        </div>
        
        <h1 className="cart-title">Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                </div>
                
                <div className="cart-controls">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.name, item.quantity, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.name, item.quantity, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id, item.name)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
                            <span>Shipping:</span>
                            <span>${getCartShipping().toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>${(getCartTotal() + getCartShipping()).toFixed(2)}</span>
                        </div>
            <Link to="/checkout" className="checkout-btn btn">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;