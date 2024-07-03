const mongoose = require("mongoose");
// const Review = require('./review');
const { Schema } = mongoose;

// https://res.cloudinary.com/depkm8h6l/image/upload/w_300/v1700288641/YelpCamp/pz9hc3pirqmfepz9wcch.jpg
const ImageSchema = new Schema({
  url: String,
  filename: String,
  description: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const AlbumSchema = new Schema(
  {
    title: String,
    description: String,
    date: Date,
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

AlbumSchema.virtual("properties.popUpMarkup").get(function () {
  return `<a href="/album/${this._id}">${this.title}</a>`;
});

module.exports = mongoose.model("Album", AlbumSchema);
