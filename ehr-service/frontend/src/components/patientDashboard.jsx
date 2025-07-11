


import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { QuickAccessButtons } from './index';

const PatientDashboard = () => {
    const backgroundStyle = {
        background: 'linear-gradient(135deg, #16222A, #3A6073)',
        minHeight: '105vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
    };

    // Define patient-specific quick access buttons
    const patientQuickAccessButtons = [
        { name: 'Appointment Booking', link: '/book-appointment' },
        { name: 'Medical History', link: '/healthrecords' },
        { name: 'Prescriptions', link: '/prescriptions' },
        { name: 'Messages', link: '/messages' }
    ];

    // Define main navigation buttons
    const navigationButtons = [
        { name: 'My Appointments', link: '/appointments' },
        { name: 'My Health Records', link: '/healthrecords' },
        { name: 'Profile', link: '/profile' },
    ];

    const buttonStyle = {
        padding: '15px 30px',
        margin: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '5px',
        border: 'none',
        color: '#fff',
        background: '#007bff',
        textDecoration: 'none',
        transition: 'all 0.3s',
    };

    return (
        <div style={backgroundStyle}>
            <h1 style={{ color: '#fff', fontSize: '36px', marginBottom: '30px' }}>Welcome to Your SecuEHR Dashboard!</h1>
            
            {/* Quick Access Buttons for patients */}
            <QuickAccessButtons buttons={patientQuickAccessButtons} />
            
            <div className="button-container">
                {navigationButtons.map((button, index) => (
                    <Link key={index} to={button.link} className="btn" style={buttonStyle}>
                        {button.name}
                    </Link>
                ))}
            </div>
            <Link to='/login' className="btn" style={{ color: 'white', textDecoration: 'none', backgroundColor: 'red', padding: '10px 20px', marginTop: '20px' }}>Logout</Link>
            <p style={{ color: 'white', marginTop: '20px' }}>©️SecuEHR</p>
        </div>
    );
};

export default PatientDashboard;
