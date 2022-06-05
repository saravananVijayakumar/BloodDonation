const express = require("express");
const app = express();
var nodemailer = require("nodemailer");
var CryptoJS = require("crypto-js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Register } = require("../models/register");
const { ID } = require("../models/IDs");
const { BloodBankRegister } = require("../models/bloodBankDetails");
// const CryptoJS = require("crypto-js");
// var key = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
// var encrypted = CryptoJS.AES.encrypt("justsample944@gmail.com", key, { mode: CryptoJS.mode.ECB });
// var a = CryptoJS.AES.encrypt("saravananvjd001@gmail.com", key, { mode: CryptoJS.mode.ECB }); 


// console.log(encrypted.toString());
// console.log(a.toString()); 

// console.log(CryptoJS.AES.decrypt(encrypted.toString(), key, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8)); 
// console.log(CryptoJS.AES.decrypt(a.toString(), key, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8)); 

// var obj1 = {
//     name: "Saravanan V",
//     age: 20
// }

// var obj2 = {
//     age: 2000,
//     gender: "Male"
// }

// var obj3 = { ...obj1, ...obj2 }
// console.log(obj3);

var transport = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: 'no.reply.blood.donor@outlook.com',
        pass: 'Saroflix@2001'
    }
});

var mailOptions = {
    from: "no.reply.blood.donor@outlook.com",
    to: "saravananvjd001@gmail.com",
    subject: "URGENT!",
    html: `<div>
    <p style="font-family:system-ui;font-size:30px;">Hi </p><br>
    <h1 style="font-family: "Gill Sans", sans-serif;font-size:20px;">Do you have blood</h1><br>
    <center><a href='http://localhost:8080/#/bloodBankConfirmation/saravananvjd001@gmail.com'><button style="color:white;background-color: dodgerblue;inline-size: 300px;block-size: 40px;cursor: pointer;border-radius: 5px;outline: none;padding: 10px;border-color: dodgerblue;">Yes</button></a></center><br>
    <p style="font-family: Georgia, serif;font-size:20px;">If you did not initiate this request,please contact us immediately at <span style="color:dodgerblue;text-decoration:underline">` + "noreply.blood.donar@outlook.com" + `</span></p><br>
    <p style="font-family: Georgia, serif;font-size:20px;">Thank you,</p>
    <p style="font-family: Georgia, serif;font-size:20px;">BloodDonor Team</p></div>`
};

transport.sendMail(mailOptions, (error, info) => {
    if (!error) {
        console.log("Email Sent", info.response);
    } else {
        console.log("Error", + error);
    }
});