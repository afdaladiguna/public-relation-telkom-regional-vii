/* eslint-disable global-require */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");
const News = require("./models/news");
const Album = require("./models/album");
const userRoutes = require("./routes/users");

// const projectRoutes = require("./routes/projects");
const newsRoutes = require("./routes/news");
const albumRoutes = require("./routes/album");
const { isLoggedIn } = require("./middleware");
// const reviewRoutes = require("./routes/reviews");
const dbUrl = process.env.DB_URL;

mongoose.set("strictQuery", true);

mongoose.connect(dbUrl || "mongodb://localhost:27017/pr-telkom-regional-vii");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl || "mongodb://localhost:27017/pr-telkom-regional-vii",
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.MONGO_SECRET,
  },
});

store.on("error", function (e) {
  console.log("session store error", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: process.env.MONGO_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dmt77y4qm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      mediaSrc: ["https://res.cloudinary.com/dmt77y4qm/"],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/management/news", newsRoutes);
app.use("/management/album", albumRoutes);
// app.use("/projects", projectRoutes);
// app.use("/projects/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/album", isLoggedIn, async (req, res) => {
  const album = await Album.find({});
  res.render("album", { album });
});

app.get("/album/:id", isLoggedIn, async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      req.flash("error", "Cannot find that album!");
      return res.redirect("/album");
    }
    res.render("management/album/show", { album });
  } catch (error) {
    next(error);
  }
});

app.get("/news", isLoggedIn, async (req, res) => {
  const news = await News.find({});
  res.render("news", { news });
});

app.get("/news/:id", isLoggedIn, async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate("author", "name");
    if (!news) {
      throw new ExpressError("News not found", 404);
    }
    res.render("management/show", { news });
  } catch (error) {
    next(error);
  }
});

app.get("/dashboard", isLoggedIn, async (req, res) => {
  const albums = await Album.find().limit(3); // Adjust limit as needed
  const news = await News.find().limit(4); // Adjust limit as needed
  const breakingNews = await News.find().sort({ createdAt: -1 }).limit(5); // Latest breaking news
  const upcomingEvents = await Album.find({
    eventDate: { $gte: new Date() },
  }).limit(5); // Upcoming events
  res.render("dashboard", { albums, news, breakingNews, upcomingEvents });
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(status).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server run on 3000");
});
