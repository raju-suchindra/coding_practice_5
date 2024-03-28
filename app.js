// const express = require('express')
// const path = require('path')
// const app = express()
// app.use(express.json())

const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//GET all information
app.get('/movies/', async (request, response) => {
  const getMovieQuery = `SELECT * FROM movie ;`
  const moviesobject = await db.all(getMovieQuery)
  const ans = moviesobject => {
    return {
      movieName: moviesobject.movie_name,
    }
  }
  response.send(moviesobject.map(eachMovie => ans(eachMovie)))
})
// app.get('/', async (request, response) => {
//   const getAllInfoQuery = `
//         SELECT
//           *
//         FROM
//           movie;
//     `
//   const infoArray = await db.all(getAllInfoQuery)
//   response.send(infoArray)
// })

//GET all Movie Names API
app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
        SELECT
          movie_name as movieName
        FROM
          movie;
    `
  const movieArray = await db.all(getAllMoviesQuery)
  response.send(movieArray)
})

//POST a new movie
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addNewMovieQuery = `
        INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES (${directorId},'${movieName}','${leadActor}');`
  await db.run(addNewMovieQuery)
  response.send('Movie Successfully Added')
})

//GET a particular movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getParticularMovieQuery = `
        SELECT
          movie_id as movieId,
          director_id as directorId,
          movie_name as movieName,
          lead_actor as leadActor
        FROM
          movie
        WHERE
          movie_id = ${movieId};`
  const movie = await db.get(getParticularMovieQuery)
  return response.send(movie)
})

//Update a particular movie based on movie_id
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
        UPDATE
          movie
        SET
          director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
        WHERE
          movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete a particular movie based on movie_id
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//GET all the director Details
app.get('/directors/', async (request, response) => {
  const getDirectorDetailsQuery = `
        SELECT
          director_id as directorId,
          director_name as directorName
        FROM
          director
    `
  const directorsArray = await db.all(getDirectorDetailsQuery)
  response.send(directorsArray)
})

//GET all movies directed by the director with director_id
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesDirectedByADirectorQuery = `
        SELECT
          movie_name as movieName
        FROM
          movie
        WHERE
          director_id = ${directorId};`
  const moviesArray = await db.all(getMoviesDirectedByADirectorQuery)
  response.send(moviesArray)
})

module.exports = app
