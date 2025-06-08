import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

// Helper to decode JWT and extract role
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowAnimation(true);

    axios
      .post('http://localhost:3002/api/auth/login', {
        username: username,
        password: password,
      })
      .then((result) => {
        if (result.data && result.data.token) {
          // Store JWT token
          localStorage.setItem('token', result.data.token);

          // Decode JWT to get role
          const payload = parseJwt(result.data.token);
          const userRole = payload.role || payload.userRole || payload.type || '';

          localStorage.setItem('role', userRole);

          // Redirect based on role
          if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin') {
            navigate('/home');
          } else if (userRole.toLowerCase() === 'patient') {
            navigate('/patdash');
          } else if (userRole.toLowerCase() === 'doctor') {
            navigate('/docdash');
          } else {
            navigate('/home');
          }
        } else {
          setLoginError(true);
          setShowAnimation(false);
        }
      })
      .catch(() => {
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
            <label htmlFor="usernameInput" className="form-label">
              <strong>Username</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              className="form-control"
              id="usernameInput"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <p className="mt-3">
            <a href="/forgot-password">Forgot Password?</a>
          </p>
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
