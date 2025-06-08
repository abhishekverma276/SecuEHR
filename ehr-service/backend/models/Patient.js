const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  regDate: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
});

const PatientModel = mongoose.model('Patient', patientSchema);

module.exports = PatientModel;
