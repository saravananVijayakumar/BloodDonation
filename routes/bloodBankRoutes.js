const express = require("express");
const app = express();
const multer = require("multer");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto=require("crypto");
var CryptoJS=require("crypto-js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Register } = require("../models/register");
const { ID } = require("../models/IDs");
const { ThirdPartyRegister } = require("../models/thirdPartyDetails")
const { BloodBankRegister} = require("../models/bloodBankDetails");

app.post("/", async (req, res) => {
    let  createBloodBank = {
        BloodBankName: req.body.name,
        Email: req.body.email,
        PhoneNumber: req.body.phone,
        Address : req.body.address,
        District: req.body.district
    }

    const save = await BloodBankRegister.create(createBloodBank)
        try {
            if (save) {
                res.json("ok")
            }
        } catch (err) {
            console.log(err);
        }

});

module.exports = app;