const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  id: {
    type: String, // or any other type that suits your requirements
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
});

const DoctorModel = mongoose.model('Doctor', doctorSchema);

module.exports = DoctorModel;
