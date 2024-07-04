// middleware.js

const { newsSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const News = require("./models/news");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Harap login terlebih dahulu.");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateNews = (req, res, next) => {
  const { error } = newsSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const news = await News.findById(id);
  if (!news.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission.");
    return res.redirect(`/news/${id}`);
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next();
  }
  req.flash("error", "You do not have permission.");
  res.redirect("/");
};
