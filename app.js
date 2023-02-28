const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");
let database = null;

const InitializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("listening to http://localhost:3000/"));
  } catch (err) {
    console.log(`${err.message}`);
    process.exit(1);
  }
};

InitializeDBAndServer();

convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (req, res) => {
  const getMovieNameQuery = `SELECT movie_name FROM movie; `;

  const moviesArray = await database.all(getMovieNameQuery);
  res.send(
    moviesArray.map((eachMovie) =>
      convertMovieDbObjectToResponseObject(eachMovie)
    )
  );
});

app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;

  const AddMovieQuery = `INSERT INTO 
    movie(director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}')`;

  const updateDatabase = await database.run(AddMovieQuery);

  const movieId = updateDatabase.lastID;
  res.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const GetMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movie = await database.get(GetMovieQuery);
  res.send(convertMovieDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;

  const { movieId } = req.params;
  const updateMovieQuery = `
      UPDATE movie 
      SET
      director_id = ${directorId},
      movie_name= "${movieName}",
      lead_actor = "${leadActor}"
      WHERE 
      movie_id="${movieId}";
       `;

  await database.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

// Movie Removed

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const DeleteMovieQuery = `
     DELETE FROM movie where movie_id = ${movieId};`;

  const DeleteMovie = await database.run(DeleteMovieQuery);

  res.send("Movie Removed");
});

app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `SELECT * FROM  director; `;

  const DirectorsArray = await database.all(getDirectorsQuery);
  res.send(
    DirectorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;

  const GetMoviesDirectedQuery = `SELECT movie_name FROM 
  movie 
  WHERE
   director_id = ${directorId};`;

  const MovieDirectorArray = await database.all(GetMoviesDirectedQuery);
  res.send(
    MovieDirectorArray.map((EachMovie) =>
      convertMovieDbObjectToResponseObject(EachMovie)
    )
  );
});
