const express = require("express");
const { userModel } = require("./model/userModel");
const { connection } = require("./configs/db");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { authentication } = require("./middleware/authentication");
const { BMIModel } = require("./model/BMIModel");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello backend");
});

//signup part

app.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;
  const isUser = await userModel.findOne({ email: email });
  if (isUser) {
    res.send({ msg: "user already exit go to login" });
  } else {
    bcrypt.hash(password, 4, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        res.send({ msg: "something went wrong in bcrypt" });
      }
      const new_user = new userModel({
        email,
        name,
        password: hash,
      });
      try {
        await new_user.save();
        res.send({ msg: "sign up succesfull" });
      } catch (error) {
        res.send({ msg: "Something went wrong", err: error });
      }
      //   console.log(new_user);
    });
  }
});

//login part
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const User = await userModel.findOne({ email });
  const hashed_password = User.password;
  const user_id = User._id;
  console.log(user_id);

  bcrypt.compare(password, hashed_password, function (err, result) {
    // result == true
    if (err) {
      res.send({ msg: "something went wrong.try agan later" });
    }

    if (result) {
      var token = jwt.sign({ user_id }, process.env.SECRET_KEY);
      res.send({ msg: "login success", token });
    } else {
      request.send({ msg: "login failed" });
    }
  });
});

//getprofile

app.get("/getprofile", authentication, async (req, res) => {
  const { user_id } = req.body;
  const user = await userModel.findOne({ _id: user_id });
  const { name, email } = user;

  res.send({ name, email });
});

//calculateBMI

app.post("/calculateBMI", authentication, async (req, res) => {
  const { height, weight, user_id } = req.body;
  const height_in_meter = Number(height) * 0.3048; //to convert into feet
  const BMI = Number(weight) / height_in_meter ** 2;
  const new_bmi = new BMIModel({
    BMI,
    height: height_in_meter,
    weight,
    user_id,
  });
  await new_bmi.save();
  res.send({ BMI });
});

//get all calculations

app.get("/getCalculation", authentication, async (req, res) => {
  const { user_id } = req.body;
  const all_bmi = await BMIModel.find({ user_id: user_id });
  res.send({ history: all_bmi });
});

app.listen(8000, async () => {
  try {
    await connection;
    console.log("conneted to db");
  } catch (error) {
    console.log(error);
  }

  console.log("listening on 8000");
});
