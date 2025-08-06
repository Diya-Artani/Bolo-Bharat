import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, set } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import '../CSS/UserDetails.css';

const UserDetails = ({ user }) => {
    const [details, setDetails] = useState({
        name: '',
        email: user ? user.email : '',
        phone: '',
        state: '',
        address: '',
        postalCode: '',
        gender: '',
        age: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userDetailsRef = ref(db, `userDetails/${user.uid}`);
        set(userDetailsRef, details)
            .then(() => {
                console.log("User details saved!");
                navigate('/domain-selection'); // Navigate to the domain selection page
            })
            .catch((error) => {
                console.error("Error saving user details: ", error);
            });
    };

    return (
        <div className="user-details-container">
            <h2>Enter Your Details</h2>
            <form onSubmit={handleSubmit} className="user-details-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={details.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={details.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={details.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>State</label>
                    <input type="text" name="state" value={details.state} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={details.address} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Postal Code</label>
                    <input type="text" name="postalCode" value={details.postalCode} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={details.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Age</label>
                    <input type="number" name="age" value={details.age} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default UserDetails;
