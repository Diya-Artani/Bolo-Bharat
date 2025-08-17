import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import '../CSS/Dashboard.css';

const Dashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
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
                            ...userGrievances[grievanceId],
                            votes: userGrievances[grievanceId].votes || {}
                        });
                    });
                });
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

    const handleVote = (grievance) => {
        if (!userId) return alert("You must be logged in to vote.");
        if (grievance.userId === userId) return alert("You cannot vote on your own grievance.");

        const voteRef = ref(db, `grievances/${grievance.userId}/${grievance.id}/votes/${userId}`);
        update(voteRef, { voted: true });
    };

    const getStatusColor = (status) => {
        switch ((status || 'Pending').toLowerCase()) {
            case 'pending':
                return '#e61717ff';
            case 'being studied':
            case 'in progress':
                return '#f5810eff';
            case 'under review':
                return '#fbc02d'; 
            case 'resolved':
                return '#388e3c';
            default:
                return '#0F2547';
        }
    };

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
                        <p>
                            <strong>Status:</strong>{' '}
                            <span style={{ color: getStatusColor(grievance.status) }}>
                                {grievance.status || 'Pending'}
                            </span>
                        </p>
                        <p><strong>Submitted:</strong> {new Date(grievance.timestamp || grievance.lastUpdated).toLocaleString()}</p>
                        <p><strong>Votes:</strong> {Object.keys(grievance.votes || {}).length}</p>
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
                        <p><strong>Problem Title:</strong> {grievance.problem}</p>
                        <p><strong>Description:</strong> {grievance.description}</p>
                        <p><strong>Language:</strong> {grievance.language}</p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span style={{ color: getStatusColor(grievance.status) }}>
                                {grievance.status || 'Pending'}
                            </span>
                        </p>
                        <p><strong>Submitted:</strong> {new Date(grievance.timestamp || grievance.lastUpdated).toLocaleString()}</p>
                        <p><strong>Votes:</strong> {Object.keys(grievance.votes || {}).length}</p>
                        <button
                            className="vote-button"
                            onClick={() => handleVote(grievance)}
                            disabled={grievance.votes && grievance.votes[userId]}
                        >
                            {grievance.votes && grievance.votes[userId] ? "Voted" : "Vote"}
                        </button>
                    </div>
                ))
            ) : (
                <p className="no-grievances">No other grievances found.</p>
            )}
        </div>
    );
};

export default Dashboard;
