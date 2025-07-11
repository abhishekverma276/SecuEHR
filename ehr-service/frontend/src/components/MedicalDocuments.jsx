import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    background: 'linear-gradient(to right, #2c3e50, #4a4e4d)',
    padding: '40px',
    borderRadius: '8px', // Slightly increased border-radius
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '115vh',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)', // Enhanced shadow
  },
  heading: {
    color: 'white',
    fontSize: '40px', // Slightly larger font size
    marginBottom: '25px', // Increased margin
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // Added text shadow
  },
  button: {
    padding: '14px 25px', // Slightly larger padding
    backgroundColor: '#003366', // Darker blue
    color: 'white',
    borderRadius: '10px', // More rounded button
    marginBottom: '15px', // Increased margin
    marginTop: '40px', // Increased top margin
    transition: 'background-color 0.3s ease, transform 0.2s ease', // Added transform for hover effect
    cursor: 'pointer',
    border: 'none', // Removed border
  },
  buttonHover: {
    backgroundColor: '#004080', // Darker blue on hover
    transform: 'scale(1.05)', // Slightly scale up on hover
  },
  table: {
    width: '100%',
    borderCollapse: 'separate', // Changed to separate for rounded corners on cells
    borderSpacing: '0 8px', // Space between rows
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#f2f2f2',
    padding: '18px', // Increased padding
    textAlign: 'left',
    color: '#333',
    fontWeight: 'bold',
    textTransform: 'uppercase', // Uppercase column headers
  },
  td: {
    padding: '18px', // Increased padding
    borderBottom: '1px solid #555', // Darker border
    color: 'white',
    backgroundColor: '#334455', // Slightly darker background for cells
  },
  trHover: {
    backgroundColor: '#4a5b6c', // Darker hover background for rows
  },
  input: {
    padding: '14px', // Slightly larger padding
    marginBottom: '25px', // Increased margin
    width: '30%', // Slightly wider input
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxShadow: 'inset 0px 1px 3px rgba(0, 0, 0, 0.1)', // Inner shadow
  },
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredButton, setHoveredButton] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Optionally, add user-friendly error feedback here
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Dependency array includes fetchUsers

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Memoize filteredUsers to prevent unnecessary re-calculations
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div style={styles.container}>
      <Link to="/home" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
        <button
          style={{ ...styles.button, ...(hoveredButton ? styles.buttonHover : {}) }}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
        >
          Dashboard
        </button>
      </Link>
      <h1 style={styles.heading}>User Management</h1>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={styles.input}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email-ID</th>
            <th style={styles.th}>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id} style={styles.tdHover} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.trHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ ...styles.td, textAlign: 'center' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;