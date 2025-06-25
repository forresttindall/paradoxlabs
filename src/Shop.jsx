import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom'
import './Shop.css';
import { CartContext } from './CartContext';

function Shop() {
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [addedToCart, setAddedToCart] = useState({});
    const { addToCart } = useContext(CartContext);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedToCart(prev => ({ ...prev, [product.id]: true }));
        
        // Reset the feedback after 2 seconds
        setTimeout(() => {
            setAddedToCart(prev => ({ ...prev, [product.id]: false }));
        }, 2000);
    };
    
    const products = [
        {
            id: 'marauder-mini-case',
            name: 'Marauder Mini Case',
            description: 'Translucent purple marauder case with gps antenna port',
            price: 18,
            image: '/Images/maraudercase.jpg',
            category: 'accessories',
            shipping: 7,
            inventory: 10
        },
        {
            id: 'stealth-usb',
            name: 'Stealth USB',
            description: 'Ultra-secure portable storage with military-grade encryption',
            price: 0,
            image: '/Images/_DSC1120.jpg',
            category: 'technology',
            shipping: 7,
            inventory: 0
        },
        {
            id: 'crux',
            name: 'Crux',
            description: 'Covert non-metalic ultra tough last ditch multi-tool',
            price: 20,
            image: '/Images/IMG_0136.jpg',
            category: 'tools',
            shipping: 7,
            inventory: 10
        },
    ];
    
    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'technology', name: 'Technology' },
        { id: 'accessories', name: 'Accessories' },
        { id: 'tools', name: 'Tools' },
    ];
    
    const filteredProducts = selectedCategory === 'all' 
        ? products 
        : products.filter(product => product.category === selectedCategory);
    
    return (
        <div className="shop-page">
            <div className="container">
                <div className="shop-header">
                    <h1>Shop</h1>
                    <p>Discover our complete range of leading-edge products</p>
                </div>
                
                <div className="shop-filters">
                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <Link to={`/product/${product.id}`} className="product-link">
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                    <div className="price">${product.price}</div>
                                </div>
                            </Link>
                            <div className="product-actions">
                                <button 
                                    className={`btn2 ${addedToCart[product.id] ? 'added-to-cart' : ''} ${product.inventory === 0 ? 'disabled' : ''}`}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={addedToCart[product.id] || product.inventory === 0}
                                >
                                    {addedToCart[product.id] ? 'Added!' : product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredProducts.length === 0 && (
                    <div className="no-products">
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shop;