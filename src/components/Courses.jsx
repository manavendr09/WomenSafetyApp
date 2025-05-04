import React,{ useState } from 'react';
import '../styling/Courses.css';
import { FaShieldAlt, FaDumbbell, FaMobileAlt, FaStar } from 'react-icons/fa';
import selfDefence from "../assets/selfdefence.jpg";


const Courses = () => {
  const [rating, setRating] = useState(0);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target['reviewer-name'].value;
    const text = e.target['review-text'].value;
    alert(`Thank you for your review, ${name}! Your ${rating}-star rating has been submitted.`);
    setRating(0);
    e.target.reset();
  };

  return (
    <div className="container">
      <section id="home" className="hero-section">
        <h2>Transform Your Life with Our Self-Defense Fitness Program</h2>
        <p>Learn practical self-defense techniques while getting fit and strong</p>
        <a href="#courses" className="btn">Explore Courses</a>
      </section>

      <section className="features">
        <div className="feature-card">
          <FaShieldAlt />
          <h3>Personal Safety Training</h3>
          <p>Learn essential self-defense techniques from certified instructors with real-world experience</p>
        </div>
        <div className="feature-card">
          <FaDumbbell />
          <h3>Fitness Programs</h3>
          <p>Customized workout plans combining martial arts, strength training, and cardio</p>
        </div>
        <div className="feature-card">
          <FaMobileAlt />
          <h3>24/7 Safety App</h3>
          <p>Integrated safety features with emergency alerts, location sharing, and quick response</p>
        </div>
      </section>

      <section id="courses">
        <h2 className="centered-title">Our Courses</h2>
        <div className="courses">
          {[
            {
              title: "Basic Self-Defense",
              desc: "Learn fundamental techniques for personal safety in everyday situations",
              duration: "4-week program • Beginner friendly",
              image: selfDefence 
            },
            {
              title: "Advanced Combat Fitness",
              desc: "Combine high-intensity fitness training with practical combat techniques",
              duration: "8-week program • Intermediate level",
              image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
              title: "Emergency Response Training",
              desc: "Master crisis management, quick response techniques, and situational awareness",
              duration: "6-week program • All levels",
              image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            }
          ].map((course, index) => (
            <div className="course-card" key={index}>
              <img src={course.image} alt={course.title} />
              <h3>{course.title}</h3>
              <p>{course.duration}</p>
              <p>{course.desc}</p>
              <a href="#" className="btn">Enroll Now</a>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="review-section">
        <h2 className="section-title">What Our Members Say</h2>
        <div className="reviews-container">
          {/* You could map through actual data here */}
        </div>

        <div className="add-review">
          <h3>Share Your Experience</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reviewer-name">Your Name</label>
              <input type="text" id="reviewer-name" required />
            </div>
            <div className="form-group">
              <label>Your Rating</label>
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={rating >= star ? 'active' : ''}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
              <input type="hidden" value={rating} required />
            </div>
            <div className="form-group">
              <label htmlFor="review-text">Your Review</label>
              <textarea id="review-text" required />
            </div>
            <button type="submit" className="btn">Submit Review</button>
          </form>
        </div>
      </section>

      <section id="contact" className="contact-form">
        <h2>Get in Touch</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Your Email" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="5" placeholder="Your Message" />
          </div>
          <button type="submit" className="btn">Send Message</button>
        </form>
      </section>

      <footer>
        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
        </div>
        <p>© 2025 Durlassa. All rights reserved.</p>
        <p>Stay Safe • Stay Strong</p>
      </footer>
    </div>
  );
};

export default Courses;
