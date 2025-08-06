import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, push, set } from 'firebase/database'; // Ensure 'set' is imported from firebase/database
import { useLocation, useNavigate } from 'react-router-dom'; // For routing and navigation
import '../CSS/GrievanceForm.css';

const GrievanceForm = ({ user }) => {
    const [problem, setProblem] = useState('');
    const [language, setLanguage] = useState('English');
    const location = useLocation();
    const navigate = useNavigate(); // For programmatic navigation

    const selectedDomain = location.state?.selectedDomain || ''; // Retrieve selected domain from route state

    const submitGrievance = async (grievanceData) => {
        try {
            const grievancesRef = ref(db, `grievances/${grievanceData.userId}`); // Reference to the user's grievances
            const newGrievanceRef = push(grievancesRef); // Push a new grievance to the list, generating a unique key
            await set(newGrievanceRef, { ...grievanceData }); // Write data to the Realtime Database
            console.log("Grievance submitted!");
            const token = newGrievanceRef.key; // Get the unique key as the token
            navigate('/confirmation', { state: { token, domain: selectedDomain } }); // Redirect to confirmation page with token
        } catch (error) {
            console.error("Error adding grievance: ", error);
            alert("Failed to submit grievance. Please try again.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!user || !user.uid) {
            alert("User not authenticated. Please log in.");
            return; // Prevent form submission if user is not authenticated
        }

        const grievanceData = {
            userId: user.uid, // Use the authenticated user's ID
            domain: selectedDomain, // Use the selected domain
            problem,
            language,
            votes: 0
        };

        submitGrievance(grievanceData);
        setProblem('');
        setLanguage('English');
    };

    return (
        <div className="grievance-form-container">
            <h2>Submit Your Grievance</h2>
            <form onSubmit={handleSubmit} className="grievance-form">
                <div className="form-group">
                    <label htmlFor="problem">Describe Your Problem:</label>
                    <textarea
                        id="problem"
                        placeholder="Provide a detailed description of your issue"
                        onChange={(e) => setProblem(e.target.value)}
                        value={problem}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="language">Preferred Language:</label>
                    <select
                        id="language"
                        onChange={(e) => setLanguage(e.target.value)}
                        value={language}
                        required
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        {/* Add other languages as needed */}
                    </select>
                </div>
                <button type="submit" className="submit-button">Submit Grievance</button>
            </form>
        </div>
    );
};

export default GrievanceForm;
