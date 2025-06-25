import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProductDetail.css';
import { CartContext } from './CartContext';

function ProductDetail() {
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  const { id } = useParams();
  const productId = id;
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useContext(CartContext);
    
    // Product data - in a real app, this would come from an API or context
    const products = {
        'stealth-usb': {
            id: 'stealth-usb',
            name: 'Stealth USB',
            price: 0,
            shipping: 7,
            shortDescription: 'Ultra-secure portable storage with military-grade encryption',
            fullDescription: 'The Stealth USB represents the pinnacle of secure portable storage technology. Engineered for professionals who demand absolute data security, this device combines AES-256 encryption with a stealth form factor. Whether you\'re a security professional, journalist, or anyone who values data privacy, the Stealth USB ensures your sensitive information remains protected against even the most sophisticated threats.',
            images: [
                '/Images/_DSC1120.jpg'
            ],
            specifications: {
                'Storage Capacity': '128GB',
                'Encryption': 'AES-256 Hardware Encryption',
                'Authentication': '256bit Encryption Key',
                'Operating System': 'Windows, macOS, Linux',
                'Interface': 'USB 3.2 Gen 1',
                'Data Transfer Rate': 'Up to 150 MB/s read, 80 MB/s write',
                'Operating Temperature': '-10°C to 60°C',
                'Storage Temperature': '-20°C to 85°C'
            },
            dimensions: {
                'Length': '58mm',
                'Width': '19mm',
                'Height': '9mm',
                'Weight': '12g'
            },
            features: [
                'Military-grade AES-256 encryption',
                'High-speed USB 3.2 Gen 1 interface', 
                'Tamper-evident design',
                'Zero-footprint operation',
                'Cross-platform compatibility'
            ],
            inventory: 0,
            category: 'storage'
        },
        'marauder-mini-case': {
            id: 'marauder-mini-case',
            name: 'Marauder Mini Case',
            price: 18,
            shipping: 7,
            shortDescription: 'Translucent purple marauder with gps antenna port',
            fullDescription: 'A transparent and durable case for your maurader mini device. Made from durable and lightweight translucent purple polymer',
            images: [
                '/Images/maraudercase.jpg'
            ],
            specifications: {
                'Material': 'Translucent Purple 100% infill PLA+'
            },
            dimensions: {
                'Length': '75mm',
                'Width': '39mm',
                'Height': '18mm',
                'Weight': '12g'
            },
            features: [
                'Translucent design',
                'Durable and lightweight',
                'Ergonomic grip'
            ],
            inventory: 10,
            category: 'accessories'
        },
        'crux': {
            id: 'crux',
            name: 'Crux',
            price: 20,
            shipping: 7,
            shortDescription: 'Covert non-metalic ultra tough last ditch multi-tool',
            fullDescription: 'The Crux is the ultimate covert multi-tool, designed for situations where traditional metal tools would be detected or confiscated. Crafted from advanced polymer composites, this tool passes through standard metal detectors while providing essential functionality when you need it most. Its ergonomic design and tactical applications make it an indispensable tool for security professionals and prepared individuals.\n\nThe concept for the Crux was born from necessity during a border crossing into Mexico, where all traditional metal tools had to be ditched at security checkpoints. Later that same trip, an unexpected encounter with a stranger in a narrow alleyway reinforced the critical need for a reliable, undetectable tool that could provide protection and utility when conventional options weren\'t available. This real-world experience shaped the Crux\'s design philosophy: a tool specifically engineered for travel through high-security areas where detection means confiscation, and where having something is the difference between vulnerability and preparedness.',
            images: [
                '/Images/IMG_0135.jpg',
                '/Images/IMG_0136.jpg'
            ],
            specifications: {
                'Material': 'Carbon Fiber Nylon',
                'Detection': 'Metal detector safe',
                'Durability': 'Impact resistant to 50J',
                'Temperature Range': '-40°C to 120°C',
                'Chemical Resistance': 'Resistant to most solvents'
            },
            dimensions: {
                'Overall Length': '170mm',
                'Blade Width': '30mm',
                'Thickness': '10mm',
                'Weight': '45g'
            },
            features: [
                'Non-metallic construction',

                'Ergonomic grip design',
                'Corrosion resistant',
                'Lightweight yet durable',
                'Discreet appearance'
            ],
            inventory: 10,
            category: 'tools'
        },
        'test': {
            id: 'test',
            name: 'test',
            price: 0.50,
            shipping: 0,
            shortDescription: 'Self-destructing storage device with biometric access',
            fullDescription: 'The Phantom Drive takes data security to the next level with its revolutionary self-destruct capability. This advanced storage device not only encrypts your data with military-grade algorithms but can also physically destroy itself on command or when tampered with. Perfect for intelligence operations, corporate espionage protection, or any scenario where data must never fall into the wrong hands.',
            images: [
                '/Images/product2.jpg',
                '/Images/product2.jpg',
                '/Images/product2.jpg'
            ],
            specifications: {
                'Storage Capacity': '64GB / 128GB / 256GB',
                'Encryption': 'AES-256 + Custom Algorithm',
                'Authentication': 'Dual Biometric + Voice Recognition',
                'Self-Destruct': 'Chemical + Thermal Destruction',
                'Trigger Methods': 'Remote, Timer, Tamper Detection',
                'Interface': 'USB-C 3.2 Gen 2',
                'Data Transfer Rate': 'Up to 300 MB/s read, 200 MB/s write',
                'Battery Life': '72 hours standby'
            },
            dimensions: {
                'Length': '85mm',
                'Width': '25mm',
                'Height': '12mm',
                'Weight': '28g'
            },
            features: [
                'Self-destruct mechanism',
                'Dual biometric authentication',
                'Remote destruction capability',
                'Tamper detection sensors',
                'Encrypted communication',
                'Emergency wipe function'
            ],
            inventory: 0,
            category: 'storage'
        },
        'stickers': {
            id: 'stickers',
            name: 'Sticker Pack',
            price: 15,
            shipping: 3,
            shortDescription: 'Premium vinyl sticker pack featuring 5 unique tech-themed designs',
            fullDescription: 'Express your passion for technology with this premium sticker pack featuring 5 carefully designed tech-themed stickers. Each sticker is crafted from high-quality vinyl material that resists fading, scratching, and weather damage. Perfect for laptops, tablets, phones, water bottles, or any surface you want to customize. These stickers are built to last with superior adhesive that won\'t leave residue when removed.',
            images: [
                '/Images/paradoxlabsgreen.jpg',
                '/Images/paradoxlabsgreen.jpg',
                '/Images/paradoxlabsgreen.jpg'
            ],
            specifications: {
                'Material': 'Premium Vinyl with UV Protection',
                'Quantity': '5 Unique Designs',
                'Adhesive Type': 'Removable, Residue-Free',
                'UV Resistance': 'Up to 5 Years Outdoor Use',
                'Water Resistance': 'Fully Waterproof',
                'Temperature Range': '-40°C to 80°C',
                'Finish': 'Matte with Scratch Protection',
                'Thickness': '3.2 mil (0.08mm)'
            },
            dimensions: {
                'Sticker Size Range': '50mm - 100mm',
                'Pack Dimensions': '120mm x 80mm',
                'Individual Thickness': '0.08mm',
                'Total Weight': '8g'
            },
            features: [
                'UV resistant vinyl construction',
                'Durable outdoor rated material',
                'Scratch and fade resistant',
                'Waterproof and weatherproof',
                'Removable without residue',
                '5 unique tech-themed designs'
            ],
            inventory: 0,
            category: 'accessories'
        }
    };
    
    const product = products[productId];
    
    if (!product) {
        return (
            <div className="product-not-found">
                <div className="container">
                    <h1>Product Not Found</h1>
                    <p>The product you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/shop')} className="btn">Back to Shop</button>
                </div>
            </div>
        );
    }
    
    const handleAddToCart = () => {
        if (quantity > 0) {
            addToCart(product, quantity);
            setAddedToCart(true);
            
            // Reset the feedback after 2 seconds
            setTimeout(() => {
                setAddedToCart(false);
            }, 2000);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        setQuantity(Math.max(0, parseInt(newQuantity) || 0));
    };
    
    return (
        <div className="product-detail">
            <div className="container">
                <div className="breadcrumb">
                    <button onClick={() => navigate('/shop')} className="breadcrumb-link">Shop</button>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">{product.name}</span>
                </div>
                
                <div className="product-layout">
                    <div className="product-images">
                        <div className="main-image">
                            <img src={product.images[selectedImage]} alt={product.name} />
                        </div>
                        <div className="image-thumbnails">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-short-desc">{product.shortDescription}</p>
                        <div className="product-price">${product.price}</div>
                        <div className="shipping-info">
                            Shipping: ${product.shipping}
                        </div>
                        
                        <div className="product-actions">
                            <div className="quantity-selector">
                                <label htmlFor="quantity">Quantity:</label>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        id="quantity" 
                                        value={quantity} 
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        className="quantity-input"
                                        min="0"
                                    />
                                    <button 
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleAddToCart}
                                className={`btn ${addedToCart ? 'added' : ''} ${quantity === 0 || product.inventory === 0 ? 'disabled' : ''}`}
                                disabled={addedToCart || quantity === 0 || product.inventory === 0}
                            >
                                {addedToCart ? 'Added!' : product.inventory === 0 ? 'Out of Stock' : quantity === 0 ? 'Select Quantity' : 'Add to Cart'}
                            </button>
                            
                            <div className="product-status">
                                <span className={`stock-status ${product.inventory > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.inventory > 0 ? `✓ In Stock: ${product.inventory}` : '✗ Out of Stock'}
                                </span>
                            </div>
                    </div>
                </div>
            </div>
            
            <div className="container">
                <div className="product-details-tabs">
                    <div className="tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('specifications')}
                        >
                            Specifications
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'dimensions' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('dimensions')}
                        >
                            Dimensions
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('features')}
                        >
                            Features
                        </button>
                    </div>
                    
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="tab-panel active">
                                <h3>Product Description</h3>
                                <p>{product.fullDescription}</p>
                            </div>
                        )}
                        
                        {activeTab === 'specifications' && (
                            <div className="tab-panel active">
                                <h3>Technical Specifications</h3>
                                <div className="specs-grid">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="spec-item">
                                            <span className="spec-label">{key}:</span>
                                            <span className="spec-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'dimensions' && (
                            <div className="tab-panel active">
                                <h3>Dimensions & Weight</h3>
                                <div className="dimensions-grid">
                                    {Object.entries(product.dimensions).map(([key, value]) => (
                                        <div key={key} className="dimension-item">
                                            <span className="dimension-label">{key}</span>
                                            <span className="dimension-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'features' && (
                            <div className="tab-panel active">
                                <h3>Key Features</h3>
                                <ul className="features-list">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="feature-item">{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default ProductDetail