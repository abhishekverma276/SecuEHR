import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div>
      <div
        className="d-flex justify-content-center align-items-center text-center vh-100"
        style={{
          backgroundImage: 'url("welcomebg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-3 rounded" style={{ width: '50%' }}>
          {showWelcome ? (
            <div>
              <h2 className="mb-3 text-primary">Welcome to secuEHR</h2>
              <p className="container my-2">Kindly proceed to login:</p>
              <button type="button" className="btn btn-secondary" onClick={handleLoginClick}>
                Login
              </button>
            </div>
          ) : (
            <div>
              <h2 className="mb-3 text-primary">Register</h2>
              {/*registration form JSX goes here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
