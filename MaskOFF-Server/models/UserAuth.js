// models/UserAuth.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const SALT_ROUNDS = 10;

// Subdocument schema for storing friend info (userID and username)
const friendSubSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    username: { type: String, required: true },
  },
  { _id: false }
);

const UserAuthSchema = new mongoose.Schema(
  {
    // Single name field
    name: { type: String, required: true, trim: true },

    // Date of birth
    dob: { type: Date, required: true },

    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    // Email & password reset
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Friend relationships (optional)
    friendRequestsSent: { type: [friendSubSchema], default: [] },
    friendRequestsReceived: { type: [friendSubSchema], default: [] },
    friends: { type: [friendSubSchema], default: [] },
  },
  { timestamps: true }
);

// Hash password if modified
UserAuthSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  next();
});

// Compare provided password with stored hash
UserAuthSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate a verification token for email verification
UserAuthSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.verificationToken = token;
  return token;
};

// Generate a reset password token (with expiration)
UserAuthSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

// Virtual: Expose a friendly userID in JSON
UserAuthSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.userID = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});
UserAuthSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("UserAuth", UserAuthSchema);
