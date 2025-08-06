import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';  // Import Firebase config
import { ref, onValue } from 'firebase/database';
import '../CSS/Dashboard.css'; // Ensure you have this CSS file for styling

const Dashboard = () => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        const userGrievancesRef = ref(db, 'grievances'); // Reference to the 'grievances' node in the DB
        const unsubscribe = onValue(userGrievancesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userGrievances = Object.keys(data).map(key => {
                    const grievance = { id: key, ...data[key] };

                    // Fake data for problem and votes, matching Admin.js
                    grievance.problem = grievance.problem || 'Default Problem Title'; // Default problem title
                    grievance.votes = grievance.votes || 5; // Default votes count

                    return grievance;
                });
                console.log(userGrievances); // Log the grievances to verify they are fetched correctly
                setGrievances(userGrievances);
            } else {
                console.log("No grievances found");
                setGrievances([]);
            }
        }, (error) => {
            console.error("Error fetching grievances: ", error);
        });

        return () => unsubscribe(); // Clean up the listener on component unmount
    }, []);

    return (
        <div className="dashboard-container">
            <h2>Your Grievances</h2>
            {grievances.length > 0 ? (
                grievances.map(grievance => (
                    <div key={grievance.id} className="grievance-card">
                        <h3>Domain: {grievance.domain}</h3>
                        <p>Problem: {grievance.problem}</p> {/* Default problem from fake data */}
                        <p>Votes: {grievance.votes}</p> {/* Default votes from fake data */}
                        <p>Status: {grievance.status || 'Pending'}</p>
                        <p>Last Updated: {grievance.lastUpdated ? new Date(grievance.lastUpdated).toLocaleString() : 'Not available'}</p>
                    </div>
                ))
            ) : (
                <p>No grievances found.</p>
            )}
        </div>
    );
};

export default Dashboard;
