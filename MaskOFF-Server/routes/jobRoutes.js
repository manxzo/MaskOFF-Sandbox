const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const UserProfile = require("../models/UserProfile");
const { verifyToken } = require("../components/jwtUtils");

// Create a new job
router.post("/jobs", verifyToken, async (req, res) => {
  try {
    const { title, description, price, contractPeriod } = req.body;

    if (!title || !description || !price || !contractPeriod) {
      return res.status(400).json({
        error: "Title, description, price, and contract period are required.",
      });
    }

    const newJob = new Job({
      user: req.user.id,
      title,
      description,
      price,
      contractPeriod,
    });

    await newJob.save();
    res.status(201).json({
      message: "Job created successfully.",
      job: newJob.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all jobs with user profile info
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().populate("user", "username");

    const jobsWithProfile = await Promise.all(
      jobs.map(async (job) => {
        const profile = await UserProfile.findOne({ user: job.user._id });
        return {
          ...job.toJSON(),
          user: {
            userID: job.user._id,
            username: job.user.username,
            publicInfo: profile ? profile.publicInfo : {},
          },
        };
      })
    );
    res.json({ jobs: jobsWithProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single job by jobID
router.get("/jobs/:jobID", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobID).populate(
      "user",
      "username"
    );

    if (!job) return res.status(404).json({ error: "Job not found." });

    const profile = await UserProfile.findOne({ user: job.user._id });

    res.json({
      job: {
        ...job.toJSON(),
        user: {
          userID: job.user._id,
          username: job.user.username,
          publicInfo: profile ? profile.publicInfo : {},
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a job
router.put("/jobs/:jobID", verifyToken, async (req, res) => {
  try {
    const { jobID } = req.params;
    const { title, description, price, contractPeriod, isComplete } = req.body;

    const job = await Job.findById(jobID);
    if (!job) return res.status(404).json({ error: "Job not found." });

    // Check if the user owns the job
    if (job.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this job." });
    }

    // Update fields if provided
    if (title) job.title = title;
    if (description) job.description = description;
    if (price) job.price = price;
    if (contractPeriod) job.contractPeriod = contractPeriod;
    if (typeof isComplete !== "undefined") job.isComplete = isComplete;

    await job.save();
    res.json({ message: "Job updated", job: job.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a job
router.delete("/jobs/:jobID", verifyToken, async (req, res) => {
  try {
    const { jobID } = req.params;
    const job = await Job.findById(jobID);

    if (!job) return res.status(404).json({ error: "Job not found." });

    // Check if the user owns the job
    if (job.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this job." });
    }

    await Job.findByIdAndDelete(jobID);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get jobs by user
router.get("/users/:userID/jobs", async (req, res) => {
  try {
    const { userID } = req.params;
    const jobs = await Job.find({ user: userID }).populate("user", "username");

    const profile = await UserProfile.findOne({ user: userID });

    const jobsWithProfile = jobs.map((job) => ({
      ...job.toJSON(),
      user: {
        userID: job.user._id,
        username: job.user.username,
        publicInfo: profile ? profile.publicInfo : {},
      },
    }));

    res.json({ jobs: jobsWithProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
