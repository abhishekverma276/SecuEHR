import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const AppointmentBooking = () => {

  const [formData, setFormData] = useState({
    patientName: '',
    appointmentDate: '',
    appointmentTime: '',
    age: '',
    gender: '',
    contactNumber: '',
  });

  const [, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsResponse = await axios.get('http://localhost:3001/appointments');
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAppointmentBooking = async (e) => {
    e.preventDefault();
    try {
      const newAppointment = { ...formData, status: 'scheduled' };
      const response = await axios.post('http://localhost:3001/appointments', newAppointment, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Appointment booked successfully:', response.data);

      // Update the state with the new data
      const updatedAppointments = await axios.get('http://localhost:3001/appointments');
      setAppointments(updatedAppointments.data);

      // Reset form data
      setFormData({
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        age: '',
        gender: '',
        contactNumber: '',
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

const handleDeleteAppointment = async (appointmentId) => {
    try {
      console.log(`Deleting appointment ${appointmentId}`);
  
      // Ensure that appointmentId is not undefined
      if (!appointmentId) {
        console.error('Invalid appointmentId:', appointmentId);
        return;
      }
  
      // Send DELETE request to remove the appointment
      await axios.delete(`http://localhost:3001/appointments/${appointmentId}`);
  
      console.log('Appointment deleted successfully');
  
      // Update the local state or refetch appointments
      const updatedAppointments = await axios.get('http://localhost:3001/appointments');
      setAppointments(updatedAppointments.data);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
};
  
const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      console.log(`Changing status of appointment ${appointmentId} to ${newStatus}`);
  
      // Ensure that appointmentId is not undefined
      if (!appointmentId) {
        console.error('Invalid appointmentId:', appointmentId);
        return;
      }
  
      // Send PUT request to update appointment status
      await axios.put(`http://localhost:3001/appointments/${appointmentId}`, { status: newStatus });
  
      console.log(`Appointment status changed to ${newStatus}`);
  
      // Update the local state or refetch appointments
      const updatedAppointments = await axios.get('http://localhost:3001/appointments');
      setAppointments(updatedAppointments.data);
    } catch (error) {
      console.error('Error changing appointment status:', error);
    }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return 'blue'; // Set your desired color for scheduled appointments
    case 'confirmed':
      return 'green'; // Set your desired color for confirmed appointments
    case 'canceled':
      return 'red'; // Set your desired color for canceled appointments
    case 'completed':
      return 'gray'; // Set your desired color for completed appointments
    default:
      return 'black';
  }
};

const handleDashboardClick = () => {
    const role = localStorage.getItem('role');
    if (role === 'Admin') {
      navigate('/home');
    } else if (role === 'Patient') {
      navigate('/patdash');
    } else if (role === 'Doctor') {
      navigate('/docdash');
    }
  };

  const role = localStorage.getItem('role');
  const patientName = localStorage.getItem('patientName');
  const headingText = role === 'Patient' ? 'Appointments' : role === 'Admin' ? 'Appointment Records' : 'Manage Appointments';
  const patientContactNumber = localStorage.getItem('patientContactNumber'); // Assuming you have a patient contact number in your storage

  const patientUpcomingAppointments = appointments.filter(
    (appointment) => appointment.patientName === patientName && new Date(appointment.appointmentDate) >= new Date()
  );

  //showing appointments for doctors
  const upcomingAppointments = appointments;

  let userAppointments;
  if (role === 'Patient') {
    userAppointments = patientUpcomingAppointments.filter(appointment => appointment.contactNumber === patientContactNumber);
  } else {
    userAppointments = upcomingAppointments;
  }

  return (
    <div style={{ background: 'linear-gradient(to right, #232526, #414345)', color: '#ffffff', padding: '20px', height: '100vh', overflowY: 'scroll' }}>
      <RouterLink to={role === 'Admin' ? '/home' : role === 'Patient' ? '/patdash' : '/docdash'}>
        <button
          style={{
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            border: '2px solid #1e1e1e',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            outline: 'none',
            transition: 'border-color 0.3s ease-out',
            marginTop: '60px',
            marginLeft: '10px',
          }}
          onClick={handleDashboardClick}
        >
          Dashboard
        </button>
      </RouterLink>
      <h1 style={{ textAlign: 'center', margin: '5px 0 0', color: 'white' }}>{headingText}</h1>
      {role !== 'Patient' && role !== 'Admin' && (
      <div className="mb-4 p-4" style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', width: '60%', marginLeft: 'auto', marginRight: 'auto', marginTop: '20px' }}>
        <h3 style={{ color: 'white', marginBottom: '10px', marginTop: '10px' }}>{role === 'Patient' ? ' New Appointment Details' : ' New Appointment Details'}</h3>
        <form onSubmit={handleAppointmentBooking}>
          <div className="row">
            <div className="col">
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Patient Name"
                className="form-control mb-3"
              />
                <input
                type="text"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                placeholder="Appointment Date(DD/MM/YYYY)"
                className="form-control mb-3"
              />
              <input
                type="text"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                placeholder="Appointment Time(hh:mm)"
                className="form-control mb-3"
              />
            </div>
            <div className="col">
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Age"
                className="form-control mb-3"
              />
              <input
                type="text"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                placeholder="Gender"
                className="form-control mb-3"
              />
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Contact Number"
                className="form-control mb-3"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px' }}>
            {role === 'Patient' ? 'Book Appointment' : 'Add Appointment'}
          </button>
        </form>
      </div>
      )}

      {/* For Doctors: Display Appointments */}
      {role === 'Doctor' && (
  <div style={{ marginTop: '20px' }}>
    <h2 style={{ textAlign: 'center', color: 'white' }}>Registered Appointments</h2>
    <table className="table table-striped" style={{ color: 'white' }}>
      <thead>
        <tr>
          <th>Patient Name</th>
          <th>Appointment Date</th>
          <th>Appointment Time</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Contact Number</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {userAppointments.map((appointment) => (
          <tr key={appointment._id}>
            <td>{appointment.patientName}</td>
            <td>{appointment.appointmentDate}</td>
            <td>{appointment.appointmentTime}</td>
            <td>{appointment.age}</td>
            <td>{appointment.gender}</td>
            <td>{appointment.contactNumber}</td>
            
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


{role === 'Admin' && (
  <div style={{ marginTop: '20px' }}>
    <table className="table table-striped" style={{ color: 'white' }}>
      <thead>
        <tr>
          <th>Patient Name</th>
          <th>Appointment Date</th>
          <th>Appointment Time</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Contact Number</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment) => (
          <tr key={appointment._id}>
            <td>{appointment.patientName}</td>
            <td>{appointment.appointmentDate}</td>
            <td>{appointment.appointmentTime}</td>
            <td>{appointment.age}</td>
            <td>{appointment.gender}</td>
            <td>{appointment.contactNumber}</td>
            <td>
              {appointment.status === 'scheduled' && (
                <>
                  <button className="btn btn-success btn-sm mr-2" onClick={() => handleStatusChange(appointment._id, 'confirmed')}>Confirm</button>
                  <button className="btn btn-danger btn-sm mr-2" onClick={() => handleStatusChange(appointment._id, 'canceled')}>Cancel</button>
                  <button className="btn btn-secondary btn-sm mr-2" onClick={() => handleStatusChange(appointment._id, 'completed')}>Complete</button>
                </>
              )}
              <button className="btn btn-warning btn-sm" onClick={() => handleDeleteAppointment(appointment._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      {/* For Patients: Appointments */}
      {role === 'Patient' && (
        <div style={{ marginTop: '20px' }}>
          {/* Upcoming Appointments */}
          <table className="table table-striped" style={{ color: 'white' }}>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Appointment Date</th>
                <th>Appointment Time</th>
                {/* Add more columns as needed */}
              </tr>
            </thead>
            <tbody>
              {userAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  {/* Display relevant appointment information for patients */}
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;