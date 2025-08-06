import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database'; // Import necessary functions
import { Bar } from 'react-chartjs-2'; // Import Bar chart from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Import necessary Chart.js components
import '../CSS/Admin.css'; // Adjust the path as necessary

// Register Chart.js components
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
    const [filteredGrievances, setFilteredGrievances] = useState([]); // State for filtered grievances
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const [filterCategory, setFilterCategory] = useState(''); // Filter category
    const [filterStatus, setFilterStatus] = useState(''); // Filter status
    const [departments, setDepartments] = useState([]); // List of departments

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Number of Complaints by Domain',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Number of Complaints by Problem',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        const grievancesRef = ref(db, 'grievances'); // Reference to the grievances node
        const unsubscribe = onValue(grievancesRef, (snapshot) => {
            const data = snapshot.val();
            const grievancesData = data ? Object.keys(data).map(key => {
                const grievance = { id: key, ...data[key] };

                // Add fake data for problem, language, and votes if they are missing
                grievance.problem = grievance.problem || 'General Complaint'; // Default problem if missing
                grievance.language = grievance.language || 'English'; // Default to English if missing
                grievance.votes = grievance.votes || Math.floor(Math.random() * 100); // Random votes between 0-99 if missing

                return grievance;
            }) : [];
            
            setGrievances(grievancesData);
            setFilteredGrievances(grievancesData);
            updateChartData(grievancesData); // Call the function to update chart data
        }, (error) => {
            console.error("Error fetching grievances: ", error);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const updateChartData = (data) => {
        const domainCount = {};
        const problemCount = {};

        data.forEach(grievance => {
            domainCount[grievance.domain] = (domainCount[grievance.domain] || 0) + 1;
            problemCount[grievance.problem] = (problemCount[grievance.problem] || 0) + 1;
        });

        setChartData({
            labels: Object.keys(domainCount), // Domains as labels
            datasets: [
                {
                    label: 'Number of Complaints by Domain',
                    data: Object.values(domainCount), // Counts of each domain
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Number of Complaints by Problem',
                    data: Object.values(problemCount), // Counts of each problem
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        });
    };

    const handleStatusChange = (id, status) => {
        const grievanceRef = ref(db, `grievances/${id}`);
        update(grievanceRef, { status, lastUpdated: Date.now() }) // Adding lastUpdated timestamp
            .then(() => {
                console.log(`Grievance ${id} updated to ${status}`);
                // Optionally notify user or update UI
            })
            .catch(error => {
                console.error("Error updating grievance: ", error);
            });
    };

    const handleAssignDepartment = (id, department) => {
        const grievanceRef = ref(db, `grievances/${id}`);
        update(grievanceRef, { assignedDepartment: department })
            .then(() => {
                console.log(`Grievance ${id} assigned to ${department}`);
            })
            .catch(error => {
                console.error("Error assigning department: ", error);
            });
    };

    const handleFilter = () => {
        let filtered = grievances;

        if (searchTerm) {
            filtered = filtered.filter(grievance =>
                grievance.problem.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory) {
            filtered = filtered.filter(grievance => grievance.domain === filterCategory);
        }

        if (filterStatus) {
            filtered = filtered.filter(grievance => grievance.status === filterStatus);
        }

        setFilteredGrievances(filtered);
    };

    return (
        <div>
            <h2>Grievances</h2>

            {/* Filter Section */}
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Search by problem"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
                    <option value="">Filter by Category</option>
                    <option value="Finance">Finance</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Academics">Academics</option>
                </select>
                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="">Filter by Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Being Studied">Being Studied</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button onClick={handleFilter}>Apply Filters</button>
            </div>

            <Bar 
                data={chartData} 
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                        },
                        y: {
                            beginAtZero: true,
                        },
                    },
                }} 
            />

            {filteredGrievances.length > 0 ? (
                filteredGrievances.map(grievance => (
                    <div key={grievance.id} className="grievance-card">
                        <h3>Domain: {grievance.domain}</h3>
                        <p>Problem: {grievance.problem || 'General Complaint'}</p> {/* Default problem display */}
                        <p>Language: {grievance.language || 'N/A'}</p> {/* Display default language */}
                        <p>Votes: {grievance.votes || 0}</p> {/* Display default votes */}
                        <p>Status: {grievance.status || 'Pending'}</p>
                        <select onChange={(e) => handleAssignDepartment(grievance.id, e.target.value)}>
                            <option value="">Assign Department</option>
                            <option value="Finance">Finance</option>
                            <option value="Facilities">Facilities</option>
                            <option value="Academics">Academics</option>
                        </select>
                        <button onClick={() => handleStatusChange(grievance.id, 'Being Studied')}>Being Studied</button>
                        <button onClick={() => handleStatusChange(grievance.id, 'Accepted')}>Accepted</button>
                        <button onClick={() => handleStatusChange(grievance.id, 'Addressed')}>Addressed</button>
                        <button onClick={() => handleStatusChange(grievance.id, 'Resolved')}>Resolved</button>
                    </div>
                ))
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Admin;
