import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styling/Home.css";
import HowItWorks from "./HowItWorks";
import policeImage from "../assets/police.webp";
import martialart from "../assets/martial-art.png";
import safestRoute from "../assets/SafestRoute.jpg";
import contacts from "../assets/Contacts.png";
import { useAuth } from "../contexts/authcontexts";
import { doSignOut } from "/public/firebase/auth";
import { FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import logo from "../assets/logo.png";
import emailjs from '@emailjs/browser';
import { getContactsForUser } from "../../public/firebase/firestore";
import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db, messaging, auth } from "../../public/firebase/firebase";
import { px } from "framer-motion";
import Police from "./Police";

const VAPID_KEY = "BGW68i2ezvS1bhwJ7iryaxsSW_RBSPK3a42MwRCN2p2cyv2m6XwzG39Fr7NwA7FkCUqpJVMLXvmsh2cTUniqT2s"; // Replace with your actual VAPID key
const FCM_SERVER_KEY = "AIzaSyCDGPZk78NR4fJa6nlSLDEn1oGwOo46FsI"; // 🔴 Use this ONLY for testing, never expose in production

const Home = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const watchIdRef = useRef(null);
  const audioRef = useRef(new Audio("/alert.mp3"));

  const handleLogout = async () => {
    await doSignOut();
    navigate("/");
  };

  const playAlertSound = () => {
    const audio = audioRef.current;
    audio.play();
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 10000);
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchToken = async () => {
      try {
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
        });
        if (token) {
          await setDoc(doc(db, "fcmTokens", currentUser.uid), { token });
          console.log("FCM token stored:", token);
        } else {
          console.log("No token available.");
        }
      } catch (err) {
        console.error("Failed to get FCM token:", err);
      }
    };

    fetchToken();
  }, [currentUser]);


