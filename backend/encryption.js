// encryption.js
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = 'H@pP!Ly5tr0nG&SecuREkEy123!#@%*';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };