import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/Auth.css'; // Import the shared CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Check if the user is admin
            if (email === 'admin@bolobharat.com') {
                navigate('/admin');
            } else {
                // Redirect regular users to the UserDetails page
                navigate('/user-details');
            }
        } catch (error) {
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/invalid-login-credentials'
            ) {
                setError('No account found with this email. Please register first.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Login failed. Please try again.');
            }
            console.error("Error logging in:", error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Welcome Back</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="email" className="input-label">Email Address</label>
                    <input 
                        id="email"
                        type="email" 
                        placeholder="Enter your email address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="auth-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password" className="input-label">Password</label>
                    <input 
                        id="password"
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="auth-input"
                    />
                </div>
                <button type="submit" className="auth-button">
                    Sign In
                </button>
            </form>
            <p className="auth-text">
                New to Bolo Bharat? <Link to="/register" className="auth-link">Create Account</Link>
            </p>
        </div>
    );
};

export default Login;
