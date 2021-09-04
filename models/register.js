const mongoose = require('mongoose');

var RegisterSchema = new mongoose.Schema({
    Username: String,
    DOB: String,
    changeDOB: Number,
    BloodGroup: String,
    changeBG: Number,
    Email: String,
    Password: String,
    PhoneNumber: Number,
    Profile: String,
    Deactivate: Boolean,
    Activate: Boolean

}, { timestamps: true });

var Register = mongoose.model("Register", RegisterSchema);

module.exports = { Register };