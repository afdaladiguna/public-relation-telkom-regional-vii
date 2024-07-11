/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
// const Project = require("../models/project");
const News = require("../models/news");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const news = await News.find().populate("author", "name");
  res.render("management/index", { news });
};

module.exports.renderNewForm = (req, res) => {
  res.render("management/new");
};

module.exports.createNews = async (req, res, next) => {
  const news = new News(req.body.news);
  news.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  news.author = req.user._id;
  await news.save();
  req.flash("success", "Successfully made a new news!");
  res.redirect(`/news`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const news = await News.findById(id);
  if (!news) {
    req.flash("error", "Cannot find that news!");
    return res.redirect(`/news`);
  }
  res.render("management/edit", { news });
};

module.exports.updateNews = async (req, res) => {
  const news = await News.findByIdAndUpdate(req.params.id, {
    ...req.body.news,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  news.images.push(...imgs);
  await news.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await news.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully update news!");
  res.redirect(`news/${news._id}`);
};

module.exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  const news = await News.findByIdAndDelete(id);
  for (let image of news.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  req.flash("success", "Successfully deleted news!");
  res.redirect("/management/news");
};
