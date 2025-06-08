import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowAnimation(true);

    axios
      .post('https://secuehrbackend.vercel.app/login', { email, password, role }) // Updated URL
      .then((result) => {
        console.log(result);
        if (result.data === 'Success') {
          console.log('Login Success');
          localStorage.setItem('role', role); // Store the role in local storage
          if (role === 'Admin') {
            navigate('/home');
          } else if (role === 'Patient') {
            navigate('/patdash');
          } else if (role === 'Doctor') {
            navigate('/docdash');
          }
        } else {
          setLoginError(true);
          setShowAnimation(false);
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        setLoginError(true);
        setShowAnimation(false);
      });
  };

  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 1000);
    }
  }, [showAnimation]);

  return (
    <div className="login-background">
      <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
        <h2 className="mb-3 text-primary">SecuEHR Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label htmlFor="exampleInputEmail1" className="form-label">
              <strong>Email-Id</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="form-control"
              id="exampleInputEmail1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label htmlFor="exampleInputPassword1" className="form-label">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="form-control"
              id="exampleInputPassword1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label htmlFor="role" className="form-label">
              <strong>Role</strong>
            </label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">Select your role</option>
              <option value="Admin">Admin</option>
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        {loginError && (
          <div className="alert alert-danger mt-3" role="alert">
            Incorrect Credentials! Please try again.
          </div>
        )}
        {showAnimation && (
          <div className="my-3 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <p className="container my-2">©️SecuEHR</p>
        {/*<Link to='/register' className="btn btn-secondary">Register</Link> */}
      </div>
    </div>
  );
};

export default Login;
