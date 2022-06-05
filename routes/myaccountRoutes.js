const express = require("express");
const app = express();
const multer = require("multer");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto=require("crypto");
var CryptoJS=require("crypto-js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { Register } = require("../models/register");
const { ID } = require("../models/IDs");
const { BloodBankRegister} = require("../models/bloodBankDetails");

var key = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

// Check whether the user is exist or not

app.post("/", async (req, res) => {
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

    lowerMail= CryptoJS.AES.encrypt(lowerMail, key, { mode: CryptoJS.mode.ECB }).toString();

    console.log(lowerMail);

    const success = await Register.findOne({ Email: lowerMail });
    let hashedPassword = crypto.createHash("sha256").update(req.body.pass).digest("hex");

    try {
        if (!success) {
            res.json("User not found!");
        } else {
            if (success.Password != hashedPassword) {
                res.json("Incorrect password");
            } else {
                let payload = { subject: success._id }
                let token = jwt.sign(payload, "secretKey")
                res.json({ token: token });
            }
        }
    } catch (e) {
        console.log(e);
    }
});

// Get the respective user

app.get("/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    let success = await Register.findById({ _id: params })
    let details = {
        Username: success.Username,
        DOB: success.DOB,
        changeDOB: success.changeDOB,
        BloodGroup: success.BloodGroup,
        changeBG: success.changeBG,
        Email: CryptoJS.AES.decrypt(success.Email, key, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8),
        Password: success.Password,
        ID: success._id.toString().slice(18),
        DonatedCount: success.DonatedCount,
        PhoneNumber: CryptoJS.AES.decrypt(success.PhoneNumber, key, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8),
        District: success.District,
        Profile: success.Profile,
        Deactivate: success.Deactivate,
        Activate: success.Activate
        
    }
    console.log(details)
    try {
        if (details)
            res.json(details);
    } catch (e) {
        console.log(e);
    }
})


// Deactivate the account temporary

app.patch("/deactivate/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    const success = await Register.findByIdAndUpdate({ _id: params }, { Deactivate: req.body.deActivate, Activate: req.body.activate }, { returnOriginal: false })
    try {
        res.json("ok")
        console.log(success);
    } catch (e) {
        console.log(e);
    }

})

//Activate the account

app.patch("/activate/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    const success = await Register.findByIdAndUpdate({ _id: params }, { Deactivate: req.body.deActivate, Activate: req.body.activate }, { returnOriginal: false })
    try {
        if (success) {
            res.json("ok")
            console.log(success);
        }
    } catch (e) {
        console.log(e);
    }
})

var check = [];

//Update the user record!

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage });

