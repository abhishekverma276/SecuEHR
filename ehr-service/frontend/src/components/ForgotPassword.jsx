import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    axios.post('http://localhost:3002/api/auth/password-request', {
      email: emailOrUsername, // or username, depending on your Auth Service
    })
      .then(() => setMessage('Check your email for reset instructions.'))
      .catch(() => setError('Failed to send reset instructions.'));
  };

  return (
    <div className="login-background">
      <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
        <h2 className="mb-3 text-primary">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your email"
            className="form-control mb-3"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Send Reset Link</button>
        </form>
        {message && <div className="alert alert-success mt-3">{message}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;