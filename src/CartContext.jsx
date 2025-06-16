import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

// Debug utility for cart operations
const debugCart = {
  log: (action, data) => {
    console.group(`🛒 CART DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ CART ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  state: (cartItems) => {
    console.group('📊 CART STATE');
    console.log('Items count:', cartItems.length);
    console.log('Total items:', cartItems.reduce((sum, item) => sum + item.quantity, 0));
    console.log('Total value:', cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    console.log('Items:', cartItems);
    console.groupEnd();
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // Debug state changes
  useEffect(() => {
    debugCart.state(cartItems);
  }, [cartItems]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      debugCart.log('LOADING_FROM_LOCALSTORAGE', 'Attempting to load cart from localStorage');
      const savedCart = localStorage.getItem('paradoxlabs-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        debugCart.log('CART_LOADED_FROM_LOCALSTORAGE', {
          itemCount: parsedCart.length,
          items: parsedCart
        });
        setCartItems(parsedCart);
      } else {
        debugCart.log('NO_SAVED_CART', 'No cart found in localStorage');
      }
    } catch (error) {
      debugCart.error('LOCALSTORAGE_LOAD_ERROR', error);
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      debugCart.log('SAVING_TO_LOCALSTORAGE', {
        itemCount: cartItems.length,
        items: cartItems
      });
      localStorage.setItem('paradoxlabs-cart', JSON.stringify(cartItems));
    } catch (error) {
      debugCart.error('LOCALSTORAGE_SAVE_ERROR', error);
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    debugCart.log('ADD_TO_CART_INITIATED', {
      product: product,
      quantity: quantity,
      productId: product?.id,
      productName: product?.name,
      productPrice: product?.price
    });
    
    if (!product || !product.id) {
      debugCart.error('ADD_TO_CART_INVALID_PRODUCT', 'Product is missing or has no ID');
      return;
    }
    
    if (quantity <= 0) {
      debugCart.error('ADD_TO_CART_INVALID_QUANTITY', `Invalid quantity: ${quantity}`);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        debugCart.log('UPDATING_EXISTING_ITEM', {
          productId: product.id,
          oldQuantity: existingItem.quantity,
          addingQuantity: quantity,
          newQuantity: existingItem.quantity + quantity
        });
        // If item already exists, update quantity
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        debugCart.log('ADDING_NEW_ITEM', {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          price: product.price
        });
        // If item doesn't exist, add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    debugCart.log('REMOVE_FROM_CART_INITIATED', {
      productId: productId
    });
    
    if (!productId) {
      debugCart.error('REMOVE_FROM_CART_INVALID_ID', 'Product ID is missing');
      return;
    }
    
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        debugCart.log('REMOVING_ITEM', {
          productId: productId,
          productName: itemToRemove.name,
          quantity: itemToRemove.quantity,
          price: itemToRemove.price
        });
      } else {
        debugCart.error('ITEM_NOT_FOUND_FOR_REMOVAL', `Product ID ${productId} not found in cart`);
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    debugCart.log('UPDATE_QUANTITY_INITIATED', {
      productId: productId,
      newQuantity: newQuantity
    });
    
    if (!productId) {
      debugCart.error('UPDATE_QUANTITY_INVALID_ID', 'Product ID is missing');
      return;
    }
    
    if (newQuantity <= 0) {
      debugCart.log('QUANTITY_ZERO_OR_NEGATIVE', 'Removing item due to zero/negative quantity');
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      if (existingItem) {
        debugCart.log('UPDATING_ITEM_QUANTITY', {
          productId: productId,
          oldQuantity: existingItem.quantity,
          newQuantity: newQuantity,
          quantityChange: newQuantity - existingItem.quantity
        });
      } else {
        debugCart.error('ITEM_NOT_FOUND_FOR_UPDATE', `Product ID ${productId} not found in cart`);
      }
      
      return prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const clearCart = () => {
    debugCart.log('CLEAR_CART_INITIATED', {
      itemsBeforeClearing: cartItems.length,
      totalValueCleared: getCartTotal()
    });
    setCartItems([]);
    debugCart.log('CART_CLEARED', 'Cart has been cleared successfully');
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      debugCart.log('CALCULATING_ITEM_TOTAL', {
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        itemTotal: itemTotal
      });
      return total + itemTotal;
    }, 0);
    
    debugCart.log('CART_TOTAL_CALCULATED', {
      totalItems: cartItems.length,
      cartTotal: total
    });
    
    return total;
  };

  const getCartShipping = () => {
    if (cartItems.length === 0) {
      debugCart.log('SHIPPING_CALCULATION', 'No items in cart, shipping = 0');
      return 0;
    }
    
    const shipping = cartItems.reduce((total, item) => {
      const itemShipping = item.shipping || 0;
      debugCart.log('CALCULATING_ITEM_SHIPPING', {
        productId: item.id,
        productName: item.name,
        shipping: itemShipping
      });
      return total + itemShipping;
    }, 0);
    
    debugCart.log('TOTAL_SHIPPING_CALCULATED', {
      totalShipping: shipping
    });
    
    return shipping;
  };

  const getCartItemCount = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    debugCart.log('CART_ITEM_COUNT', {
      uniqueItems: cartItems.length,
      totalQuantity: count
    });
    return count;
  };

  const isInCart = (productId) => {
    const inCart = cartItems.some(item => item.id === productId);
    debugCart.log('CHECKING_IF_IN_CART', {
      productId: productId,
      isInCart: inCart
    });
    return inCart;
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    const quantity = item ? item.quantity : 0;
    debugCart.log('GET_ITEM_QUANTITY', {
      productId: productId,
      quantity: quantity,
      found: !!item
    });
    return quantity;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartShipping,
    getCartItemCount,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};