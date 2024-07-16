/* eslint-disable import/no-extraneous-dependencies */
const { name } = require("ejs");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

// const UserSchema = new Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
// });

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

UserSchema.plugin(passportLocalMongoose); // automaticly adding username and password field

module.exports = mongoose.model("User", UserSchema);
