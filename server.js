const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "ratings.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readRatings() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveRatings(ratings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(ratings, null, 2));
}

app.get("/api/ratings", (req, res) => {
  const ratings = readRatings();
  const total = ratings.length;
  const average = total
    ? ratings.reduce((sum, item) => sum + item.rating, 0) / total
    : 0;

  res.json({
    total,
    average: Number(average.toFixed(1)),
    ratings
  });
});

app.post("/api/ratings", (req, res) => {
  const rating = Number(req.body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
  }

  const ratings = readRatings();
  const newRating = {
    id: Date.now().toString(),
    rating,
    createdAt: new Date().toISOString()
  };

  ratings.push(newRating);
  saveRatings(ratings);

  const average = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;

  res.status(201).json({
    message: "Thank you for your rating!",
    total: ratings.length,
    average: Number(average.toFixed(1))
  });
});

app.listen(PORT, () => {
  console.log(`Star Rating Widget running at http://localhost:${PORT}`);
});
