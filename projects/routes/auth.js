const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret =
  "5ec291dd34c91fa22adc6463973febd7c1483908f58b67dc3a49d54eec4b1922008e3c";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decodedToken;
    next();
  });
};

router.get("/", authenticateToken, (req, res) => {
  const loggedInUser = req.user;
  res.send(`Logged in user: ${loggedInUser.userName}`);
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { userName, password, confirmPassword } = req.body;
    if (!userName || !password || password !== confirmPassword) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userName, password: hashedPassword });
    await user.save();

    const maxAge = 3 * 60 * 60; // 3 hours
    const token = jwt.sign({ id: user._id, userName }, jwtSecret, {
      expiresIn: maxAge,
    });

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/?auth=" + true + "&userId=" + user._id);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const maxAge = 3 * 60 * 60; // 3 hours
    const token = jwt.sign({ id: user._id, userName }, jwtSecret, {
      expiresIn: maxAge,
    });

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/?auth=" + true + "&userId=" + user._id);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to login user", error: error.message });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

module.exports = router;
