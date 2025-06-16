import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the cart context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0); // Add cartCount state
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);
  
  // Update localStorage and calculate total whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Calculate cart total
    const total = cartItems.reduce((sum, item) => {
      if (item.type === 'subscription') {
        return sum + (item.oneTimePrice || 0);
      } else {
        return sum + (item.price * (item.quantity || 1));
      }
    }, 0);
    
    setCartTotal(total);
    
    // Calculate cart count (total number of items)
    const count = cartItems.reduce((sum, item) => {
      return sum + (item.quantity || 1);
    }, 0);
    
    setCartCount(count);
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        i => i.id === item.id && i.type === item.type
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity || 1) + (item.quantity || 1)
        };
        
        return updatedItems;
      } else {
        // Add new item with quantity of at least 1
        return [...prevItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id, type) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.type === type))
    );
  };
  
  // Update item quantity
  const updateQuantity = (id, type, quantity) => {
    if (quantity < 1) {
      removeFromCart(id, type);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };
  
  // Value to be provided by the context
  const value = {
    cartItems,
    cartTotal,
    cartCount, // Add cartCount to the context value
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};