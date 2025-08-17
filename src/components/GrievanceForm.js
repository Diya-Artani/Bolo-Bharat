import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, push, set, onValue } from 'firebase/database';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/GrievanceForm.css';

const GrievanceForm = ({ user }) => {
    const [formData, setFormData] = useState({
        problem: '',
        description: '',
        language: 'English',
        email: user?.email || ''
    });
    const [userDetails, setUserDetails] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.uid) {
            const userDetailsRef = ref(db, `userDetails/${user.uid}`);
            onValue(userDetailsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setUserDetails(data);
                }
            });
        }
    }, [user]);

    const selectedDomain = location.state?.selectedDomain || ''; 
    const submitGrievance = async (grievanceData) => {
        try {
            const grievancesRef = ref(db, `grievances/${grievanceData.userId}`);
            const newGrievanceRef = push(grievancesRef);
            await set(newGrievanceRef, { 
                ...grievanceData,
                timestamp: Date.now(),
                id: newGrievanceRef.key
            });
            
            console.log("Grievance submitted!");
            const token = newGrievanceRef.key;
            navigate('/confirmation', { state: { token, domain: selectedDomain } });
        } catch (error) {
            console.error("Error adding grievance: ", error);
            alert("Failed to submit grievance. Please try again.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!user || !user.uid) {
            alert("User not authenticated. Please log in.");
            return;
        }

        const grievanceData = {
            userId: user.uid,
            domain: selectedDomain,
            ...formData,
            votes: 0,
            status: 'Pending',
            timestamp: Date.now(),
            userDetails: {
                name: userDetails?.name || '',
                email: formData.email,
                phone: userDetails?.phone || ''
            }
        };

        submitGrievance(grievanceData);
     
        setFormData({
            problem: '',
            description: '',
            language: 'English',
            name: user?.displayName || '',
            email: user?.email || '',
            phoneNumber: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="grievance-form-container">
            <h2>Submit Your Grievance</h2>
            <form onSubmit={handleSubmit} className="grievance-form-form-container">
                <div className="user-info-display">
                    <h3>User Information</h3>
                    <p><strong>Name:</strong> {userDetails?.name || 'Loading...'}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Phone:</strong> {userDetails?.phone || 'Loading...'}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="problem">Problem Title:</label>
                    <input
                        type="text"
                        id="problem"
                        name="problem"
                        placeholder="Brief title of your issue"
                        value={formData.problem}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Detailed Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Provide a detailed description of your issue"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="language">Preferred Language:</label>
                    <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        required
                    >
                       
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="bengali">Bengali</option>
                        <option value="telugu">Telugu</option>
                        <option value="marathi">Marathi</option>
                        <option value="tamil">Tamil</option>
                        <option value="urdu">Urdu</option>
                        <option value="gujarati">Gujarati</option>
                        <option value="kannada">Kannada</option>
                        <option value="malayalam">Malayalam</option>
                        <option value="punjabi">Punjabi</option>
                        <option value="assamese">Assamese</option>
                        <option value="kashmiri">Kashmiri</option>
                        <option value="nepali">Nepali</option>
                        <option value="dogri">Dogri</option>
                        <option value="konkani">Konkani</option>
                        <option value="sindhi">Sindhi</option>
                        <option value="sanskrit">Sanskrit</option>
                    </select>
                </div>
                <button type="submit" className="submit-button">Submit Grievance</button>
            </form>
        </div>
    );
};

export default GrievanceForm;
