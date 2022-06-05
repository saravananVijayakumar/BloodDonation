const mongoose = require('mongoose');

var ThirdPartyRegisterSchema = new mongoose.Schema({
    Username: String,
    Email: String,
    PhoneNumber: String,
    District: String,
    Available: Number
}, { timestamps: true });

var ThirdPartyRegister = mongoose.model("ThirdPartyRegister", ThirdPartyRegisterSchema);

module.exports = { ThirdPartyRegister };