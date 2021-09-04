const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { Register } = require("../models/register");

// Get all users 

app.get("/", async (req, res) => {

    const success = await Register.find().sort({Username: 1})
    try {
        if (success) {
            res.json(success);
            console.log(success);
        } else {
            res.json("No users found!");
        }
    } catch (e) {
        console.log(e);
    }
})

module.exports = app;