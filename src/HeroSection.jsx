import React, { useState, useRef, useEffect } from 'react';
import './HeroSection.css';
import './App.css';


function HeroSection() {
    const Logo = '/Images/logo.png';
    const vantaRef = useRef(null);
    const vantaEffect = useRef(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };



    return (
        <>
            <section className="hero-section" ref={vantaRef} id="hero-section">
                <div className="hero-content">
                    <div className="hero-brand">
                        <img src={Logo} alt="logo" />
                        <h1 className="h1">Paradox Labs</h1>
                    </div>
                    <p className="p">Leading-Edge Technology & Covert Tools</p>
                    <a href="/shop" className="btn">Shop Now</a>
                </div>
            </section>
            
       
        </>
    );
}

export default HeroSection;