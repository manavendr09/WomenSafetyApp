import React, { useState } from 'react';
import "../auth/Login.css";
import { doSignInwithEmailAndPassword, doSignInWithGoogle } from "../../../public/firebase/auth";
import { useAuth } from "../../contexts/authcontexts";
import { Navigate, Link } from "react-router-dom";

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);

      try {
        await doSignInwithEmailAndPassword(email, password);
      } catch (error) {
        setErrorMessage(error.message);
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doSignInWithGoogle().catch((err) => {
        setErrorMessage(err.message);
        setIsSigningIn(false);
      });
    }
  };

  
  if (userLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Access your DURLASSA dashboard</p>

        <form className="login-form" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="login-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            🚀 Login
          </button>
          <button onClick={onGoogleSignIn} className="login-button" style={{ marginTop: "10px" }}>
            🔐 Sign in with Google
          </button>
        </form>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <p className="signup-link">
          Don’t have an account? <Link to="/SignUp">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
