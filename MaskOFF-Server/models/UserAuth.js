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
    // --- Compulsory Authentication Details ---
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      // Uncomment the regex below if you want to enforce strong password rules:
      // match: [/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, 'Password must include uppercase, lowercase, and number']
    },
    // --- Email Authentication & Password Reset Fields ---
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // --- Friend Relationships ---
    friendRequestsSent: { type: [friendSubSchema], default: [] },
    friendRequestsReceived: { type: [friendSubSchema], default: [] },
    friends: { type: [friendSubSchema], default: [] },
  },
  { timestamps: true }
);

// Pre-save hook: hash password when modified or new.
UserAuthSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  next();
});

// Method: Compare provided password with stored hash.
UserAuthSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method: Generate a verification token for email verification.
UserAuthSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.verificationToken = token;
  return token;
};

// Method: Generate a reset password token (with expiration).
UserAuthSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour.
  return token;
};

// Virtual: Expose a friendly userID in JSON output.
UserAuthSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.userID = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Do not send password hash to client.
    return ret;
  },
});
UserAuthSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("UserAuth", UserAuthSchema);
