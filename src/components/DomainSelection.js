import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set } from "firebase/database";
import { db } from '../firebaseConfig';
import '../CSS/DomainSelection.css';

const DomainSelection = ({ user, setDomain }) => {
    const domains = [
        "Health", "Education", "Environment", "Infrastructure", "Transport", 
        "Electricity", "Water Supply", "Sanitation", "Agriculture", 
        "Public Safety", "Employment", "Social Welfare", "Housing", 
        "Technology", "Finance", "Others"
    ];

    const navigate = useNavigate();

    const handleDomainClick = (domain) => {
        if (typeof setDomain === 'function') {
            setDomain(domain);
        } else {
            console.error("setDomain is not a function");
        }

        const domainRef = ref(db, `users/${user.uid}/selectedDomain`);
        set(domainRef, { domain })
            .then(() => {
                console.log("Domain selection saved!");
                navigate('/report', { state: { selectedDomain: domain } });
            })
            .catch((error) => {
                console.error("Error saving domain selection: ", error);
            });
    };

    return (
        <div className="domain-selection-container">
            <h2>Select a Domain</h2>
            <div className="domain-buttons">
                {domains.map((domain, index) => (
                    <button key={index} onClick={() => handleDomainClick(domain)} className="domain-button">
                        {domain}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DomainSelection;
