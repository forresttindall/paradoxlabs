import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HeroSection from './HeroSection.jsx';
import FeaturedProducts from './FeaturedProducts.jsx';
import Shop from './Shop.jsx';
import ProductDetail from './ProductDetail.jsx';
import Cart from './Cart.jsx';
import Checkout from './Checkout.jsx';
import OrderConfirmation from './OrderConfirmation.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import PrivacyPolicy from './PrivacyPolicy.jsx';
import TermsOfService from './TermsOfService.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import NewsletterSignup from './NewsletterSignup.jsx';
import CallToAction from './CallToAction.jsx';
import { CartProvider } from './CartContext.jsx' ;


function App() {
    return (
        <CartProvider>
          <BrowserRouter>
          <div className="App">
            <Header />
            <Routes>
                <Route path="/" element={
                  <>
                    <HeroSection />
                    <FeaturedProducts />
                    <CallToAction />
                    <NewsletterSignup />
                  </>
                } />
                <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
            <Footer />
          </div>
          </BrowserRouter>
        </CartProvider>
    );
  }
  
  export default App;