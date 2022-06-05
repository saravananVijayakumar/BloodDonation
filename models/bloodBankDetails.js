const mongoose = require('mongoose');

var BloodBankRegisterSchema = new mongoose.Schema({
    BloodBankName: String,
    Email: String,
    PhoneNumber: String,
    Address : String,
    District: String
}, { timestamps: true });

var BloodBankRegister = mongoose.model("BloodBankRegister", BloodBankRegisterSchema);

module.exports = { BloodBankRegister };