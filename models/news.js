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

// const ProjectSchema = new Schema(
//   {
//     title: String,
//     description: String,
//     repository: String,
//     category: String,
//     images: [ImageSchema],
//     author: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     reviews: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Review",
//       },
//     ],
//   },
//   opts
// );

// module.exports.newsSchema = Joi.object({
//   news: Joi.object({
//     title: Joi.string().required().escapeHTML(),
//     subtitle: Joi.string().escapeHTML(),
//     body: Joi.string().required(),
//     category: Joi.string().required().valid("regional", "witel"),
//     created_at: Joi.date().default(Date.now),
//     updated_at: Joi.date().default(Date.now),
//   }).required(),
//   deleteImages: Joi.array(),
// });

const NewsSchema = new Schema(
  {
    title: String,
    subtitle: String,
    body: String,
    category: {
      type: String,
      enum: ["regional", "witel"],
      default: "regional",
    },
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//

NewsSchema.virtual("properties.popUpMarkup").get(function () {
  return `<a href="/news/${this._id}">${this.title}</a>`;
});

// NewsSchema.post("findOneAndDelete", async (doc) => {
//   if (doc) {
//     // delete all reviews where their ID field is in
//     // the 'doc' or in the deleted campground
//     await Review.deleteMany({
//       _id: {
//         $in: doc.reviews,
//       },
//     });
//   }
// });

module.exports = mongoose.model("News", NewsSchema);