app.patch("/update/:id", upload.single("file"), async (req, res) => {

    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;

    var givenDOB = req.body.dob;

    var dobdate = givenDOB.slice(0, 2);
    var dobmon = givenDOB.slice(3, 5);
    var dobyear = givenDOB.slice(6, 10);

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
        var userdob = req.body.dob
        var day = userdob.slice(0, 2)
        var month = userdob.slice(3, 5)
        var year = userdob.slice(6, 10)
        var hyphen = userdob.slice(2, 3)
        var dobUser = day + hyphen + month + hyphen + year;

        const success = await Register.findById({ _id: params })
        if (success) {
            var val1, val2;
            if (success.changeDOB < 1) {
                if (success.DOB == req.body.dob) {
                    val1 = 0
                } else {
                    val1 = 1
                }
            } else {
                val1 = 1
                console.log("DOB can't be changed more than one time")
            }
            if (success.changeBG < 1) {
                if (success.BloodGroup == req.body.bloodGroup) {
                    val2 = 0
                } else {
                    val2 = 1
                }
            } else {
                val2 = 1
                console.log("Blood Group can't be changed more than one time")
            }
 
            let hashedPhoneNumber =  CryptoJS.AES.encrypt(req.body.phone, key, { mode: CryptoJS.mode.ECB }).toString(); 

            if (success.PhoneNumber == hashedPhoneNumber) {
            // if (success.PhoneNumber == req.body.phone) {

                var image;
                if (req.file == undefined) {
                    console.log("User didn't changed the profile picture")
                    const ok = await Register.findByIdAndUpdate({ _id: params }, { Username: req.body.name, DOB: dobUser, changeDOB: val1, BloodGroup: req.body.bloodGroup, changeBG: val2 })
                    try {
                        console.log("Updated 1!");
                        res.json("ok");
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    var file = req.file;
                    image = file.filename;
                    const ok = await Register.findByIdAndUpdate({ _id: params }, { Profile: image, Username: req.body.name, DOB: dobUser, changeDOB: val1, BloodGroup: req.body.bloodGroup, changeBG: val2 })
                    try {
                        console.log("Updated 2!");
                        res.json("ok");
                    } catch (e) {
                        console.log(e);
                    }
                }
            } else {
                const done = await Register.findOne({ PhoneNumber:  hashedPhoneNumber})
                // const done = await Register.findOne({ PhoneNumber:  req.body.phone})
                try {
                    if (done) {
                        console.log("Phone Number is already registered!");
                        res.json("Phone Number is already registered!");
                    } else {
                        check.push("yes");
                        console.log("new Phone Number")
                    }
                } catch (e) {
                    console.log(e)
                }

                if (check[check.length - 1] == "yes") {
                    if (req.file == undefined) {
                        var obj = {
                            Username: req.body.name,
                            DOB: dobUser,
                            PhoneNumber: hashedPhoneNumber,
                            // PhoneNumber: req.body.phone,
                            changeDOB: val1,
                            BloodGroup: req.body.bloodGroup,
                            changeBG: val2
                        }
                        const update = await Register.findByIdAndUpdate({ _id: params }, obj, { returnOriginal: false })
                        try {
                            console.log("Both are updated");
                            res.json("ok")
                            console.log(update);
                        } catch (e) {
                            console.log(e)
                        }
                    } else {
                        var file = req.file;
                        image = file.filename;
                        var obj = {
                            Username: req.body.name,
                            DOB: req.body.dob,
                            PhoneNumber: hashedPhoneNumber,
                            // PhoneNumber: req.body.phone,
                            Profile: image,
                            changeDOB: val1,
                            BloodGroup: req.body.bloodGroup,
                            changeBG: val2
                        }
                        const updated = await Register.findByIdAndUpdate({ _id: params }, { returnOriginal: false }, obj)
                        try {
                            console.log("All are updated");
                            res.json("ok")
                            console.log(updated);
                        } catch (e) {
                            console.log(e)
                        }
                    }

                } else {
                    console.log("No");
                }
            }
        }
    } else {
        res.json("Your age should between 18 and 65..")
        console.log("Your age should between 18 and 65..")
    }

})

// Delete the account

app.delete("/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    const deleted = await Register.findByIdAndDelete({ _id: params })
    try {
        res.json("ok")
        console.log("Deleted successfully!");
    } catch (e) {
        console.log(e);
    }

})

// verify the user before he going to edit the profile or deactivate the account or activate the account or deleting the account 

app.post("/verifyUser/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    const success = await Register.findById({ _id: params })
    try {
        if (success) {
            let hashedPassword = crypto.createHash("sha256").update(req.body.pass).digest("hex");
            if (success.Password == hashedPassword) {
                res.json("ok");
            } else {
                res.json("Incorrect password!")
            }
        }
    } catch (e) {
        console.log(e);
    }
})

// Check whether the user is exist or not. If  exixts send email to reset the password 

app.post("/sendEmail", async (req, res) => {

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

    var mailTo = lowerMail;
    lowerMail = CryptoJS.AES.encrypt(lowerMail, key, { mode: CryptoJS.mode.ECB }).toString();

    const success = await Register.findOne({ Email: lowerMail });
    try {
        if (success) {

            var transport = nodemailer.createTransport({
                host: "smtp-mail.outlook.com",
                secureConnection: false,
                port: 587,
                tls: {
                    ciphers:'SSLv3'
                },
                auth: {
                    user: 'no.reply.blood.donor@outlook.com',
                    pass: 'Saroflix@2001'
                }
            });

            // https://morning-fortress-21466.herokuapp.com/#/resetPass
            
            var mailOptions = {
                from: "no.reply.blood.donor@outlook.com",
                to: mailTo,
                subject: "WELCOME TO BLOOD DONOR :)",
                html: `<div>
                <p style="font-family:system-ui;font-size:30px;">Hi `+ success.Username + `</p><br>
                <h1 style="font-family: "Gill Sans", sans-serif;font-size:20px;">A request has been receieved to change the password for your account</h1><br>
                <center><a href='http://localhost:8080/#/resetPass'><button style="color:white;background-color: dodgerblue;inline-size: 300px;block-size: 40px;cursor: pointer;border-radius: 5px;outline: none;padding: 10px;border-color: dodgerblue;">Reset Password</button></a></center><br>
                <p style="font-family: Georgia, serif;font-size:20px;">If you did not initiate this request,please contact us immediately at <span style="color:dodgerblue;text-decoration:underline">` + "noreply.blood.donar@outlook.com" + `</span></p><br>
                <p style="font-family: Georgia, serif;font-size:20px;">Thank you,</p>
                <p style="font-family: Georgia, serif;font-size:20px;">BloodDonor Team</p></div>`,
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (!error) {
                    console.log("Email Sent", info.response);
                    res.json("Email sent");
                } else {
                    console.log("Error", + error);
                }
            });

        } else {
            res.json("User not found!")
        }
    } catch (e) {
        console.log(e);
    }
})

