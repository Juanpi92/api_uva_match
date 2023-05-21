import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authenticationRoutes = (app) => {
  app.post("/sms", async (req, res) => {
    let { phone } = req.body;
    //Create the code to send a SMS with the auth code.
  });
  app.post("/confirm_code", async (req, res) => {
    let { phone, sms_code } = req.body;
    //Check if the user is registered, and then make the login.

    //Create the code to confirm the validation of the SMS code(?).

    //If the code is ok we proceed to auto login
    let myuser = User.findOne({ phone: phone });
    myuser = myuser.toJSON();
    delete myuser.password;
    let token = jwt.sign(myuser, process.env.SECRET_TOKEN, {
      expiresIn: "2h",
    });
    //Sending the user and the token.
    res.setHeader("auth-token", JSON.stringify(token));
    res.status(201).send(myuser);
  });

  app.post("/register", async (req, res) => {
    try {
      let {
        name,
        lastName,
        nickName,
        about,
        location,
        preference,
        age,
        gender,
        phone,
        email,
        photos,
        course,
        password,
      } = req.body;
      //Here we encripted the password.
      let hashed_password = await bcrypt.hash(
        password,
        Number(process.env.PASSOS)
      );
      let user = {
        name,
        lastName,
        nickName,
        about,
        location,
        preference,
        age,
        gender,
        phone,
        email,
        photos,
        course,
        password: hashed_password,
      };
      //Checking if the e-mail exist into the database or not.
      let exist_email = await User.findOne({ email: user.email });
      if (exist_email) {
        return res.status(400).send({ error: "E-mail already registered" });
      }
      //Checking if the e-mail exist into the database or not.
      let exist_phone = await User.findOne({ phone: user.phone });
      if (exist_phone) {
        return res.status(400).send({ error: "Phone already registered" });
      }
      //Checking if the nickname exist into the database or not.
      let exist_nickName = await User.findOne({ nickName: user.nickName });
      if (exist_nickName) {
        return res
          .status(400)
          .send({ error: "This nickname is already in use" });
      }
      let myuser = await User.create(user);

      //Doing the automatic login.
      myuser = myuser.toJSON();
      delete myuser.password;
      delete myuser.__v;
      let token = jwt.sign(myuser, process.env.SECRET_TOKEN, {
        expiresIn: "2h",
      });

      //Sending the user and the token.
      res.setHeader("auth-token", JSON.stringify(token));
      res.status(201).send(myuser);
    } catch (error) {
      res.status(500).send({ error: "Can't access the database!" });
    }
  });
};
