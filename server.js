const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "ratings.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initial seed data if file doesn't exist
const SEED_RATINGS = [
  {
    id: "seed-1",
    rating: 5,
    name: "Alex Johnson",
    comment: "Super smooth animation and very intuitive widget!",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "seed-2",
    rating: 5,
    name: "Sophia Martinez",
    comment: "Clean layout, love the distribution breakdown bar.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "seed-3",
    rating: 4,
    name: "David Kim",
    comment: "Great responsive design on mobile and desktop.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

// Helper to calculate statistics
function calculateStats(ratings) {
  const total = ratings.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  ratings.forEach((item) => {
    if (distribution[item.rating] !== undefined) {
      distribution[item.rating]++;
    }
    sum += item.rating;
  });

  const average = total ? Number((sum / total).toFixed(1)) : 0.0;

  return { total, average, distribution };
}

// Asynchronously read ratings
async function readRatings() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // Create seed file if it doesn't exist
      await saveRatings(SEED_RATINGS);
      return SEED_RATINGS;
    }
    return [];
  }
}

// Asynchronously save ratings
async function saveRatings(ratings) {
  await fs.writeFile(DATA_FILE, JSON.stringify(ratings, null, 2), "utf8");
}

// GET: Retrieve aggregated ratings and recent feedback
app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await readRatings();
    const stats = calculateStats(ratings);

    // Return the latest 10 reviews first
    const recentReviews = [...ratings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      success: true,
      total: stats.total,
      average: stats.average,
      distribution: stats.distribution,
      reviews: recentReviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load ratings." });
  }
});

// POST: Submit a new rating
app.post("/api/ratings", async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const name = (req.body.name || "Anonymous").trim().slice(0, 50);
    const comment = (req.body.comment || "").trim().slice(0, 300);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5."
      });
    }

    const ratings = await readRatings();
    const newRating = {
      id: Date.now().toString(),
      rating,
      name: name || "Anonymous",
      comment,
      createdAt: new Date().toISOString()
    };

    ratings.push(newRating);
    await saveRatings(ratings);

    const stats = calculateStats(ratings);
    const recentReviews = [...ratings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.status(201).json({
      success: true,
      message: "Thank you for your valuable feedback!",
      total: stats.total,
      average: stats.average,
      distribution: stats.distribution,
      reviews: recentReviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit rating." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`⭐ Star Rating Widget Server active at http://localhost:${PORT}`);
});
