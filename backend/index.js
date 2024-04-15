const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const mainRouter = require("./routes/index");

app.use(cors());
app.use(express.json())

app.use("/api/v1", mainRouter);


  mongoose.connect("mongodb+srv://divyanshu:divyanshu@cluster0.lewitf4.mongodb.net/paytm")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, (req,res) => {
    console.log("Server running on port 3000")
})


