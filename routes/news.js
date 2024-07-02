const express = require("express");
const router = express.Router();
const { isLoggedIn, validateNews, isAuthor } = require("../middleware");
// const projects = require("../controllers/projects");
const news = require("../controllers/news");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// const Project = require("../models/project");
const News = require("../models/news");

router
  .route("/")
  .get(isLoggedIn, catchAsync(news.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateNews,
    catchAsync(news.createNews)
  );

router.get("/write", isLoggedIn, news.renderNewForm);

router
  .route("/:id")
  .get(isLoggedIn, catchAsync(news.showNews))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateNews,
    catchAsync(news.updateNews)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(news.deleteNews));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(news.renderEditForm));

module.exports = router;
