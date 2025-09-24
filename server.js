const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));

const { MongoClient, ServerApiVersion } = require("mongodb");
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
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

const dbName = "calorie_tracker";
const collectionName = "meals";

const db = client.db(dbName);
const collection = db.collection(collectionName);

app.get("/", (req, res) => {
  res.render("index");
});
// GET /meals - grouped by date, with total calories
app.get("/meals", async (req, res) => {
  try {
    const meals = await db.collection("meals").find({}).toArray();
    console.log("hello");
    console.log(meals);
    const grouped = {};
    meals.forEach((meal) => {
      if (!grouped[meal.date])
        grouped[meal.date] = { meals: [], totalCalories: 0 };
      grouped[meal.date].meals.push(meal);
      grouped[meal.date].totalCalories += Number(meal.calories) || 0;
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
    receivedData.id = Date.now() + Math.random().toString(36).slice(2);
    receivedData.date = new Date().toISOString().split("T")[0];
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
    await collection.deleteOne({ id });
    await sendGroupedMeals(res, "deleted");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

// POST /update - update a meal by id
app.post("/update", async (req, res) => {
  try {
    const updated = req.body;
    await collection.updateOne({ id: updated.id }, { $set: updated });
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

// Fallback for 404s (if not handled by static or above routes)
app.use((req, res) => {
  res.status(404).send("404 Error: File Not Found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
