const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializingDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running.....");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializingDatabaseAndServer();

const convertToCamelCase = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

// API 1 -- Showing all Movie Names
app.get("/movies/", async (request, response) => {
  const getMovieNames = `SELECT movie_name FROM movie;`;
  const movieNames = await db.all(getMovieNames);
  response.send(movieNames.map((obj) => convertToCamelCase(obj)));
});

// API 2 -- Adding a Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    INSERT INTO movie (director_id, movie_name, lead_actor) 
    VALUES (${directorId},'${movieName}', '${leadActor}');`;

  await db.run(addMovie);
  response.send("Movie Successfully Added");
});

// API 3 -- Showing a Movie using movieId
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT * FROM movie
    WHERE movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieDetails);
  response.send(convertToCamelCase(movieDetails));
});

// API 4 -- Update Details based on movieId
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
  UPDATE movie
  SET
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
  WHERE movie_id = ${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});
