const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const partials = require('express-partials');
const passport = require("passport");
const GitHubStrategy = require('passport-github2').Strategy;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=a3-persistence`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (e) {
    console.error("Error connecting to MongoDB:", e); 
  }
}

run().catch(console.dir);

const dbName = "calorie_tracker";
const collectionName = "meals";

const db = client.db(dbName);
const collection = db.collection(collectionName);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/home", ensureAuthenticated, (req, res) => {
    res.render("index", { user: req.user });
});

// GET /meals - grouped by date, with total calories
app.get("/meals", async (req, res) => {
  try {
    const meals = await collection.find({}).toArray();
    const grouped = {};
    meals.forEach((meal) => {
      if (!grouped[meal.date])
        grouped[meal.date] = { meals: [], totalCalories: 0 };
      grouped[meal.date].meals.push(meal);
      grouped[meal.date].totalCalories += meal.calories || 0;
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// POST /submit - add a meal
app.post("/submit", async (req, res) => {
  try {
    const receivedData = req.body;

    if (!receivedData) {
      return res.status(400).json({ error: "No data received" });
    }

    receivedData.date = new Date().toISOString().split("T")[0];
    console.log(new Date().toISOString());
    await collection.insertOne(receivedData);
    await sendGroupedMeals(res, "added");
  } catch (err) {
    res.status(500).json({ error: "Failed to add meal" });
  }
});

// POST /delete - delete a meal by id
app.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "No id provided" });
    }

    await collection.deleteOne({ _id: new ObjectId(String(id)) }); // Casting id to a string or else I get a weird deprecation error
    await sendGroupedMeals(res, "deleted");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

// POST /update - update a meal by id
app.post("/update", async (req, res) => {
  try {
    const updated = req.body;
    console.log("Update request body:", updated);
    if (!updated._id) {
      return res.status(400).json({ error: "No _id provided" });
    }
    const { _id, ...fieldsToUpdate } = updated;
    await collection.updateOne({ _id: new ObjectId(String(_id)) }, { $set: fieldsToUpdate });
    await sendGroupedMeals(res, "updated");
  } catch (err) {
    res.status(500).json({ error: "Failed to update meal" });
  }
});

// Helper to send grouped meals
async function sendGroupedMeals(res, status) {
  const meals = await collection.find({}).toArray();
  const grouped = {};
  meals.forEach((meal) => {
    if (!grouped[meal.date])
      grouped[meal.date] = { meals: [], totalCalories: 0 };
    grouped[meal.date].meals.push(meal);
    grouped[meal.date].totalCalories += Number(meal.calories) || 0;
  });
  res.json({ status, grouped });
}

app.use((req, res) => {
  res.status(404).send("404 Error: File Not Found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
