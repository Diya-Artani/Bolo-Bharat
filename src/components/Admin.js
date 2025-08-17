import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import '../CSS/Admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Admin = () => {
    const [grievances, setGrievances] = useState([]);
    const [filteredGrievances, setFilteredGrievances] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [chartDataDomain, setChartDataDomain] = useState({ labels: [], datasets: [{ label: '', data: [] }] });
    const [chartDataStatus, setChartDataStatus] = useState({ labels: [], datasets: [{ label: '', data: [] }] });

    useEffect(() => {
        const grievancesRef = ref(db, 'grievances');
        const unsubscribe = onValue(grievancesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const allGrievances = [];
                Object.keys(data).forEach(userId => {
                    const userGrievances = data[userId];
                    Object.keys(userGrievances).forEach(grievanceId => {
                        allGrievances.push({
                            id: grievanceId,
                            userId,
                            ...userGrievances[grievanceId],
                            votes: userGrievances[grievanceId].votes || {}   
                        });
                    });
                });

                const sortedGrievances = allGrievances.sort((a, b) =>
                    (b.timestamp || 0) - (a.timestamp || 0)
                );

                setGrievances(sortedGrievances);
                applyFilters(sortedGrievances);
                updateChartData(sortedGrievances);
            } else {
                setGrievances([]);
                setFilteredGrievances([]);
                setChartDataDomain({ labels: [], datasets: [{ ...chartDataDomain.datasets[0], data: [] }] });
                setChartDataStatus({ labels: [], datasets: [{ ...chartDataStatus.datasets[0], data: [] }] });
            }
        });

        return () => unsubscribe();
    }, [searchTerm, filterCategory, filterStatus]);

    const applyFilters = (grievancesList) => {
        let filtered = grievancesList;
        if (searchTerm) filtered = filtered.filter(g => (g.problem || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterCategory) filtered = filtered.filter(g => (g.domain || '') === filterCategory);
        if (filterStatus) filtered = filtered.filter(g => (g.status || 'Pending') === filterStatus);
        setFilteredGrievances(filtered);
    };

    const updateChartData = (data) => {
        const domainCount = {};
        const statusCount = {};
        data.forEach(g => {
            domainCount[g.domain] = (domainCount[g.domain] || 0) + 1;
            const status = g.status || 'Pending';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        setChartDataDomain({
            labels: Object.keys(domainCount),
            datasets: [{
                label: 'Number of Complaints by Domain',
                data: Object.values(domainCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        });

        setChartDataStatus({
            labels: Object.keys(statusCount),
            datasets: [{
                label: 'Number of Complaints by Status',
                data: Object.values(statusCount),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        });
    };

    const handleStatusChange = (id, status) => {
        const grievance = grievances.find(g => g.id === id);
        if (!grievance) return;

        const grievanceRef = ref(db, `grievances/${grievance.userId}/${id}`);
        update(grievanceRef, {
            status,
            lastUpdated: Date.now(),
            statusHistory: {
                timestamp: Date.now(),
                status: status,
                previousStatus: grievance.status || 'Pending'
            }
        });
    };

    const exportCSV = () => {
         if (!grievances.length) return alert("No grievances to export.");

         const headers = ["Domain","Problem Title","Description","Status","Submitted Date","Submitted Time","Votes"];
        const rows = grievances.map(g => {
        const date = g.timestamp ? new Date(g.timestamp) : new Date(g.lastUpdated);
        return [
            g.domain,
            g.problem,
            g.description,
            g.status || 'Pending',
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            Object.keys(g.votes || {}).length
        ];
    });

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "grievances.csv");
};

    return (
        <div className="admin-container">
            <h2 className="admin-heading">Grievance Chart</h2>

            <div className="chart-card">
                <div className="chart-title">Complaints by Domain</div>
                <Bar data={chartDataDomain} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="chart-card">
                <div className="chart-title">Complaints by Status</div>
                <Bar data={chartDataStatus} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="export-section">
                <button onClick={exportCSV} className="export-btn">Export CSV</button>
            </div>

            <h2 className="admin-heading">Grievances</h2>
            <div className="filter-section">
                <input type="text" placeholder="Search by problem" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                <select onChange={(e)=>setFilterCategory(e.target.value)} value={filterCategory}>
                    <option value="">Filter by Domain</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Transport">Transport</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Employment">Employment</option>
                    <option value="Social Welfare">Social Welfare</option>
                    <option value="Housing">Housing</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Others">Others</option>
                </select>
                <select onChange={(e)=>setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="">Filter by Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Being Studied">Being Studied</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </div>

            {filteredGrievances.length > 0 ? (
                filteredGrievances.map(g => (
                    <div key={g.id} className="grievance-card">
                        <div className="grievance-header">
                            <h3>Grievance ID: {g.id}</h3>
                            <span className={`status-badge ${g.status?.toLowerCase()}`}>{g.status || 'Pending'}</span>
                        </div>

                        <div className="grievance-details">
                            <div className="user-details">
                                <h4>User Information</h4>
                                <p><strong>Name:</strong> {g.userDetails?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {g.userDetails?.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {g.userDetails?.phone || 'N/A'}</p>
                            </div>

                            <div className="complaint-details">
                                <strong>Domain:</strong> <span className="domain-badge">{g.domain || 'No Domain'}</span>
                                <div className="complaint-info">
                                    <h4>Complaint Information</h4>
                                    <p><strong>Problem Title:</strong> {g.problem}</p>
                                    <p><strong>Description:</strong> {g.description}</p>
                                    <p><strong>Language:</strong> {g.language}</p>
                                    <p><strong>Submitted:</strong> {new Date(g.timestamp).toLocaleString()}</p>
                                    <p><strong>Votes:</strong> {Object.keys(g.votes || {}).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-actions">
                            <div className="status-buttons">
                                <button className={`status-btn ${g.status==='Being Studied'?'active':''}`} onClick={()=>handleStatusChange(g.id,'Being Studied')}>Being Studied</button>
                                <button className={`status-btn ${g.status==='In Progress'?'active':''}`} onClick={()=>handleStatusChange(g.id,'In Progress')}>In Progress</button>
                                <button className={`status-btn ${g.status==='Under Review'?'active':''}`} onClick={()=>handleStatusChange(g.id,'Under Review')}>Under Review</button>
                                <button className={`status-btn ${g.status==='Resolved'?'active':''}`} onClick={()=>handleStatusChange(g.id,'Resolved')}>Resolved</button>
                            </div>
                        </div>
                    </div>
                ))
            ) : <p className="no-grievances">No complaints found.</p>}
        </div>
    );
};

export default Admin;
