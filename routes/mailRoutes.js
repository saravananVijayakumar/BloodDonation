const express = require("express");
const app = express();
var nodemailer = require("nodemailer");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Register } = require("../models/register");

// E-mail to the all donors

app.post("/", async (req, res) => {
    var mailDomain = "@gmail.com"
    var userMail = req.body.email
    var lowerMail;
    var mail = userMail.toLowerCase();
    if((mail.length) <= 10){
        lowerMail = mail + mailDomain;
    }else{
        if(mail.slice(-10) == mailDomain){
            lowerMail = mail
        }else{
            lowerMail = mail + mailDomain
        }
    }

    const success = await Register.find({Email: {$nin: lowerMail}})
    try {
        if (success) {
            var secPhone;
            if(req.body.sPhone == ""){
                secPhone = "-";
            }
            else{
                secPhone = req.body.sPhone;
            }
            if(req.body.attender == ""){
                attenderName = "-";
            }
            else{
                attenderName = req.body.attender;
            }
            var obj = {
                Name: req.body.name,
                Age: req.body.age,
                BloodType: req.body.bloodGroup,
                BloodComponent: req.body.bloodComponent,
                Units: req.body.units,
                Email: lowerMail,
                PrimaryNumber: req.body.phone,
                SecondaryNumber: secPhone,
                CurrentLocation: req.body.currentLocation,
                District: req.body.district,
                Attender: attenderName
            }
            if (success.length > 0) {
                success.forEach( (data) => {

                    var transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "needhelp.blooddonor@gmail.com",
                            pass: "saroflix112001"
                        }
                    });

                    var mailOptions = {
                        from: "needhelp.blooddonor@gmail.com",
                        to: data.Email,
                        subject: "URGENT!",
                        html: "<p><center><strong>From BloodDonor Site</strong></center></p><p>Hi <strong>"+ data.Username +"</strong>,</p> <p> Urgently required <strong>"+ obj.BloodType +" </strong> blood type</p><p> Name: " + obj.Name + "<p><p> Age: " + obj.Age + " </p><p> Blood Type: <strong>" + obj.BloodType + "</strong> </p> <p> Blood Component: <strong>" + obj.BloodComponent + "</strong> </p>  <p> Number of Units: <strong>" + obj.Units +" </strong> units</p><p> Primary Number:  <strong>" + obj.PrimaryNumber +" </strong> </p><p> Secondary Number:  <strong>" + obj.SecondaryNumber +" </strong> </p><p> Email: " + obj.Email + "<p><p> Current Location: " + obj.CurrentLocation + "<p><p> District: " + obj.District + "<p><p> attender:  <strong>" + obj.attender +" </strong> </p><p>spread this message as soon as possible...</p>"
                    };

                    transport.sendMail(mailOptions, (error, info) => {
                        if (!error) {
                            console.log("Email Sent", info.response);
                        } else {
                            console.log("Error", + error);
                        }
                    });
                })
                res.json("done");
            } else {
                console.log("Currently no Donars available.")
            }
        } else {
            console.log("Error")
        }

    } catch (e) {
        console.log(e);
    }

})

module.exports = app;