const express = require("express");
const app = express();
const { mongoose } = require("./db");
const cors = require("cors");
const path = require("path")

const port = process.env.PORT || 8080;

app.use(cors());
app.use("/uploads", express.static("uploads"));

const homeRoutes = require("./routes/homeRoutes");
const registerRoutes = require("./routes/registerRoutes.js");
const myaccountRoutes = require("./routes/myaccountRoutes.js");
const mailRoutes = require("./routes/mailRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

app.use("/BloodDonation/home", homeRoutes);
app.use("/BloodDonation/needBlood", mailRoutes);
app.use("/BloodDonation/register", registerRoutes);
app.use("/BloodDonation/details", myaccountRoutes);
app.use("/BloodDonation/adminPage", adminRoutes);

app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.listen(port, () => {
    console.log("Server running at" , port);
});