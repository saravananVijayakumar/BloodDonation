const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { ThirdPartyRegister } = require("../models/thirdPartyDetails")

app.post("/", async (req, res) => {
    let  createThirdPartyuser = {
        Username: req.body.name,
        Email: req.body.email,
        PhoneNumber: req.body.phone,
        District: req.body.district,
        Available: 1
    }

    const save = await ThirdPartyRegister.create(createThirdPartyuser)
        try {
            if (save) {
                res.json("ok")
            }
        } catch (err) {
            console.log(err);
        }

});

module.exports = app;