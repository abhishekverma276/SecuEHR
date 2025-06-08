const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true,
  },
  uploadedDate: {
    type: Date,
    default: Date.now,
  },
  // Add more fields as needed for your medical documents
});

const MedicalDocumentModel = mongoose.model('MedicalDocument', medicalDocumentSchema);

module.exports = MedicalDocumentModel;
