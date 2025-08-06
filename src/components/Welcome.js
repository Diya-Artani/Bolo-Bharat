import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Welcome.css'; // Import the shared CSS file

const Welcome = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/user-details'); // Redirect to the User Details Form page
    };

    return (
        <div className="welcome-container">
            <h2>Welcome to Bolo Bharat !</h2>
            <p>Thank you for registering. Here’s a quick guide on how to report grievances and what steps will be taken to resolve them:</p>
            
            <div className="steps-container">
                <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Get Started</h3>
                        <p>Click on the "Get Started" button to begin.</p>
                    </div>
                </div>
                <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Fill in Personal Details</h3>
                        <p>Provide your name, email, phone, address, and other necessary details.</p>
                    </div>
                </div>
                <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Choose Domain</h3>
                        <p>Select the relevant domain for your grievance.</p>
                    </div>
                </div>
                <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Describe the Problem</h3>
                        <p>Write a detailed description of the problem you're facing.</p>
                    </div>
                </div>
                <div className="step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                        <h3>Submit Your Grievance</h3>
                        <p>Submit the grievance and it will be saved in our database.</p>
                    </div>
                </div>
                <div className="step">
                    <div className="step-number">6</div>
                    <div className="step-content">
                        <h3>Analysis & Resolution</h3>
                        <p>Your grievance will be analyzed, and steps will be taken to address and resolve your issue in a timely manner.</p>
                    </div>
                </div>
            </div>
            
            <button onClick={handleGetStarted} className="auth-button">Get Started</button>
        </div>
    );
};

export default Welcome;
