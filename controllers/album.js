/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
// const Project = require("../models/project");
const Album = require("../models/album");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const album = await Album.find({});
  // console.log(album);
  res.render("management/album/index", { album });
};

module.exports.renderNewForm = (req, res) => {
  res.render("management/album/new");
};

module.exports.createAlbum = async (req, res, next) => {
  const album = new Album(req.body.album);
  album.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  album.author = req.user._id;
  await album.save();
  req.flash("success", "Successfully made a new album!");
  res.redirect(`/album/${album._id}`);
};

module.exports.showAlbum = async (req, res) => {
  const album = await Album.findById(req.params.id);
  // .populate({ path: "reviews", populate: { path: "author" } })
  // .populate("author");
  if (!album) {
    req.flash("error", "Cannot find that album!");
    return res.redirect("/album");
  }
  res.render("management/show", { album });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const album = await Album.findById(id);
  if (!album) {
    req.flash("error", "Cannot find that album!");
    return res.redirect(`/album/${id}`);
  }
  res.render("management/edit", { album });
};

module.exports.updateAlbum = async (req, res) => {
  const album = await Album.findByIdAndUpdate(req.params.id, {
    ...req.body.album,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  album.images.push(...imgs);
  await album.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await album.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully update album!");
  res.redirect(`album/${album._id}`);
};

module.exports.deleteAlbum = async (req, res) => {
  const { id } = req.params;
  const album = await Album.findByIdAndDelete(id);
  for (let image of album.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  req.flash("success", "Successfully deleted album!");
  res.redirect("/management/album");
};
