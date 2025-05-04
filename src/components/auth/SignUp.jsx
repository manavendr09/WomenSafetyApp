import React, { useState } from 'react';
import '../auth/SignUp.css';
import { docreateuserwithEmailAndPassword } from '../../../public/firebase/auth';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authcontexts';

const SignUp = () => {
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signingUp) {
      setSigningUp(true);
      try {
        await docreateuserwithEmailAndPassword(email, password);
      } catch (err) {
        setErrorMessage(err.message);
        setSigningUp(false);
      }
    }
  };

  if (userLoggedIn) {
    return <Navigate to="/Home" replace />;
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">🚀 Create Account</h2>
        <p className="signup-subtitle">Join the future of safety</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="signup-button">
            ⚡ Sign Up
          </button>
        </form>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