const sendEmergencyEmails = async (lat, lng) => {
  try {
    const contacts = await getContactsForUser();
    if (!contacts || contacts.length === 0) {
      console.error("No contacts found to send email.");
      return;
    }

    const locationUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `🚨 Emergency Alert!\n\nThis is an Emergency message from your contact. They may be in danger.\nLive location: ${locationUrl}`;

    for (const contact of contacts) {
      console.log("Sending email to:", contact.email);
      
      if (!contact.email) {
        console.warn("Skipping contact with no email:", contact.name || "Unknown");
        continue;
      }
      
      const templateParams = {
        to_email: contact.email,
        to_name: contact.name || "Emergency Contact",
        message: message,
        
      };

      try {
        const response = await emailjs.send(
          'service_0jl43vb',     
          'template_k3xphyo',    
          templateParams,
          '-qRVAHvOcCPGmJl9m'    
        );
        console.log(`Email sent to ${contact.email} successfully:`, response.status);
      } catch (emailError) {
        console.error(`Failed to send email to ${contact.email}:`, emailError);
        // Continue with other contacts even if one fails
      }
    }

    console.log("Emergency email process completed.");
  } catch (error) {
    console.error("Failed to send emails:", error);
    throw error; // Rethrow to allow caller to handle the error
  }
};

  const sendFCMNotification = async (lat, lng) => {
    try {
      // Get the contacts and their FCM tokens from Firestore
      const contacts = await getContactsForUser(); // Assuming this gets an array of contact objects with FCM tokens
      if (!contacts || contacts.length === 0) {
        console.error("No contacts found.");
        return;
      }

      const message = `Emergency! I need help. My location: https://maps.google.com/?q=${lat},${lng}`;

      // Filter contacts to ensure all have fcmToken
      const validTokens = contacts
        .filter(contact => contact.fcmToken)
        .map(contact => contact.fcmToken);

      if (validTokens.length === 0) {
        console.error("No valid FCM tokens found.");
        return;
      }

      const payload = {
        notification: {
          title: "Emergency Alert",
          body: message,
        },
        tokens: validTokens,  // FCM tokens of the contacts
      };

      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `key=${FCM_SERVER_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("FCM response:", data);
    } catch (error) {
      console.error("Error sending notification via FCM:", error);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        await setDoc(doc(db, "liveLocations", uid), {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString(),
        });

        if (!emergencyActive) {
          sendFCMNotification(latitude, longitude);
          sendEmergencyEmails(latitude,longitude)
        }
      },
      (err) => {
        console.error("Location error:", err);
        alert(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };

  const handleEmergencyToggle = () => {
    if (!emergencyActive) {
      startTracking();
    } else {
      stopTracking();
    }
    setEmergencyActive((prev) => !prev);
  };

  return (
    <div className="durlassa-wrapper">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={logo} alt="DURLASSA Logo" height={100} width={500} />
          </div>
          <div className="navbar-buttons">
            {userLoggedIn ? (
              <div className="user-dropdown">
                <img
                  src={currentUser?.photoURL || logo}
                  alt={currentUser?.displayName || "User"}
                  className="avatar-img"
                />
                <div className="dropdown-menu">
                  <p>{currentUser?.displayName}</p>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/Login">
                  <button className="login-btn">Login</button>
                </Link>
                <Link to="/SignUp">
                  <button className="signup-btn">Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
     

      <section className="hero-section">
        <h2 className="tagline">Your Safety, Our Priority</h2>
        <button
          onClick={handleEmergencyToggle}
          className={`sos-button ${emergencyActive ? "active" : ""}`}
        >
          {emergencyActive ? "Stop Emergency" : "Activate Emergency"}
        </button>
      </section>

      <section className="features-section">
        {[{
          title: "Find Nearby Police Stations",
          image: policeImage,
          details: [
            "Locate nearest police stations",
            "Get directions instantly",
            "View station contact details",
          ],
          buttonText: "Find Nearby Police Stations",
          buttonAction: "/police",
        }, {
          title: "Find Safest Route",
          image: safestRoute,
          details: [
            "Green-route indicates safest path",
            "Yellow-route for moderate safety",
            "View unsafe area indicators",
          ],
          buttonText: "Find Safest Route",
          buttonAction: "/safest-route",
        }, {
          title: "Self-Defence Training",
          image: martialart,
          details: [
            "Learn self-defense techniques",
            "Develop situational awareness",
            "Boost confidence and mental resilience",
          ],
          buttonText: "Learn Self-Defence",
          buttonAction: "/courses",
        }, {
          title: "Emergency Contacts",
          image: contacts,
          details: [
            "Save trusted emergency contacts",
            "Instant notifications during danger",
            "Alerts via SMS, call, and notifications",
          ],
          buttonText: "Add Contacts",
          buttonAction: "/Contacts",
        }].map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="card-top">
              <img src={feature.image} alt={feature.title} />
            </div>
            <div className="card-middle">
              <ul>
                {feature.details.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card-bottom">
              {feature.buttonAction !== "#" ? (
                <Link to={feature.buttonAction} className="police-btn-link">
                  <button className="police-btn">{feature.buttonText}</button>
                </Link>
              ) : (
                <button className="police-btn">{feature.buttonText}</button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">How DURLASSA Works</h2>
        <HowItWorks />
      </section>
        <section className="fitness-section">
  <h2 className="section-title">Self-Defense & Fitness</h2>
  <div className="fitness-content">
    
    <div className="fitness-description">
      <p>
        Learn essential self-defense techniques and boost your physical fitness
        to stay confident and prepared. Our curated content includes video
        tutorials, expert advice, and workout plans tailored for women's safety.
      </p>
    </div>
    <div className="fitness-reviews">
      <h3>What Our Users Say</h3>
      <ul>
        <li>"These videos really helped me feel more confident walking alone!" - Aditi</li>
        <li>"Easy to follow and empowering exercises." - Priya</li>
        <li>"Loved the focus on real-life scenarios." - Neha</li>
      </ul>
    </div>
    <div className="fitness-contact">
      <h3>Have Questions or Feedback?</h3>
      <form>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="4" required></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
</section>

      <footer className="footer">
        <div className="footer-content">
          <h2 className="footer-logo">DURLASSA</h2>
          <p className="footer-tagline">Empowering Safety with Technology</p>

          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#helpline">Helpline</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-socials">
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaGithub /></a>
          </div>

          <p className="footer-copy">
            &copy; {new Date().getFullYear()} DURLASSA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
