import Home from './Home';
import Login from './Login';
import PatientsPage from './Patients';
import Register from './Register';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import DoctorsPage from './Doctors';
import DoctorDashboard from './docDash';
import PatientDashboard from './Patdash';
import HealthRecordPage from './Healthrecords';
import AppointmentBooking from './Appointments';
import MedicalDocuments from './MedicalDocuments';

function App() {

  return (
    <div style={{marginTop : '-3.5rem'}}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element ={<Register/>} />
          <Route path="/login" element ={<Login/>} />
          <Route path="/home" element ={<Home/>} />
          <Route path="/docdash" element ={<DoctorDashboard/>} />
          <Route path="/patdash" element ={<PatientDashboard/>} />
          <Route path="/healthrecords" element ={<HealthRecordPage/>} />
          <Route path="/appointments" element ={<AppointmentBooking/>} />
          <Route path="/Patients" element ={<PatientsPage/>} />
          <Route path="/Doctors" element ={<DoctorsPage/>} />
          <Route path="/medicaldocuments" element ={<MedicalDocuments/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
