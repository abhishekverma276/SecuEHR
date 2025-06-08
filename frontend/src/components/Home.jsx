import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Dashboard = () => {
    const [backgroundStyle, setBackgroundStyle] = useState({
        background: 'linear-gradient(135deg, #16222A, #3A6073)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
    });

    useEffect(() => {
        const newBackgroundStyle = {
            background: 'linear-gradient(135deg, #16222A, #3A6073)',
            minHeight: '105vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px',
        };
        setBackgroundStyle(newBackgroundStyle);
    }, []);

    const navigationButtons = [
        { name: 'Patients', link: '/patients' },
        { name: 'Doctors/Practitioners', link: '/doctors' },
        { name: 'Medical Records', link: '/healthrecords' },
        { name: 'User Management', link: '/medicaldocuments' },
        { name: 'Appointments', link: '/appointments' },
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
            <h1 style={{ color: '#fff', fontSize: '36px', marginBottom: '30px' }}>Welcome to SecuEHR Admin Dashboard !</h1>
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

export default Dashboard;