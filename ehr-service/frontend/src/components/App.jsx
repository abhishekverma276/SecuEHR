import Home from './Home';
import Login from './Login';
import PatientsPage from './Patients';
import Register from './Register';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorsPage from './Doctors';
import DoctorDashboard from './docDash';
import PatientDashboard from './Patdash';
import HealthRecordPage from './Healthrecords';
import AppointmentBooking from './Appointments';
import MedicalDocuments from './MedicalDocuments';
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <div style={{ marginTop: '-3.5rem' }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected admin route */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected doctor route */}
          <Route
            path="/docdash"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected patient route */}
          <Route
            path="/patdash"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Example: Protect other routes as needed */}
          <Route
            path="/healthrecords"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                <HealthRecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                <AppointmentBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Patients"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DoctorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicaldocuments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                <MedicalDocuments />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;