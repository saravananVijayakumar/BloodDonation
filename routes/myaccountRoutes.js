const express = require("express");
const app = express();
const multer = require("multer");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { Register } = require("../models/register");

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

    const success = await Register.findOne({ Email: lowerMail });
    try {
        if (!success) {
            res.json("User not found!");
        } else {
            if (success.Password != req.body.pass) {
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
    const success = await Register.findById({ _id: params })
    try {
        if (success)
            res.json(success);
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

            if (success.PhoneNumber == req.body.phone) {
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
                const done = await Register.findOne({ PhoneNumber: req.body.phone })
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
                            PhoneNumber: req.body.phone,
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
                            PhoneNumber: req.body.phone,
                            Profile: image,
                            changeDOB: val1,
                            BloodGroup: req.body.bloodGroup,
                            changeBG: val2
                        }
                        const updated = await Register.findByIdAndUpdate({ _id: params }, obj, { returnOriginal: false })
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
            if (success.Password == req.body.pass) {
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

    const success = await Register.findOne({ Email: lowerMail });
    try {
        if (success) {

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
                subject: "WELCOME TO BLOOD DONOR :)",
                html: `<div>
                <p style="font-family:system-ui;font-size:30px;">Hi `+ success.Username + `</p><br>
                <h1 style="font-family: "Gill Sans", sans-serif;font-size:20px;">A request has been receieved to change the password for your account</h1><br>
                <center><a href='https://morning-fortress-21466.herokuapp.com/#/resetPass'><button style="color:white;background-color: dodgerblue;width: 300px;height: 40px;cursor: pointer;border-radius: 5px;outline: none;padding: 10px;border-color: dodgerblue;">Reset Password</button></a></center><br>
                <p style="font-family: Georgia, serif;font-size:20px;">If you did not initiate this request,please contact us immediately at <span style="color:dodgerblue;text-decoration:underline">` + "noreply.blooddonar@gmail.com" + `</span></p><br>
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
        const success = await Register.findById({ _id: params })
        try {
            if (success) {
                if (success.Password == req.body.pass) {
                    res.json("you entered the old password!")
                    console.log("you entered the old password!");
                } else {
                    const done = await Register.findByIdAndUpdate({ _id: params }, { Password: req.body.pass }, { returnOriginal: false })
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
        const success = await Register.findById({ _id: params })
        try {
            if (success) {
                if (success.Password == req.body.pass) {
                    res.json("you entered the old password!")
                    console.log("you entered the old password!");
                } else if (success.Password == req.body.oldPass) {
                    const done = await Register.findByIdAndUpdate({ _id: params }, { Password: req.body.pass }, { returnOriginal: false })
                    try {
                        console.log("Password changed successfully!");
                        res.json("ok")
                    } catch (e) {
                        console.log(e)
                    }
                } else if (success.Password != req.body.oldPass) {
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
    const success = await Register.findOne({ Email: lowerMail })
    try {
        if (success) {

            var obj = {
                Name: success.Username,
                Email: success.Email,
                PhoneNumber: success.PhoneNumber,
                Feedback: req.body.feedback
            }

            var transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "noreply.blooddonar@gmail.com",
                    pass: "saroflix112001"
                }
            });

            var mailOptions = {
                from: "noreply.blooddonar@gmail.com",
                to: "customercare.blooddonor@gmail.com",
                subject: "CUSTOMER FEEDBACK",
                html: "<p><astrong>Hi Admin, </strong></p> <p> you get a new customer query! </p><p> Name: " + obj.Name + "<p><p> Email: " + obj.Email + "<p><p> Phone Number: " + obj.PhoneNumber + "<p><p> Feedback: " + obj.Feedback + "<p>"
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