import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import '../CSS/Dashboard.css';

const Dashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Listen for auth state to get current user ID
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const grievancesRef = ref(db, 'grievances');
        const unsubscribe = onValue(grievancesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const allGrievances = [];
                Object.keys(data).forEach(userIdKey => {
                    const userGrievances = data[userIdKey];
                    Object.keys(userGrievances).forEach(grievanceId => {
                        allGrievances.push({
                            id: grievanceId,
                            userId: userIdKey,
                            ...userGrievances[grievanceId]
                        });
                    });
                });
                // Sort by timestamp
                const sortedGrievances = allGrievances.sort((a, b) =>
                    (b.timestamp || 0) - (a.timestamp || 0)
                );
                setGrievances(sortedGrievances);
            } else {
                setGrievances([]);
            }
        }, (error) => {
            console.error("Error fetching grievances: ", error);
        });
        return () => unsubscribe();
    }, []);

    // Split grievances into "mine" and "others"
    const myGrievances = grievances.filter(g => g.userId === userId);
    const otherGrievances = grievances.filter(g => g.userId !== userId);

    return (
        <div className="dashboard-container">
            <h2>My Grievances</h2>
            {myGrievances.length > 0 ? (
                myGrievances.map(grievance => (
                    <div key={grievance.id || grievance.timestamp} className="grievance-card">
                        <h3>Domain: {grievance.domain}</h3>
                        {grievance.userDetails?.name && (
                            <p><strong>Name:</strong> {grievance.userDetails.name}</p>
                        )}
                        <p><strong>Problem Title:</strong> {grievance.problem}</p>
                        <p><strong>Description:</strong> {grievance.description}</p>
                        <p><strong>Language:</strong> {grievance.language}</p>
                        <p><strong>Status:</strong> {grievance.status || 'Pending'}</p>
                        <p><strong>Submitted:</strong> {new Date(grievance.timestamp || grievance.lastUpdated).toLocaleString()}</p>
                    </div>
                ))
            ) : (
                <p className="no-grievances">No grievances found.</p>
            )}

            <h2 style={{ marginTop: "2.5rem" }}>Other Grievances</h2>
            {otherGrievances.length > 0 ? (
                otherGrievances.map(grievance => (
                    <div key={grievance.id || grievance.timestamp} className="grievance-card">
                        <h3>Domain: {grievance.domain}</h3>
                        {grievance.userDetails?.name && (
                            <p><strong>Name:</strong> {grievance.userDetails.name}</p>
                        )}
                        <p><strong>Problem Title:</strong> {grievance.problem}</p>
                        <p><strong>Description:</strong> {grievance.description}</p>
                        <p><strong>Language:</strong> {grievance.language}</p>
                        <p><strong>Status:</strong> {grievance.status || 'Pending'}</p>
                        <p><strong>Submitted:</strong> {new Date(grievance.timestamp || grievance.lastUpdated).toLocaleString()}</p>
                    </div>
                ))
            ) : (
                <p className="no-grievances">No other grievances found.</p>
            )}
        </div>
    );
};

export default Dashboard;