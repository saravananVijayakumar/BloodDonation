const express = require("express");
const app = express();
var nodemailer = require("nodemailer");
var CryptoJS = require("crypto-js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Register } = require("../models/register");
const { ID } = require("../models/IDs");
const { BloodBankRegister } = require("../models/bloodBankDetails");
const { ThirdPartyRegister } = require("../models/thirdPartyDetails");

var flag = true;
var oneTimeFlag = true;
var obj;
var bool1 = true;
var bool2 = true;
var bloodBankEmailArray=[];
var thirdPartyEmailArray=[];
var OTParray = [];


var key = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

// Blood Found

app.post("/bloodFound", async (req, res) => {
    var dummyFlag = false;
    var userID;
    var donatedCount;
    const donorIdFound = await Register.find();
    for (var i = 0; i < donorIdFound.length; i++) {
        if (donorIdFound[i]._id.toString().slice(18) == req.body.donorID) {
            userID = donorIdFound[i]._id;
            donatedCount = donorIdFound[i].DonatedCount;
            dummyFlag = true;
            break;
        }
    }
    if (dummyFlag) {
        const success = await ID.find();
        try {
            if (success[0].ID_list.includes(req.body.id)) {
                res.json("ok")
                console.log("ID is there");
                flag = false;
                const deleteIdDone = await ID.findOneAndUpdate({ $pull: { ID_list: req.body.id } });
                try {
                    if (deleteIdDone) {
                        console.log("ID deleted successfully!");
                        const updateDonatedCount = await Register.findByIdAndUpdate({ _id: userID }, { DonatedCount: donatedCount + 1 });
                        try {
                            if (updateDonatedCount) {
                                console.log("Donated Count Updated");
                            } else {
                                console.log("Donated Count not Updated");
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        console.log("ID not deleted");
                    }
                } catch (error) {
                    console.log(error);
                }

            } else {
                res.json("ID not found");
                console.log("ID not found");
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        res.json("Domain ID not found (User not found)")
        console.log("Domain ID not found (User not found)");
    }

})

// E-mail to the all donors

app.post("/", async (req, res) => {

    let sentEmailArray = [];

    let randomID = Math.floor(10000000 + Math.random() * 90000000);

    const save = await ID.findOneAndUpdate({ $push: { ID_list: randomID } })
    try {
        if (save) console.log("ID Pushed");
    } catch (e) {
        console.log(e);
    }

    var mailDomain = "@gmail.com"
    var userMail = req.body.email
    var idMail;
    var mail = userMail.toLowerCase();
    if ((mail.length) <= 10) {
        idMail = mail + mailDomain;
    } else {
        if (mail.slice(-10) == mailDomain) {
            idMail = mail
        } else {
            idMail = mail + mailDomain
        }
    }

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
        to: idMail,
        subject: "Your ID",
        html: `<p><center><strong>From BloodDonor Site</strong></center></p><p>Hi,</p><p>ID :${randomID}</p>`
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (!error) {
            console.log("Email Sent", info.response);
            console.log("ID mail  ", idMail);
        } else {
            console.log("Error", + error);
        }
    });

    var lowerMail = CryptoJS.AES.encrypt(idMail, key, { mode: CryptoJS.mode.ECB }).toString()

    let func = async (success) => {
        if (flag) {
            try {
                if (success) {
                    var secPhone, attenderName;
                    if (req.body.sPhone == "") {
                        secPhone = "-";
                    }
                    else {
                        secPhone = req.body.sPhone;
                    }
                    if (req.body.attender == "") {
                        attenderName = "-";
                    }
                    else {
                        attenderName = req.body.attender;
                    }
                    obj = {
                        Name: req.body.name,
                        Age: req.body.age,
                        BloodType: req.body.bloodGroup,
                        BloodComponent: req.body.bloodComponent,
                        Units: req.body.units,
                        PrimaryNumber: req.body.phone,
                        SecondaryNumber: secPhone,
                        CurrentLocation: req.body.currentLocation,
                        District: req.body.district,
                        Attender: attenderName
                    }

                    if (success.length > 0) {
                        success.forEach((data) => {

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

                            let mailTo = CryptoJS.AES.decrypt(data.Email, key, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8);
                            sentEmailArray.push(mailTo);


                            var mailOptions = {
                                from: "no.reply.blood.donor@outlook.com",
                                to: mailTo,
                                subject: "URGENT!",
                                html: "<p><center><strong>From BloodDonor Site</strong></center></p><p>Hi <strong>" + data.Username + "</strong>,</p> <p> Urgently required <strong>" + obj.BloodType + " </strong> blood type</p><p> Name: " + obj.Name + "<p><p> Age: " + obj.Age + " </p><p> Blood Type: <strong>" + obj.BloodType + "</strong> </p> <p> Blood Component: <strong>" + obj.BloodComponent + "</strong> </p>  <p> Number of Units: <strong>" + obj.Units + " </strong> units</p><p> Primary Number:  <strong>" + obj.PrimaryNumber + " </strong> </p><p> Secondary Number:  <strong>" + obj.SecondaryNumber + " </strong> </p><p> Location: " + obj.CurrentLocation + "<p><p> District: " + obj.District + "<p><p> Attender:  <strong>" + obj.Attender + " </strong> </p><p>spread this message as soon as possible...</p>"
                            };

                            transport.sendMail(mailOptions, (error, info) => {
                                if (!error) {
                                    console.log("Email Sent", info.response);
                                    console.log("Donor mail ", mailTo);
                                    bool1 = true;
                                    bool2 = true;
                                } else {
                                    console.log("Error", + error);
                                }
                            });
                        })
                    }
                    if (oneTimeFlag == true) {
                        res.json("done");
                        oneTimeFlag = false;
                    }


                } else {
                    console.log("Error")
                }

            } catch (e) {
                console.log(e);
            }
        } else {

            sentEmailArray.forEach((data) => {

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

                console.log(data);

                var mailOptions = {
                    from: "no.reply.blood.donor@outlook.com",
                    to: data,
                    subject: "Blood Found",
                    html: "<p><center><strong>From BloodDonor Site</strong></center></p><p>Hi User,</p> <p> Sorry for the inconvenience. As we have recieved required blood, please igonore the previous mail. Thank you for your understanding.</p>"
                };

                transport.sendMail(mailOptions, (error, info) => {
                    if (!error) {
                        console.log("Email Sent", info.response);
                        console.log("Reply mail ", data);
                    } else {
                        console.log("Error", + error);
                    }
                });
            })
            console.log(sentEmailArray);
            sentEmailArray.length = 0;
            console.log(sentEmailArray);
            return;
        }
    }

    const immediateSuccess = await Register.find({ Email: { $nin: [lowerMail] }, BloodType: req.body.bloodGroup, District: req.body.district });
    func(immediateSuccess);

    const after5MinSuccess = await Register.find({ Email: { $nin: [lowerMail] }, BloodType: { $nin: [req.body.bloodGroup] }, District: req.body.district });
    setTimeout(sampleFunc = () => {
        func(after5MinSuccess);
    }, 10000);

    const after10MinSuccess = await Register.find({ Email: { $nin: [lowerMail] }, BloodType: req.body.bloodGroup, District: { $nin: [req.body.district] } });
    setTimeout(sampleFunc = () => {
        func(after10MinSuccess);
    }, 20000);

    const after15MinSuccess = await Register.find({ Email: { $nin: [lowerMail] }, BloodType: { $nin: [req.body.bloodGroup] }, District: { $nin: [req.body.district] } });
    setTimeout(sampleFunc = () => {
        func(after15MinSuccess);
    }, 30000);

    const after20MinSuccess = await BloodBankRegister.find({District : req.body.district});
    setTimeout(sampleFunc = () => {
        if (after20MinSuccess.length > 0) {
                after20MinSuccess.forEach((data) => {

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
                    to: data.Email,
                    subject: "URGENT!",
                    html: `<div>
                    <p style="font-family:system-ui;font-size:30px;">Hi </p><br>
                    <h1 style="font-family: "Gill Sans", sans-serif;font-size:20px;">Do you have blood</h1><br>
                    <center><a href='http://localhost:8080/#/bloodBankConfirmation/${data.Email}'><button style="color:white;background-color: dodgerblue;inline-size: 300px;block-size: 40px;cursor: pointer;border-radius: 5px;outline: none;padding: 10px;border-color: dodgerblue;">Yes</button></a></center><br>
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
            })
        } else {
            console.log("Error")
        }

    }, 40000);

})

app.post("/BloodBankConfirmation", async (req, res) => {
    if(bool1){
        console.log(req.body.email);
        bloodBankEmailArray.push(req.body.email);
        res.json(true)
        bool1 = false;
        const success = await ThirdPartyRegister.find({District: obj.District, Available: 1})
            if (success.length > 0) {
                success.forEach((data) => {

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
                        to: data.Email,
                        subject: "URGENT!",
                        html: `<div>
                        <p style="font-family:system-ui;font-size:30px;">Hi </p><br>
                        <h1 style="font-family: "Gill Sans", sans-serif;font-size:20px;">Do you have blood</h1><br>
                        <center><a href='http://localhost:8080/#/thirdPartyConfirmation/${data.Email}'><button style="color:white;background-color: dodgerblue;inline-size: 300px;block-size: 40px;cursor: pointer;border-radius: 5px;outline: none;padding: 10px;border-color: dodgerblue;">Yes</button></a></center><br>
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
                })
            } else {
                console.log("Error")
            }
        }
})

app.post("/ThirdPartyConfirmation", async (req, res) => {
    if(bool2){
        thirdPartyEmailArray.push(req.body.email)
        OTParray.push(Math.floor(100000 + Math.random() * 900000))
        res.json(true)
        bool2 = false;
        let value = bloodBankEmailArray[bloodBankEmailArray.length - 1]
        const success = await BloodBankRegister.find({Email: value})
        try {
            if(success){
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
                    to: thirdPartyEmailArray[thirdPartyEmailArray.length - 1],
                    subject: "URGENT! Go and Collect the Blood",
                    html: `Address of the Blood Bank : ${success[0].Address} and the OTP : ${OTParray[OTParray.length - 1]}`
                };

                transport.sendMail(mailOptions, (error, info) => {
                    if (!error) {
                        console.log("Email Sent", info.response);
                    } else {
                        console.log("Error", + error);
                    }
                });
            }
            
        } catch (error) {
            console.log(error);
        }      
    }
})


app.post("/collectBlood", async (req, res) => {
    if(req.body.email != bloodBankEmailArray[bloodBankEmailArray.length - 1]){
        res.json("Blood Bank not found")
    }else if(req.body.otp != OTParray[OTParray.length - 1]){
        res.json("OTP wrong")
    }else if(req.body.otp != OTParray[OTParray.length - 1] && req.body.email != bloodBankEmailArray[bloodBankEmailArray.length - 1]){
        res.json("ok");
        const success = await ThirdPartyRegister.findOneAndUpdate({Email : thirdPartyEmailArray[thirdPartyEmailArray.length-1]}, {Available : 0}, { returnOriginal: false })
    }
})

module.exports = app;