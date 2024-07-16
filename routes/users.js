/* eslint-disable function-call-argument-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const { storeReturnTo, isLoggedIn, isAdmin } = require("../middleware");

router
  .route("/register")
  .get(isLoggedIn, isAdmin, users.renderRegister)
  .post(isLoggedIn, isAdmin, catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      // logs the user in and clears req.session
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login // res.locals.returnTo to redirect the user after login
  );

router.get("/logout", isLoggedIn, users.logout);

router.get(
  "/management/user",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const users = await User.find({});
    res.render("users/index", { users, currentUser: req.user });
  })
);

router.get(
  "/management/user/:id/edit",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render("users/edit", { user });
  })
);

router.put(
  "/management/user/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body.user, { new: true });
    req.flash("success", "Successfully updated user!");
    res.redirect("/management/user");
  })
);

router.delete(
  "/management/user/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted user!");
    res.redirect("/management/user");
  })
);

module.exports = router;
