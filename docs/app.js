// Elements
const stars = document.querySelectorAll(".star");
const ratingFeedback = document.getElementById("ratingFeedback");
const ratingForm = document.getElementById("ratingForm");
const reviewerName = document.getElementById("reviewerName");
const reviewerComment = document.getElementById("reviewerComment");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const avgRatingEl = document.getElementById("avgRating");
const totalRatingsEl = document.getElementById("totalRatings");
const reviewsListEl = document.getElementById("reviewsList");
const activeModeEl = document.getElementById("activeMode");

// Distribution bar elements
const barElements = {
  5: { bar: document.getElementById("bar5"), count: document.getElementById("count5") },
  4: { bar: document.getElementById("bar4"), count: document.getElementById("count4") },
  3: { bar: document.getElementById("bar3"), count: document.getElementById("count3") },
  2: { bar: document.getElementById("bar2"), count: document.getElementById("count2") },
  1: { bar: document.getElementById("bar1"), count: document.getElementById("count1") }
};

// Labels with sentiment and emojis
const ratingMetadata = {
  1: { text: "Poor", emoji: "😞", desc: "Poor — Needs significant improvement" },
  2: { text: "Fair", emoji: "😐", desc: "Fair — Could be much better" },
  3: { text: "Good", emoji: "🙂", desc: "Good — Satisfied with the project" },
  4: { text: "Very Good", emoji: "😊", desc: "Very Good — Really enjoyed it!" },
  5: { text: "Excellent", emoji: "🤩", desc: "Excellent — Outstanding work!" }
};

let selectedRating = 0;
let isLocalFallback = false;

// Paint Stars Function
function paintStars(value, className = "active") {
  stars.forEach((star) => {
    const starVal = Number(star.dataset.rating);
    const isOn = starVal <= value;
    star.classList.toggle(className, isOn);
  });
}

// Event Listeners for Stars
stars.forEach((star, index) => {
  const ratingValue = Number(star.dataset.rating);

  // Mouse Enter
  star.addEventListener("mouseenter", () => {
    stars.forEach((s) => s.classList.remove("hovered"));
    paintStars(ratingValue, "hovered");
    ratingFeedback.textContent = `${ratingMetadata[ratingValue].emoji} ${ratingMetadata[ratingValue].desc}`;
  });

  // Mouse Focus
  star.addEventListener("focus", () => {
    stars.forEach((s) => s.classList.remove("hovered"));
    paintStars(ratingValue, "hovered");
  });

  // Click
  star.addEventListener("click", () => {
    selectedRating = ratingValue;
    stars.forEach((s) => {
      s.classList.remove("hovered", "active", "pop");
      s.setAttribute("aria-checked", Number(s.dataset.rating) === selectedRating ? "true" : "false");
    });

    paintStars(selectedRating, "active");
    star.classList.add("pop");

    ratingFeedback.textContent = `${ratingMetadata[selectedRating].emoji} ${ratingMetadata[selectedRating].desc}`;
    submitBtn.disabled = false;
    statusMessage.textContent = "";
  });

  // Keyboard Navigation (Arrow Left, Arrow Right)
  star.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const nextStar = stars[Math.min(index + 1, stars.length - 1)];
      nextStar.focus();
      nextStar.click();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prevStar = stars[Math.max(index - 1, 0)];
      prevStar.focus();
      prevStar.click();
    }
  });
});

// Reset Hover on Mouse Leave
document.querySelector(".stars").addEventListener("mouseleave", () => {
  stars.forEach((s) => s.classList.remove("hovered"));
  if (selectedRating > 0) {
    paintStars(selectedRating, "active");
    ratingFeedback.textContent = `${ratingMetadata[selectedRating].emoji} ${ratingMetadata[selectedRating].desc}`;
  } else {
    paintStars(0);
    ratingFeedback.textContent = "Tap a star to rate";
  }
});

// Render Stats & Histogram
function updateStatsUI(data) {
  avgRatingEl.textContent = Number(data.average || 0).toFixed(1);
  totalRatingsEl.textContent = `Based on ${data.total || 0} ${data.total === 1 ? 'rating' : 'ratings'}`;

  const dist = data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const total = data.total || 1;

  for (let r = 1; r <= 5; r++) {
    const count = dist[r] || 0;
    const percentage = data.total > 0 ? (count / total) * 100 : 0;
    if (barElements[r]) {
      barElements[r].bar.style.width = `${percentage}%`;
      barElements[r].count.textContent = count;
    }
  }

  renderReviews(data.reviews || []);
}

