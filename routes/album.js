const express = require("express");
const router = express.Router();
const { isLoggedIn, validateNews, isAuthor } = require("../middleware");
// const projects = require("../controllers/projects");
const album = require("../controllers/album");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// const Project = require("../models/project");
const Album = require("../models/album");

router.route("/").get(isLoggedIn, catchAsync(album.index)).post(
  isLoggedIn,
  upload.array("image"),
  // validateAlbum,
  catchAsync(album.createAlbum)
);

router.get("/create", isLoggedIn, album.renderNewForm);

router
  .route("/:id")
  .get(isLoggedIn, catchAsync(album.showAlbum))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    // validateAlbum,
    catchAsync(album.updateAlbum)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(album.deleteAlbum));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(album.renderEditForm));

module.exports = router;
