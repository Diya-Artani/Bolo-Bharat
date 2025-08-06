import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/Auth.css'; // Import the shared CSS file

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/welcome'); // Redirect to the Welcome page
        } catch (error) {
            console.error("Error registering:", error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register for Vikasit Bharat</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="auth-input"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="auth-input"
                />
                <button type="submit" className="auth-button">Register</button>
            </form>
            <p className="auth-text">
                Already have an account? <Link to="/" className="auth-link">Login!!!</Link>
            </p>
        </div>
    );
};

export default Register;
