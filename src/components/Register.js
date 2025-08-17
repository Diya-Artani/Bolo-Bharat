import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/Auth.css'; 

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/welcome'); 
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please login or use a different email.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Registration failed. Please try again.');
            }
            console.error("Error registering:", error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register for Bolo Bharat</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="reg-email" className="input-label">Email Address</label>
                    <input 
                        id="reg-email"
                        type="email" 
                        placeholder="Enter your email address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="auth-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="reg-password" className="input-label">Password</label>
                    <input 
                        id="reg-password"
                        type="password" 
                        placeholder="Choose a secure password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="auth-input"
                    />
                </div>
                <button type="submit" className="auth-button">Register</button>
            </form>
            <p className="auth-text">
                Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
        </div>
    );
};

export default Register;