// Render Recent Reviews
function renderReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    reviewsListEl.innerHTML = `<div class="loading-shimmer">No reviews yet. Be the first to rate!</div>`;
    return;
  }

  reviewsListEl.innerHTML = reviews.map((r) => {
    const starsIcon = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const dateFormatted = new Date(r.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return `
      <article class="review-item">
        <div class="review-top">
          <span class="review-author">${escapeHTML(r.name || "Anonymous")}</span>
          <span class="review-stars">${starsIcon}</span>
        </div>
        ${r.comment ? `<p class="review-comment">${escapeHTML(r.comment)}</p>` : ""}
        <span class="review-date">${dateFormatted}</span>
      </article>
    `;
  }).join("");
}

function escapeHTML(str) {
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

// LocalStorage Fallback Helpers for static hosting (GitHub Pages)
const LOCAL_STORAGE_KEY = "star_widget_ratings_v1";

function getLocalRatings() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { return []; }
  }
  // Default seed for demo
  const seed = [
    { id: "1", rating: 5, name: "Yashwanth", comment: "Awesome interactive widget!", createdAt: new Date().toISOString() },
    { id: "2", rating: 5, name: "Community User", comment: "Smooth animations and breakdown stats.", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: "3", rating: 4, name: "Reviewer", comment: "Great UI design and responsive feel.", createdAt: new Date(Date.now() - 3600000 * 48).toISOString() }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveLocalRating(rating, name, comment) {
  const list = getLocalRatings();
  const newItem = {
    id: Date.now().toString(),
    rating,
    name: name || "Anonymous",
    comment,
    createdAt: new Date().toISOString()
  };
  list.unshift(newItem);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  return computeLocalStats(list);
}

function computeLocalStats(list) {
  const total = list.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  list.forEach(item => {
    distribution[item.rating] = (distribution[item.rating] || 0) + 1;
    sum += item.rating;
  });
  const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;
  return { total, average, distribution, reviews: list.slice(0, 10) };
}

// Fetch Initial Data
async function loadRatings() {
  try {
    const res = await fetch("/api/ratings");
    if (!res.ok) throw new Error("API not accessible");
    const data = await res.json();
    isLocalFallback = false;
    activeModeEl.textContent = "⚡ API Live";
    activeModeEl.style.background = "#dcfce7";
    activeModeEl.style.color = "#15803d";
    updateStatsUI(data);
  } catch (err) {
    // Graceful fallback to client-side localStorage for GitHub Pages / static hosting!
    isLocalFallback = true;
    activeModeEl.textContent = "🌐 Demo Mode";
    activeModeEl.style.background = "#fef3c7";
    activeModeEl.style.color = "#b45309";
    const data = computeLocalStats(getLocalRatings());
    updateStatsUI(data);
  }
}

// Handle Form Submission
ratingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedRating) return;

  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").textContent = "Submitting...";

  const payload = {
    rating: selectedRating,
    name: reviewerName.value.trim(),
    comment: reviewerComment.value.trim()
  };

  try {
    if (!isLocalFallback) {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit.");

      statusMessage.textContent = data.message || "Thank you for your rating!";
      updateStatsUI(data);
    } else {
      // Local fallback mode
      const updatedData = saveLocalRating(payload.rating, payload.name, payload.comment);
      statusMessage.textContent = "Thank you for your rating! (Saved locally)";
      updateStatsUI(updatedData);
    }

    // Reset Form
    reviewerName.value = "";
    reviewerComment.value = "";
    selectedRating = 0;
    stars.forEach((s) => {
      s.classList.remove("active", "hovered", "pop");
      s.setAttribute("aria-checked", "false");
    });
    ratingFeedback.textContent = "Tap a star to rate";

    setTimeout(() => {
      statusMessage.textContent = "";
    }, 4500);

  } catch (error) {
    statusMessage.textContent = error.message;
    statusMessage.style.color = "#ef4444";
  } finally {
    submitBtn.querySelector(".btn-text").textContent = "Submit Rating";
    submitBtn.disabled = true;
  }
});

// Initialize on page load
loadRatings();
