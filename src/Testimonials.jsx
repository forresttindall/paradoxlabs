import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Solid encryption implementation. The hardware specs check out and it's been reliable for data transport. Does what it says on the tin.",
      name: "Marcus Chen",
      title: "Cybersecurity Consultant",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Stealth USB"
    },
    {
      text: "Non-metallic construction is clever. Passes through security without issues. Build quality is decent, gets the job done.",
      name: "Jake Morrison",
      title: "Field Operations Specialist",
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Splice Tool"
    },
    {
      text: "Good encryption standards, verified the implementation myself. The Splice tool has more functions than expected. Both work as advertised.",
      name: "David Thompson",
      title: "Security Professional",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Stealth USB + Splice Tool"
    },
    {
      text: "Tested it against our pen testing tools. Encryption held up well. Compact form factor works for travel scenarios.",
      name: "Connor Walsh",
      title: "IT Security Consultant",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Stealth USB"
    },
    {
      text: "TSA-friendly design is practical. Durability seems good so far. Has the functions I need for field work.",
      name: "Michael Torres",
      title: "Field Engineer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Splice Tool"
    },
    {
      text: "Build quality is solid. Software interface is straightforward, no bloat. The Splice tool consolidates several functions into one device.",
      name: "Ryan Foster",
      title: "Tech Security Reviewer",
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Stealth USB + Splice Tool"
    },
    {
      text: "Tested against other security devices. Good balance of security features and usability. Meets our requirements.",
      name: "Robert Kim",
      title: "Security Analyst",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Stealth USB"
    },
    {
      text: "Added it to my EDC rotation. Weight is reasonable, seems durable enough. Non-metallic design avoids security checkpoint hassles.",
      name: "Alex Park",
      title: "Operations Manager",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      product: "Splice Tool"
    }
  ];

  // Duplicate testimonials for seamless scrolling
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-container">
          <div className="testimonials-scroll">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="star-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                  <div className="product-tag">{testimonial.product}</div>
                  <p>"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="testimonials-cta">
          <h3>Ready to Upgrade Your Tech?</h3>
          <p>Discover cutting-edge tools and technology solutions for professionals</p>
          <a href="/shop" className="btn">
            Shop Now
          </a>
        </div>
    </div>
  );
};

export default Testimonials;