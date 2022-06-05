const mongoose = require('mongoose');

var IDSchema = new mongoose.Schema({
    ID_list: [Number]
}, { timestamps: true });

var ID = mongoose.model("ID", IDSchema);

module.exports = { ID };