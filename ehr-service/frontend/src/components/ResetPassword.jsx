import { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    axios.post('http://localhost:3002/api/auth/reset-password', {
      email,
      token,
      newPassword,
    })
      .then(() => setMessage('Password reset successful!'))
      .catch(() => setError('Failed to reset password.'));
  };

  return (
    <div className="login-background">
      <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
        <h2 className="mb-3 text-primary">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-control mb-3"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter reset token"
            className="form-control mb-3"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            className="form-control mb-3"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Reset Password</button>
        </form>
        {message && <div className="alert alert-success mt-3">{message}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;