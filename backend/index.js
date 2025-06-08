const cors = require('cors');
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const PatientModel = require('./models/Patient');
const FormDataModel = require('./models/FormData');
const DoctorModel = require('./models/Doctor');
const AppointmentModel = require('./models/Appointments.js');
const MedicalRecordModel = require('./models/healthrecords.js');
const { encrypt, decrypt } = require('./encryption'); // Import the encryption functions
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://secuehr.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

const loginAttempts = new Map();

app.get('/api/medical-documents', async (req, res) => {
  try {
    // Fetch medical documents from the database
    const documents = await MedicalDocumentModel.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const file = req.files.file;

    // Your logic to handle the uploaded file (save it to the server, update the database, etc.)
    // Example: Save the file to a folder on the server
    const uploadPath = __dirname + '/uploads/' + file.name;
    file.mv(uploadPath, function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      // File uploaded successfully, update the database or send a response
      res.json({ message: 'File uploaded successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
  skipFailedRequests: true,
});

app.post('/patients', async (req, res) => {
  const { firstname, lastname, age, regDate, contact, disease } = req.body;
  try {
    const encryptedPatient = {
      firstname: encrypt(firstname),
      lastname: encrypt(lastname),
      age: encrypt(age.toString()), // Convert age to string before encryption
      regDate: encrypt(regDate),
      contact: encrypt(contact),
      disease: encrypt(disease),
    };

    const patient = new PatientModel(encryptedPatient);
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/patients', async (req, res) => {
  try {
    const patients = await PatientModel.find();
    // Decrypt patient information before sending it to the client
    const decryptedPatients = patients.map(patient => ({
      _id: patient._id,
      firstname: decrypt(patient.firstname),
      lastname: decrypt(patient.lastname),
      age: decrypt(patient.age),
      regDate: decrypt(patient.regDate),
      contact: decrypt(patient.contact),
      disease: decrypt(patient.disease),
    }));
    res.json(decryptedPatients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, age, regDate, contact, disease } = req.body;
  try {
    // Retrieve the existing patient information
    const existingPatient = await PatientModel.findById(id);

    // Decrypt the existing patient information
    const decryptedPatient = {
      firstname: decrypt(existingPatient.firstname),
      lastname: decrypt(existingPatient.lastname),
      age: decrypt(existingPatient.age),
      regDate: decrypt(existingPatient.regDate),
      contact: decrypt(existingPatient.contact),
      disease: decrypt(existingPatient.disease),
    };

    // Update the patient information
    const updatedPatient = await PatientModel.findByIdAndUpdate(
      id,
      {
        firstname: encrypt(firstname || decryptedPatient.firstname), // Use the existing value if not provided in the update
        lastname: encrypt(lastname || decryptedPatient.lastname),
        age: encrypt(age.toString() || decryptedPatient.age),
        regDate: encrypt(regDate || decryptedPatient.regDate),
        contact: encrypt(contact || decryptedPatient.contact),
        disease: encrypt(disease || decryptedPatient.disease),
      },
      { new: true }
    );

    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await PatientModel.findByIdAndDelete(id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/appointments', async (req, res) => {
  const { patientName, appointmentDate, appointmentTime, age, gender, contactNumber } = req.body;
  try {
    const encryptedAppointment = {
      patientName: encrypt(patientName),
      appointmentDate: encrypt(appointmentDate),
      appointmentTime: encrypt(appointmentTime),
      age: encrypt(age.toString()), // Convert age to string before encryption
      gender: encrypt(gender),
      contactNumber: encrypt(contactNumber),
    };

    const appointment = new AppointmentModel(encryptedAppointment);
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const appointments = await AppointmentModel.find();
    // Decrypt appointment information before sending it to the client
    const decryptedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientName: decrypt(appointment.patientName),
      appointmentDate: decrypt(appointment.appointmentDate),
      appointmentTime: decrypt(appointment.appointmentTime),
      age: decrypt(appointment.age),
      gender: decrypt(appointment.gender),
      contactNumber: decrypt(appointment.contactNumber),
    }));
    res.json(decryptedAppointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, patientName, appointmentDate, appointmentTime, age, gender, contactNumber } = req.body;
  try {
    // Retrieve the existing appointment information
    const existingAppointment = await AppointmentModel.findById(id);

    // Decrypt the existing appointment information
    const decryptedAppointment = {
      patientName: decrypt(existingAppointment.patientName),
      appointmentDate: decrypt(existingAppointment.appointmentDate),
      appointmentTime: decrypt(existingAppointment.appointmentTime),
      age: decrypt(existingAppointment.age),
      gender: decrypt(existingAppointment.gender),
      contactNumber: decrypt(existingAppointment.contactNumber),
    };

    // Update the appointment information
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      {
        status,
        patientName: encrypt(patientName || decryptedAppointment.patientName), // Use the existing value if not provided in the update
        appointmentDate: encrypt(appointmentDate || decryptedAppointment.appointmentDate),
        appointmentTime: encrypt(appointmentTime || decryptedAppointment.appointmentTime),
        age: encrypt(age.toString() || decryptedAppointment.age),
        gender: encrypt(gender || decryptedAppointment.gender),
        contactNumber: encrypt(contactNumber || decryptedAppointment.contactNumber),
      },
      { new: true }
    );

    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await AppointmentModel.findByIdAndDelete(id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.options('/login', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://secuehr.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await FormDataModel.findOne({ email, role });

    if (user) {
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      if (hashedPassword === user.password) {
        res.json('Success');
      } else {
        res.status(401).json('Invalid credentials');
      }
    } else {
      res.status(401).json('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('An error occurred');
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await FormDataModel.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/doctors', async (req, res) => {
  const { id, name, specialization, location, contact } = req.body;
  try {
    const encryptedDoctor = {
      id: encrypt(id),
      name: encrypt(name),
      specialization: encrypt(specialization),
      location: encrypt(location),
      contact: encrypt(contact),
    };

    const doctor = new DoctorModel(encryptedDoctor);
    const newDoctor = await doctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all doctors
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await DoctorModel.find();
    // Decrypt doctor information before sending it to the client
    const decryptedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      id: decrypt(doctor.id),
      name: decrypt(doctor.name),
      specialization: decrypt(doctor.specialization),
      location: decrypt(doctor.location),
      contact: decrypt(doctor.contact),
    }));
    res.json(decryptedDoctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a doctor
app.put('/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, specialization, location, contact } = req.body;
  try {
    const updatedDoctor = await DoctorModel.findOneAndUpdate(
      { _id: id }, // Use _id as the identifier
      {
        $set: {
          name: encrypt(name),
          specialization: encrypt(specialization),
          location: encrypt(location),
          contact: encrypt(contact),
        }
      },
      { new: true }
    );

    res.json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a doctor
app.delete('/doctors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await DoctorModel.findByIdAndDelete(id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/medical-records', async (req, res) => {
  const {
    patientId,
    diagnosis,
    treatmentPlan,
    medications,
    dateOfVisit,
    attendingDoctor,
    labResults,
    followUpDate,
  } = req.body;
  try {
    const encryptedRecord = {
      patientId: encrypt(patientId),
      diagnosis: encrypt(diagnosis),
      treatmentPlan: encrypt(treatmentPlan),
      medications: encrypt(medications),
      dateOfVisit: encrypt(dateOfVisit),
      attendingDoctor: encrypt(attendingDoctor),
      labResults: encrypt(labResults),
      followUpDate: encrypt(followUpDate),
    };

    const medicalRecord = new MedicalRecordModel(encryptedRecord);
    const newRecord = await medicalRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/medical-records', async (req, res) => {
  try {
    const records = await MedicalRecordModel.find();
    const decryptedRecords = records.map((record) => ({
      _id: record._id,
      patientId: decrypt(record.patientId),
      diagnosis: decrypt(record.diagnosis),
      treatmentPlan: decrypt(record.treatmentPlan),
      medications: decrypt(record.medications),
      dateOfVisit: decrypt(record.dateOfVisit),
      attendingDoctor: decrypt(record.attendingDoctor),
      labResults: decrypt(record.labResults),
      followUpDate: decrypt(record.followUpDate),
    }));
    res.json(decryptedRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/medical-records/:id', async (req, res) => {
  const { id } = req.params;
  const {
    patientId,
    diagnosis,
    treatmentPlan,
    medications,
    dateOfVisit,
    attendingDoctor,
    labResults,
    followUpDate,
  } = req.body;
  try {
    const existingRecord = await MedicalRecordModel.findById(id);
    const decryptedRecord = {
      patientId: decrypt(existingRecord.patientId),
      diagnosis: decrypt(existingRecord.diagnosis),
      treatmentPlan: decrypt(existingRecord.treatmentPlan),
      medications: decrypt(existingRecord.medications),
      dateOfVisit: decrypt(existingRecord.dateOfVisit),
      attendingDoctor: decrypt(existingRecord.attendingDoctor),
      labResults: decrypt(existingRecord.labResults),
      followUpDate: decrypt(existingRecord.followUpDate),
    };

    const updatedRecord = await MedicalRecordModel.findByIdAndUpdate(
      id,
      {
        patientId: encrypt(patientId || decryptedRecord.patientId),
        diagnosis: encrypt(diagnosis || decryptedRecord.diagnosis),
        treatmentPlan: encrypt(treatmentPlan || decryptedRecord.treatmentPlan),
        medications: encrypt(medications || decryptedRecord.medications),
        dateOfVisit: encrypt(dateOfVisit || decryptedRecord.dateOfVisit),
        attendingDoctor: encrypt(attendingDoctor || decryptedRecord.attendingDoctor),
        labResults: encrypt(labResults || decryptedRecord.labResults),
        followUpDate: encrypt(followUpDate || decryptedRecord.followUpDate),
      },
      { new: true }
    );

    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/medical-records/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await MedicalRecordModel.findByIdAndDelete(id);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
