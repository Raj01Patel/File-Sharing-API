const express = require("express");
const mongoose = require("mongoose");
const fileRoute = require("./route/fileroute")

const app = express();

mongoose
    .connect(process.env.DATABASE_URI)
    .then(() => console.log("DB Connected Successfully"))
    .catch((err) => console.log("Error connecting Database", err));

app.use(express.json());
app.use(fileRoute);

app.listen("5000", () => {
    console.log("server is running on port 5000");
})