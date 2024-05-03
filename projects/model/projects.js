var mongoose = require("mongoose");
var projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  finished_jobs: [
    {
      job_name: String,
    },
  ],
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, default: Date.now },
  team_members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isArchived: { type: Boolean, default: false },
});
mongoose.model("Project", projectSchema);
