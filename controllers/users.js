const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("./users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, password, name, admin } = req.body;
    const user = new User({ username, name, admin });
    const registeredUser = await User.register(user, password);
    req.flash("success", "Register succesfully!");
    res.redirect("/register");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("./users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/dashboard"; // update this line to use res.locals.returnTo now
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  // eslint-disable-next-line prefer-arrow-callback, func-names
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout success!");
    res.redirect("/login");
  });
};
