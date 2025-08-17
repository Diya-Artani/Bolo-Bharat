import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig'; 
import { ref, remove, getDatabase } from 'firebase/database';
import Login from './components/Login';
import Register from './components/Register';
import Welcome from './components/Welcome';
import GrievanceForm from './components/GrievanceForm';
import UserDetails from './components/UserDetails';
import DomainSelection from './components/DomainSelection';
import GrievanceConfirmation from './components/GrievanceConfirmation';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import ForgetPassword from './components/ForgetPassword';

import './App.css';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      auth.signOut()
        .then(() => {
          setUser(null);
          navigate('/login');
        })
        .catch(err => console.error("Logout error:", err));
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmDelete = window.confirm("This will permanently delete your account and all your data. Are you sure?");
    if (!confirmDelete) return;

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return alert("No user logged in");

      const db = getDatabase();
      const userRef = ref(db, `users/${uid}`);
      await remove(userRef);

      await auth.currentUser.delete();

      setUser(null);
      navigate('/register');
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Account deletion error:", err);
      alert("Failed to delete account. You may need to re-login and try again.");
    }
  };

  return (
    <nav className="navbar">
      <ul>
        <li><a href="/welcome">Home</a></li>
        <li><a href="/domain-selection">Report</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        {user && (
          <>
            <li><a href="/logout" onClick={handleLogout}>Logout</a></li>
            <li><a href="/delete-account" onClick={handleDeleteAccount} style={{color: '#ff4444'}}>Delete Account</a></li>
          </>
        )}
      </ul>
    </nav>
  );
};

const Layout = ({ children, user, setUser }) => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register", "/admin"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}
      {children}
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Bolo Bharat - Grievance Reporting System</h1>
          <p>"Empowering a billion dreams through innovation and development."</p>
        </header>

        <main>
          <Layout user={user} setUser={setUser}>
            <Routes>
              <Route path="/" element={<Navigate to="/register" />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/welcome" element={<Welcome user={user} />} />
              <Route path="/user-details" element={<UserDetails user={user} />} />
              <Route path="/domain-selection" element={<DomainSelection user={user} setDomain={setSelectedDomain} />} />
              <Route path="/report" element={<GrievanceForm user={user} selectedDomain={selectedDomain} />} />
              <Route path="/confirmation" element={<GrievanceConfirmation />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </main>

        <footer className="App-footer">
          <p>© 2025 Bolo Bharat . All Rights Reserved.</p>
          <div className="footer-icons">
            <img src="/images/Flag.svg" alt="Indian Flag" />
            <img src="/images/handshake.jpg" alt="Handshake Icon" />
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
