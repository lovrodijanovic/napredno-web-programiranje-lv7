var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const Project = mongoose.model("Project");

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().lean();
    projects.forEach((project) => {
      project.start_date_formatted = formatDate(project.start_date);
      project.end_date_formatted = formatDate(project.end_date);
    });
    var isAuth = req.query.auth;
    const userId = req.query.userId;
    if (!isAuth) {
      isAuth = false;
    }
    console.log(isAuth);
    res.render("index", { projects, isAuth, userId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve projects", error: error.message });
  }
});

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

module.exports = router;
