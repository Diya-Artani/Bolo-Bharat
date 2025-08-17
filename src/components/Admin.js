import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
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

    // Chart data for domains
    const [chartDataDomain, setChartDataDomain] = useState({
        labels: [],
        datasets: [
            {
                label: 'Number of Complaints by Domain',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ],
    });

    // Chart data for status
    const [chartDataStatus, setChartDataStatus] = useState({
        labels: [],
        datasets: [
            {
                label: 'Number of Complaints by Status',
                data: [],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            }
        ],
    });

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
                            ...userGrievances[grievanceId]
                        });
                    });
                });

                const sortedGrievances = allGrievances.sort((a, b) =>
                    (b.timestamp || 0) - (a.timestamp || 0)
                );

                setGrievances(sortedGrievances);
                // Re-apply current filters after data update
                let filtered = sortedGrievances;
                if (searchTerm) {
                    filtered = filtered.filter(grievance =>
                        (grievance.problem || '').toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                if (filterCategory) {
                    filtered = filtered.filter(grievance => {
                        const domain = (grievance.domain || '').toLowerCase().trim();
                        const filter = filterCategory.toLowerCase().trim();
                        return domain && domain === filter;
                    });
                }
                if (filterStatus) {
                    filtered = filtered.filter(grievance => (grievance.status || 'Pending') === filterStatus);
                }
                setFilteredGrievances(filtered);
                updateChartData(sortedGrievances);
            } else {
                setGrievances([]);
                setFilteredGrievances([]);
                setChartDataDomain({ labels: [], datasets: [{ ...chartDataDomain.datasets[0], data: [] }] });
                setChartDataStatus({ labels: [], datasets: [{ ...chartDataStatus.datasets[0], data: [] }] });
            }
        }, (error) => {
            console.error("Error fetching grievances: ", error);
        });

        return () => unsubscribe();
        // eslint-disable-next-line
    }, [searchTerm, filterCategory, filterStatus]);

    const updateChartData = (data) => {
        const domainCount = {};
        const statusCount = {};

        data.forEach(grievance => {
            domainCount[grievance.domain] = (domainCount[grievance.domain] || 0) + 1;
            const status = grievance.status || 'Pending';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        setChartDataDomain({
            labels: Object.keys(domainCount),
            datasets: [
                {
                    label: 'Number of Complaints by Domain',
                    data: Object.values(domainCount),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }
            ],
        });

        setChartDataStatus({
            labels: Object.keys(statusCount),
            datasets: [
                {
                    label: 'Number of Complaints by Status',
                    data: Object.values(statusCount),
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                }
            ],
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
        })
            .then(() => {
                console.log(`Grievance ${id} updated to ${status}`);
            })
            .catch(error => {
                console.error("Error updating grievance: ", error);
            });
    };

    const handleFilter = () => {
        let filtered = grievances;

        if (searchTerm) {
            filtered = filtered.filter(grievance =>
                (grievance.problem || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory) {
            filtered = filtered.filter(grievance => (grievance.domain || '') === filterCategory);
        }

        if (filterStatus) {
            filtered = filtered.filter(grievance => (grievance.status || 'Pending') === filterStatus);
        }

        setFilteredGrievances(filtered);
    };


    return (
        <div className = "admin-container">
            <h2 className="admin-heading">Grievance Chart</h2>

            {/* Chart for Domain */}
            <div className="chart-card">
                <div className="chart-title">Complaints by Domain</div>
                <Bar
                    data={chartDataDomain}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#0F4C81',
                                    font: { size: 16, weight: 'bold', family: 'Segoe UI, sans-serif' }
                                }
                            },
                            tooltip: {
                                backgroundColor: '#0F4C81',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: '#1D4E89',
                                borderWidth: 1,
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
                            },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {
                                    color: '#e3eafc',
                                    borderColor: '#b6c6e3',
                                    borderWidth: 2,
                                },
                                ticks: {
                                    color: '#1D4E89',
                                    font: { size: 14, family: 'Segoe UI, sans-serif' }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: '#e3eafc',
                                    borderColor: '#b6c6e3',
                                    borderWidth: 2,
                                },
                                ticks: {
                                    color: '#1D4E89',
                                    font: { size: 14, family: 'Segoe UI, sans-serif' }
                                }
                            },
                        },
                        elements: {
                            bar: {
                                borderRadius: 10,
                                backgroundColor: (context) => {
                                    const colors = [
                                        '#0F4C81', '#1D4E89', '#1597BB', '#FBC02D', '#E65100', '#388E3C', '#3949AB', '#D84315', '#00838F', '#AD1457', '#512DA8', '#0288D1', '#cc0000', '#1b5e20', '#004d40', '#616161'
                                    ];
                                    return colors[context.dataIndex % colors.length];
                                },
                                // No hoverBackgroundColor
                                borderSkipped: false
                            }
                        },
                        animation: {
                            duration: 900,
                            easing: 'easeOutElastic'
                        }
                    }}
                />
            </div>

            {/* Chart for Status */}
            <div className="chart-card">
                <div className="chart-title">Complaints by Status</div>
                <Bar
                    data={chartDataStatus}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#E65100',
                                    font: { size: 16, weight: 'bold', family: 'Segoe UI, sans-serif' }
                                }
                            },
                            tooltip: {
                                backgroundColor: '#E65100',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: '#FBC02D',
                                borderWidth: 1,
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
                            },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {
                                    color: '#fff3e0',
                                    borderColor: '#ffe0b2',
                                    borderWidth: 2,
                                },
                                ticks: {
                                    color: '#E65100',
                                    font: { size: 14, family: 'Segoe UI, sans-serif' }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: '#fff3e0',
                                    borderColor: '#ffe0b2',
                                    borderWidth: 2,
                                },
                                ticks: {
                                    color: '#E65100',
                                    font: { size: 14, family: 'Segoe UI, sans-serif' }
                                }
                            },
                        },
                        elements: {
                            bar: {
                                borderRadius: 10,
                                backgroundColor: (context) => {
                                    const colors = [
                                        '#E65100', '#FBC02D', '#0F4C81', '#1D4E89', '#1597BB', '#388E3C', '#3949AB', '#D84315', '#00838F', '#AD1457', '#512DA8', '#0288D1', '#cc0000', '#1b5e20', '#004d40', '#616161'
                                    ];
                                    return colors[context.dataIndex % colors.length];
                                },
                                // No hoverBackgroundColor
                                borderSkipped: false
                            }
                        },
                        animation: {
                            duration: 900,
                            easing: 'easeOutElastic'
                        }
                    }}
                />
            </div>

        
            <h2 className="admin-heading">Grievances</h2>
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Search by problem"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
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

                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="">Filter by Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Being Studied">Being Studied</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button onClick={handleFilter}>Apply Filters</button>
            </div>

            {filteredGrievances.length > 0 ? (
                filteredGrievances.map(grievance => (
                    <div key={grievance.id} className="grievance-card">
                        <div className="grievance-header">
                            <h3>Grievance ID: {grievance.id}</h3>
                            <span className={`status-badge ${grievance.status?.toLowerCase()}`}>
                                {grievance.status || 'Pending'}
                            </span>
                        </div>

                        <div className="grievance-details">
                            <div className="user-details">
                                <h4>User Information</h4>
                                <p><strong>Name:</strong> {grievance.userDetails?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {grievance.userDetails?.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {grievance.userDetails?.phone || 'N/A'}</p>
                            </div>

                            <div className="complaint-details">
                                <strong>Domain:</strong>
                                <span
                                    className="domain-badge"
                                    data-domain={
                                        grievance.domain
                                            ? grievance.domain.trim()
                                                .replace(/\s+/g, ' ')
                                                .replace(/\b\w/g, c => c.toUpperCase())
                                            : ''
                                    }
                                >
                                    {grievance.domain || 'No Domain'}
                                </span>
                                <div className="complaint-info">
                                    <h4>Complaint Information</h4>
                                    <p><strong>Problem Title:</strong> {grievance.problem}</p>
                                    <p><strong>Description:</strong> {grievance.description}</p>
                                    <p><strong>Language:</strong> {grievance.language}</p>
                                    <p><strong>Submitted:</strong> {new Date(grievance.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-actions">
                            <div className="status-buttons">
                                <button
                                    className={`status-btn ${grievance.status === 'Being Studied' ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(grievance.id, 'Being Studied')}
                                >Being Studied</button>
                                <button
                                    className={`status-btn ${grievance.status === 'In Progress' ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(grievance.id, 'In Progress')}
                                >In Progress</button>
                                <button
                                    className={`status-btn ${grievance.status === 'Under Review' ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(grievance.id, 'Under Review')}
                                >Under Review</button>
                                <button
                                    className={`status-btn ${grievance.status === 'Resolved' ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(grievance.id, 'Resolved')}
                                >Resolved</button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-grievances">No complaint by this domain.</p>
            )}
        </div>
    );
};

export default Admin;