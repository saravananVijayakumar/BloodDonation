const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://saro:saro@cluster0.k79sb.mongodb.net/BloodDonation?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, function (err) {
    if (!err) {
        console.log("Database Connected");
    }
    else {
        console.log("Error in connecting Database ", +err);
    }
});

module.exports = { mongoose };