import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const containerStyle = {
  background: 'linear-gradient(to right, #2c3e50, #4a4e4d)',
  padding: '40px',
  borderRadius: '5px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '115vh',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
};

const headingStyle = {
  color: 'white',
  fontSize: '37px',
  marginBottom: '20px',
  textAlign: 'center',
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#001F3F',
  color: 'white',
  borderRadius: '8px',
  marginBottom: '1px',
  marginTop: '35px',
  transition: 'background-color 0.3s ease',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #ddd', // Added border
};

const thStyle = {
  backgroundColor: '#f2f2f2',
  padding: '15px',
  textAlign: 'left',
  color: '#333',
};

const tdHoverStyle = {
  transition: 'background-color 0.3s ease',
};

const tdStyle = {
  padding: '15px',
  borderBottom: '1px solid #ddd',
  color: 'white', // Updated text color to white
};

const hoverEffect = {
  ':hover': {
    backgroundColor: '#f5f5f5',
  },
};

const inputStyle = {
  padding: '12px',
  marginBottom: '20px',
  width: '25%',
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <Link to="/home" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
        <button style={buttonStyle}>Dashboard</button>
      </Link>
      <h1 style={headingStyle}>User Management</h1>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={inputStyle}
      />

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email-ID</th>
            <th style={thStyle}>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id} style={tdHoverStyle}>
              <td style={{ ...tdStyle, ...hoverEffect }}>{user.name}</td>
              <td style={{ ...tdStyle, ...hoverEffect }}>{user.email}</td>
              <td style={{ ...tdStyle, ...hoverEffect }}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
