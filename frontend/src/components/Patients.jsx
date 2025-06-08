import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    firstname: '',
    lastname: '',
    age: '',
    regDate: '',
    contact: '',
    disease: '',
  });
  const [editablePatientId, setEditablePatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const result = await axios.get('http://localhost:3001/patients');
        setPatients(result.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const handleAddPatient = async () => {
    try {
      await axios.post('http://localhost:3001/patients', newPatient);
      setNewPatient({
        firstname: '',
        lastname: '',
        age: '',
        regDate: '',
        contact: '',
        disease: '',
      });
      const result = await axios.get('http://localhost:3001/patients');
      setPatients(result.data);
      setShowAddPatientForm(false);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const handleEdit = (id) => {
    console.log(`Editing patient with ID: ${id}`);
    setEditablePatientId(id);
  };

  const handleSave = async (id) => {
    console.log(`Saving patient with ID: ${id}`);
    setEditablePatientId(null);

    // Find the patient to be edited in the local state
    const editedPatient = patients.find((patient) => patient._id === id);

    try {
      // Make the PUT request to update the patient in the backend
      await axios.put(`http://localhost:3001/patients/${id}`, editedPatient);

      // Fetch the updated list of patients after editing
      const result = await axios.get('http://localhost:3001/patients');
      setPatients(result.data);
    } catch (error) {
      console.error('Error editing patient:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log(`Deleting patient with ID: ${id}`);
    try {
      await axios.delete(`http://localhost:3001/patients/${id}`);
      const result = await axios.get('http://localhost:3001/patients');
      setPatients(result.data);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const navigate = useNavigate();

  // Filter patients by name based on the search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="container-fluid p-0"
      style={{
        background: 'linear-gradient(45deg, #654321, #3e2723)',
        minHeight: '110vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Link
        to={
          localStorage.getItem('role') === 'Admin'
            ? '/home'
            : localStorage.getItem('role') === 'Patient'
            ? '/patdash'
            : '/docdash'
        }
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      >
        <button className="btn btn-primary">Dashboard</button>
      </Link>
      <h2 className="text-center mb-3" style={{ color: 'white' }}>
        Patient Records
      </h2>

      <div
        className="mb-4 p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          width: '80%',
          overflowX: 'auto',
        }}
      >
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Add Patient</h3>
        {showAddPatientForm && (
          <div className="row">
            <div className="col">
              <input
                type="text"
                value={newPatient.firstname}
                onChange={(e) => setNewPatient({ ...newPatient, firstname: e.target.value })}
                placeholder="First Name"
                className="form-control mb-3"
              />
              <input
                type="text"
                value={newPatient.lastname}
                onChange={(e) => setNewPatient({ ...newPatient, lastname: e.target.value })}
                placeholder="Last Name"
                className="form-control mb-3"
              />
              <input
                type="text"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                placeholder="Age"
                className="form-control mb-3"
              />
            </div>
            <div className="col">
              <input
                type="text"
                value={newPatient.regDate}
                onChange={(e) => setNewPatient({ ...newPatient, regDate: e.target.value })}
                placeholder="Reg. Date(DD/MM/YYYY)"
                className="form-control mb-3"
              />
              <input
                type="text"
                value={newPatient.contact}
                onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                placeholder="Contact"
                className="form-control mb-3"
              />
              <input
                type="text"
                value={newPatient.disease}
                onChange={(e) => setNewPatient({ ...newPatient, disease: e.target.value })}
                placeholder="Diagnosis"
                className="form-control mb-3"
              />
            </div>
          </div>
        )}
        <button onClick={() => setShowAddPatientForm((prev) => !prev)} className="btn btn-primary" style={{ width: '100%' }}>
          {showAddPatientForm ? 'Cancel' : 'Add Patient Record'}
        </button>
        {showAddPatientForm && (
          <button onClick={handleAddPatient} className="btn btn-primary mt-3" style={{ width: '100%' }}>
            Add Patient
          </button>
        )}
      </div>

      <div
        className="mb-4 p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          width: '80%',
          overflowX: 'auto',
        }}
      >
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center' }}>
          <h3 style={{ color: 'white', marginRight: '20px' }}>Patient Entries</h3>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ width: '200px' }}
          />
        </div>
        <table className="table" style={{ color: 'white', overflowY: 'auto', maxHeight: '500px' }}>
          <thead>
            <tr>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Age</th>
              <th>Reg. Date</th>
              <th>Contact</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient._id}>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.firstname}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, firstname: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.firstname
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.lastname}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, lastname: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.lastname
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.age}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, age: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.age
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.regDate}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, regDate: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.regDate
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.contact}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, contact: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.contact
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <input
                      type="text"
                      value={patient.disease}
                      onChange={(e) => {
                        const updatedPatient = { ...patient, disease: e.target.value };
                        setPatients((prevPatients) =>
                          prevPatients.map((p) => (p._id === patient._id ? updatedPatient : p))
                        );
                      }}
                    />
                  ) : (
                    patient.disease
                  )}
                </td>
                <td>
                  {editablePatientId === patient._id ? (
                    <button className="btn btn-success" onClick={() => handleSave(patient._id)}>
                      Save
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleEdit(patient._id)}>
                      Edit
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleDelete(patient._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsPage;