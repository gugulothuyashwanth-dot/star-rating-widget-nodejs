# Star Rating Widget (Node.js)

A beginner-friendly star rating project using Node.js, Express, HTML, CSS and JavaScript.

## Features
- Select a rating from 1 to 5 stars.
- Hover effect and rating labels.
- Submit ratings to a Node.js backend.
- View average rating and total number of ratings.
- Save ratings in `ratings.json` so they remain after restarting the server.

## Requirements
- Node.js (LTS version)
- npm

## Run the project

1. Extract the ZIP file.
2. Open the project folder in VS Code.
3. Open the terminal in that folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the server:

   ```bash
   npm start
   ```

6. Open this address in your browser:

   http://localhost:3000

## Project structure

```text
star-rating-widget-nodejs/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── package.json
├── server.js
└── README.md
```

## How it works

1. `index.html` displays the five stars and rating summary.
2. `style.css` styles the widget.
3. `app.js` handles star selection and sends the selected rating to the server.
4. `server.js` provides the API using Express.
5. `ratings.json` is created automatically when the first rating is submitted and stores ratings.

## API endpoints

- `GET /api/ratings` — returns all ratings, average rating and total count.
- `POST /api/ratings` — saves a rating. Send JSON such as `{ "rating": 5 }`.

Note: This starter project stores data in a local JSON file. For a production website with multiple users or servers, use a database such as MongoDB or PostgreSQL and add user identification/rate-limiting to prevent duplicate or abusive submissions.
