const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = mongoose.model("Project");
const User = mongoose.model("User");

router.post("/", async (req, res) => {
  try {
    const { name, description, price, finished_jobs, start_date, end_date } =
      req.body;
    const project = new Project({
      name,
      description,
      price,
      finished_jobs,
      start_date,
      end_date,
    });
    if (name === null || description === null || price === null) {
      res.redirect("/projects/new?message=fill_all_Fields");
    } else {
      await project.save();
      res.redirect("/");
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create project", error: error.message });
  }
});

router.get("/new", (req, res) => {
  res.render("new-project-form");
});

router.post("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.redirect("back");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete project", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate("team_members");
    const users = await User.find().lean();
    if (!project) {
      res.status(404).send("Project not found");
    } else {
      res.render("project-details", { project, users });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project details",
      error: error.message,
    });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).send("Project not found");
    } else {
      res.render("edit-project-form", { project });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project details for editing",
      error: error.message,
    });
  }
});

router.post("/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, finished_jobs, start_date, end_date } =
      req.body;
    await Project.findByIdAndUpdate(id, {
      name,
      description,
      price,
      finished_jobs,
      start_date,
      end_date,
    });
    res.redirect(`/projects/${id}`);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project details",
      error: error.message,
    });
  }
});

router.post("/:id/add-member", async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.body;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).send("User not found");
    }

    project.team_members.push(user._id);
    await project.save();

    res.redirect(`/projects/${id}`);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add team member to project",
      error: error.message,
    });
  }
});

router.post("/:id/add-manager", async (req, res) => {
  try {
    const { id } = req.params;
    const { manager } = req.body;
    const project = await Project.findById(id);
    const foundManager = await User.findById(manager);
    project.manager = foundManager;
    await project.save();

    res.redirect(`/projects/${id}`);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add manager to project",
      error: error.message,
    });
  }
});

router.post("/:id/update-archive-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;
    const project = await Project.findById(id);

    project.isArchived = archived === "true";

    await project.save();

    res.redirect(`/projects/${id}`);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project archive status",
      error: error.message,
    });
  }
});

module.exports = router;
