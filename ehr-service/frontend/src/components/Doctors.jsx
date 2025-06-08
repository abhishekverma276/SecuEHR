import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    specialization: '',
    location: '',
    contact: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
  
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/doctors');
        if (isMounted) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
  
    fetchDoctors();
  
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFormFieldChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleFormSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3001/doctors/${selectedDoctor._id}`, formData);
      } else {
        await axios.post('http://localhost:3001/doctors', formData);
      }
  
      // After submitting the form, update the doctors state with the latest data
      const response = await axios.get('http://localhost:3001/doctors');
      setDoctors(response.data);
  
      setShowForm(false);
      setIsEditMode(false);
      setSelectedDoctor(null);
      setFormData({
        id: '',
        name: '',
        specialization: '',
        location: '',
        contact: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Server response data:', error.response.data);
        console.error('Server response status:', error.response.status);
        console.error('Server response headers:', error.response.headers);
      }
    }
  };
  
    

  const handleEditDoctor = (selectedDoctor) => {
    // Set the form data and update state for edit mode
    setFormData({
      id: selectedDoctor.id,
      name: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      location: selectedDoctor.location,
      contact: selectedDoctor.contact,
    });

    setSelectedDoctor(selectedDoctor);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await axios.delete(`http://localhost:3001/doctors/${doctorId}`);
      // Update the doctors state after deletion
      setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor._id !== doctorId));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Server response data:', error.response.data);
        console.error('Server response status:', error.response.status);
        console.error('Server response headers:', error.response.headers);
      }
    }
  };
  
  
  

  const isAdmin = localStorage.getItem('role') === 'Admin';

  const canEditDelete = isAdmin ? true : false;

  const filteredDoctors = doctors
    .filter((doctor) => doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortConfig) {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
      }
      return 0;
    });

  return (
    <div style={{ background: 'linear-gradient(to right, #232526, #414345)', color: '#ffffff', padding: '20px', minHeight: '100vh' }}>
      <Link
        to={isAdmin ? '/home' : localStorage.getItem('role') === 'Patient' ? '/patdash' : '/docdash'}
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      >
        <button className="btn btn-primary">Dashboard</button>
      </Link>
      <h1 style={{ textAlign: 'center', margin: '60px 0', color: 'white'}}>Doctor & Practitioner Records</h1>

      {/* Button to toggle the form */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            className="btn btn-success"
            onClick={() => setShowForm((prevShowForm) => !prevShowForm)}
          >
            {showForm ? 'Hide Form' : 'Add Doctor'}
          </button>
        </div>
      )}

      {/* Form to add a new doctor */}
      {showForm && isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60%', backgroundColor: '#2e2e2e', padding: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form>
              <div className="row mb-3">
                <div className="col">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleFormFieldChange('id', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormFieldChange('name', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label>Department:</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleFormFieldChange('specialization', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label>Qualification:</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleFormFieldChange('location', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label>Contact:</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleFormFieldChange('contact', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFormSubmit}
                style={{ width: '100%' }}
              >
                {isEditMode ? 'Save Changes' : 'Add Doctor'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Department"
          style={{ padding: '10px', width: '50%', borderRadius: '5px', maxWidth: '400px' }}
        />
      </div>
      <div style={{ height: '20px' }}></div>
      <div style={{ height: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ffffff' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ backgroundColor: '#1e1e1e', cursor: 'pointer', padding: '10px' }}>
                ID
              </th>
              <th onClick={() => handleSort('name')} style={{ backgroundColor: '#1e1e1e', cursor: 'pointer', padding: '10px' }}>
                Name
              </th>
              <th onClick={() => handleSort('specialization')} style={{ backgroundColor: '#1e1e1e', cursor: 'pointer', padding: '10px' }}>
                Department
              </th>
              <th onClick={() => handleSort('location')} style={{ backgroundColor: '#1e1e1e', cursor: 'pointer', padding: '10px' }}>
                Qualification
              </th>
              <th onClick={() => handleSort('contact')} style={{ backgroundColor: '#1e1e1e', cursor: 'pointer', padding: '10px' }}>
                Contact
              </th>
              {canEditDelete && <th style={{ backgroundColor: '#1e1e1e', padding: '10px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor, index) => (
              <tr key={index} style={index % 2 === 0 ? { backgroundColor: '#333333' } : { backgroundColor: '#2e2e2e' }}>
                <td style={{ padding: '10px' }}>{doctor.id}</td>
                <td style={{ padding: '10px' }}>{doctor.name}</td>
                <td style={{ padding: '10px' }}>{doctor.specialization}</td>
                <td style={{ padding: '10px' }}>{doctor.location}</td>
                <td style={{ padding: '10px' }}>{doctor.contact}</td>
                {canEditDelete && (
                  <td>
                    <button
                      className="btn btn-info btn-sm mr-2"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDoctor(doctor._id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorsPage;