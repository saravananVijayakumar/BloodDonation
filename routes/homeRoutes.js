const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { Register } = require("../models/register");

var selected = [];

// Store the Blood type in the "selected" array

app.post("/", (req, res) => {
    selected.push(req.body.bloodGroup);
    res.json("success");
})

// Get the respective Blood type user's data

app.get("/", async (req, res) => {

    const success = await Register.find({ BloodGroup: selected[selected.length - 1], Activate: true });
    try {
        if (success) {
            res.json(success);
            console.log(success);
        } else {
            res.json("Currently no donors!")
        }
    } catch (e) {
        console.log(e);
    }
})

module.exports = app;