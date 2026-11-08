const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("ratingText");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
const averageEl = document.getElementById("average");
const totalEl = document.getElementById("total");

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
let selectedRating = 0;

function paintStars(value, className = "active") {
  stars.forEach((star) => {
    const isOn = Number(star.dataset.rating) <= value;
    star.classList.toggle(className, isOn);
  });
}

stars.forEach((star) => {
  star.addEventListener("mouseenter", () => {
    stars.forEach((item) => item.classList.remove("hovered"));
    paintStars(Number(star.dataset.rating), "hovered");
  });

  star.addEventListener("focus", () => {
    stars.forEach((item) => item.classList.remove("hovered"));
    paintStars(Number(star.dataset.rating), "hovered");
  });

  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.rating);
    stars.forEach((item) => item.classList.remove("hovered", "active"));
    paintStars(selectedRating);
    stars.forEach((item) => {
      item.setAttribute("aria-checked", Number(item.dataset.rating) === selectedRating);
    });
    ratingText.textContent = `${labels[selectedRating - 1]} — ${selectedRating} out of 5`;
    submitBtn.disabled = false;
    message.textContent = "";
  });
});

document.querySelector(".stars").addEventListener("mouseleave", () => {
  stars.forEach((item) => item.classList.remove("hovered"));
  paintStars(selectedRating);
});

async function loadSummary() {
  try {
    const response = await fetch("/api/ratings");
    const data = await response.json();
    averageEl.textContent = data.average.toFixed(1);
    totalEl.textContent = data.total;
  } catch {
    message.textContent = "Could not load rating summary.";
  }
}

submitBtn.addEventListener("click", async () => {
  if (!selectedRating) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: selectedRating })
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Submission failed.");

    message.textContent = data.message;
    averageEl.textContent = data.average.toFixed(1);
    totalEl.textContent = data.total;
    selectedRating = 0;
    stars.forEach((item) => {
      item.classList.remove("active", "hovered");
      item.setAttribute("aria-checked", "false");
    });
    ratingText.textContent = "Select a star to rate";
  } catch (error) {
    message.textContent = error.message;
  } finally {
    submitBtn.textContent = "Submit rating";
    submitBtn.disabled = true;
  }
});

loadSummary();
