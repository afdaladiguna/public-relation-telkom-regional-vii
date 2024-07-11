const express = require("express");
const router = express.Router();
const { isLoggedIn, validateNews, isAdmin } = require("../middleware");
const news = require("../controllers/news");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const News = require("../models/news");

router
  .route("/")
  .get(isLoggedIn, isAdmin, catchAsync(news.index))
  .post(
    isLoggedIn,
    isAdmin,
    upload.array("image"),
    validateNews,
    catchAsync(news.createNews)
  );

router.get("/write", isLoggedIn, isAdmin, news.renderNewForm);

router
  .route("/:id")
  .get(isLoggedIn, catchAsync(news.showNews))
  .put(
    isLoggedIn,
    isAdmin,
    upload.array("image"),
    validateNews,
    catchAsync(news.updateNews)
  )
  .delete(isLoggedIn, isAdmin, catchAsync(news.deleteNews));

router.get("/:id/edit", isLoggedIn, isAdmin, catchAsync(news.renderEditForm));

module.exports = router;