//Reset password

app.patch("/resetPass/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;

    if (req.body.pass == req.body.cPass) {

        let hashedPassword = crypto.createHash("sha256").update(req.body.pass).digest("hex");

        const success = await Register.findById({ _id: params })
        try {
            if (success) {
                if (success.Password == hashedPassword) {
                    res.json("you entered the old password!")
                    console.log("you entered the old password!");
                } else {
                    const done = await Register.findByIdAndUpdate({ _id: params }, { Password: hashedPassword }, { returnOriginal: false })
                    try {
                        console.log("Password reset successfully!");
                        res.json("ok")
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }

    } else {
        console.log("Password mismatch");
        res.json("Password mismatch")
    }
})

// Change password

app.patch("/changePass/:id", async (req, res) => {
    const token = req.params.id;
    let payload = jwt.verify(token, "secretKey")
    const params = payload.subject;
    if (req.body.pass == req.body.cPass) {

        let hashedPassword = crypto.createHash("sha256").update(req.body.pass).digest("hex");
        let oldHashedPassword = crypto.createHash("sha256").update(req.body.oldPass).digest("hex");

        const success = await Register.findById({ _id: params })
        try {
            if (success) {
                if (success.Password == hashedPassword) {
                    res.json("you entered the old password!")
                    console.log("you entered the old password!");
                } else if (success.Password == oldHashedPassword) {
                    const done = await Register.findByIdAndUpdate({ _id: params }, { Password: hashedPassword }, { returnOriginal: false })
                    try {
                        console.log("Password changed successfully!");
                        res.json("ok")
                    } catch (e) {
                        console.log(e)
                    }
                } else if (success.Password != oldHashedPassword) {
                    res.json("Your Old password is incorrect!")
                    console.log("Your Old password is incorrect!");
                }
            }
        } catch (e) {
            console.log(e)
        }
    } else {
        res.json("Password mismatch");
        console.log("Password mismatch!")
    }

})

// Contact

app.post("/contact", async (req, res) => {
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

    lowerMail= CryptoJS.AES.encrypt(lowerMail, key, { mode: CryptoJS.mode.ECB }).toString();

    const success = await Register.findOne({ Email: lowerMail })
    try {
        if (success) {

            var obj = {
                Name: success.Username,
                Feedback: req.body.feedback
            }

            var transport = nodemailer.createTransport({
                host: "smtp-mail.outlook.com",
                secureConnection: false,
                port: 587,
                tls: {
                    ciphers:'SSLv3'
                },
                auth: {
                    user: 'no.reply.blood.donor@outlook.com',
                    pass: 'Saroflix@2001'
                }
            });

            var mailOptions = {
                from: "no.reply.blood.donor@outlook.com",
                to: "customercare.blooddonor@gmail.com",
                subject: "CUSTOMER FEEDBACK",
                html: "<p><astrong>Hi Admin, </strong></p> <p> you get a new customer query! </p><p> Name: " + obj.Name + "<p><p> Feedback: " + obj.Feedback + "<p>"
                // html: "<p><astrong>Hi Admin, </strong></p> <p> you get a new customer query! </p><p> Name: " + obj.Name + "<p><p> Email: " + obj.Email + "<p><p> Phone Number: " + obj.PhoneNumber + "<p><p> Feedback: " + obj.Feedback + "<p>"
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (!error) {
                    console.log("Email Sent", info.response);
                    res.json("ok");
                } else {
                    console.log("Error", + error);
                }
            });

        } else {
            res.json("User not found!")
        }
    } catch (e) {
        console.log(e);
    }

})

module.exports = app;