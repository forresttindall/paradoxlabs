
import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedProducts.css';
import Testimonials from './Testimonials';


function FeaturedProducts() {
    const Logo = '/Images/logo.png';
    
    return(

    <section className="featured-products">
<div className="container">
    <h2>Featured Products</h2>
    <div className="products-grid">

    <Link to="/product/stealth-usb" className="product-link">
        <div className="product-card">
            <div className="product-image2">
                <img src="/Images/_DSC1120.jpg" alt="Product 1" />
            </div>
            <div className="product-info">
                <h3>Stealth USB</h3>
                <p className="product-spacer">Ultra-secure portable storage with military-grade encryption. - 128GB</p>
                <span className="price">$TBD</span>
            </div>
        </div>
        </Link>

        <Link to="/product/splice" className="product-link">
        <div className="product-card">
            <div className="product-image2">
                <img src="/Images/comingsoon.jpg" alt="Product 2" />
            </div>
            <div className="product-info">
                <h3>Splice</h3>
                <p className="product-spacer">Covert non-metalic ultra tough last ditch multi-tool</p>
                <span className="price">$TBD</span>
            </div>
        </div>
        </Link> 

        <Link to="/product/stickers" className="product-link">
        <div className="product-card">
            <div className="product-image2">
                <img src="/Images/marauder-case.jpg" alt="Product 2" />
            </div>
            <div className="product-info">
                <h3>Marauder Mini Case</h3>
                <p className="product-spacer">Translucent purple marauder with gps antenna port</p>
                <span className="price">$15</span>
            </div>
        </div>
        </Link> 

    </div>
    <div className="shop-btn">
    <Link to="/shop" className="btn">See All</Link>
    </div>
</div>
</section>

    );
}
export default FeaturedProducts;