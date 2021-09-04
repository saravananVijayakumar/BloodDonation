const express = require("express");
const app = express();
const multer = require("multer");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { Register } = require("../models/register");

var otpARR = [];
var emailARR = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage });

// Verify the user

app.post("/sendOTP", async (req, res) => {
    var mailDomain = "@gmail.com"
    var userMail = req.body.email
    var lowerMail;
    var mail = userMail.toLowerCase();
    if ((mail.length) <= 10) {
        lowerMail = mail + mailDomain;
    } else {
        if (mail.slice(-10) == mailDomain) {
            lowerMail = mail
        } else {
            lowerMail = mail + mailDomain
        }
    }

    const success = await Register.findOne({ Email: lowerMail });
    try {
        if (success) {
            res.json("Email is already registered.");
            console.log("Email is already registered.")
        }
        else {
            var num1 = Math.floor(Math.random() * 10),
                num2 = Math.floor(Math.random() * 10),
                num3 = Math.floor(Math.random() * 10),
                num4 = Math.floor(Math.random() * 10),
                num5 = Math.floor(Math.random() * 10),
                num6 = Math.floor(Math.random() * 10);

            var OTP = num1.toString() + num2.toString() + num3.toString() + num4.toString() + num5.toString() + num6.toString();

            var transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "noreply.blooddonar@gmail.com",
                    pass: "saroflix112001"
                }
            });

            var mailOptions = {
                from: "noreply.blooddonar@gmail.com",
                to: lowerMail,
                subject: "OTP VERIFICATION",
                html: "<p><center><strong>From BloodDonor Site</strong></center></p><p>Hi,</p><p>OTP: "+ OTP+"</p>"
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (!error) {
                    console.log("Email Sent", info.response);
                    emailARR.push(lowerMail)
                    otpARR.push(OTP)
                    res.json("yes")
                } else {
                    console.log("Error", + error);
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
})

// Checking OTP

app.post("/verifyOTP", async (req, res) => {
    if(otpARR[otpARR.length - 1] == req.body.otp){

        var SignupObj = {
            Username: "",
            DOB: "",
            changeDOB: 0,
            BloodGroup: "",
            changeBG: 0,
            Email: emailARR[emailARR.length - 1],
            Password: "",
            PhoneNumber: 1,
            Profile: "",
            Deactivate: false,
            Activate: true
        }

        const save = await Register.create(SignupObj)
        try {
            if (save) {
                let payload = { subject: save._id }
                let token = jwt.sign(payload, "secretKey");
                res.json({ token: token })
                console.log("New user")
                console.log(save);
            }
        } catch (err) {
            console.log(err);
        }
    }else{
        res.json("OTP wrong")
    }
})

// Store the new users data 

app.post("/newUser/:id", upload.single("file"), async (req, res) => {
    
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;

    if (req.body.pass == req.body.cPass) {

        var givenDOB = req.body.dob;

        var dobyear = givenDOB.slice(0, 4);
        var dobmon = givenDOB.slice(5, 7);
        var dobdate = givenDOB.slice(8, 10);

        var date = new Date();
        var curyear = date.getFullYear();
        var curmon = date.getMonth() + 1;
        var curdate = date.getDate();

        var age = curyear - dobyear;

        if (curmon < dobmon) {
            age = age - 1;
        }
        else if (curmon > dobmon) {
            age = age + 0;
        } else {
            if (curdate > dobdate) {
                age = age + 0;
            } else if (curdate < dobdate) {
                age = age - 1;
            } else {
                age = age + 0;
            }
        }

        if (Number(age) >= 18 && Number(age) <= 65) {

                const ok = await Register.findOne({ PhoneNumber: req.body.phone });
                try {
                    if (ok) {
                        res.json("Phone Number is already registered.");
                    } else if (!ok) {
                        var image;
                        if (req.file == undefined) {
                            image = "index.png"
                        } else {
                            var file = req.file;
                            image = file.filename;
                        }
                        var userdob = req.body.dob
                        var year = userdob.slice(0, 4)
                        var month = userdob.slice(5, 7)
                        var day = userdob.slice(8, 10)
                        var hyphen = userdob.slice(4, 5)
                        var dobUser = day + hyphen + month + hyphen + year;

                        var SignupObj = {
                            Username: req.body.name,
                            DOB: dobUser,
                            changeDOB: 0,
                            BloodGroup: req.body.bloodGroup,
                            changeBG: 0,
                            Password: req.body.pass,
                            PhoneNumber: req.body.phone,
                            Profile: image,
                            Deactivate: false,
                            Activate: true
                        }

                        const save = await Register.findByIdAndUpdate({_id: params}, SignupObj)
                        try {
                            if (save) {
                                res.json("ok")
                                console.log("New user")
                                console.log(save);
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }

        } else {
            res.json("Your age should between 18 and 65")
            console.log("Your age should between 18 and 65")
        }
    } else {
        res.json("Password mismatch.")
        console.log("Password mismatch.")
    }
});

module.exports = app;