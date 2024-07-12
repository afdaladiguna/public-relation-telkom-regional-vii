const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware");
const album = require("../controllers/album");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Album = require("../models/album");

router
  .route("/")
  .get(isLoggedIn, isAdmin, catchAsync(album.index))
  .post(
    isLoggedIn,
    isAdmin,
    upload.array("image"),
    catchAsync(album.createAlbum)
  );

router.get("/create", isLoggedIn, isAdmin, album.renderNewForm);

router
  .route("/:id")
  .get(isLoggedIn, isAdmin, catchAsync(album.showAlbum))
  .put(
    isLoggedIn,
    isAdmin,
    upload.array("image"),
    catchAsync(album.updateAlbum)
  )
  .delete(isLoggedIn, isAdmin, catchAsync(album.deleteAlbum));

router.get("/:id/edit", isLoggedIn, isAdmin, catchAsync(album.renderEditForm));

module.exports = router;
