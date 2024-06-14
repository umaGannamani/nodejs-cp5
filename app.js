const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertObjKeyPascalToCamel = movieObject => {
  return {
    movieName: movieObject.movie_name,
  }
}

const dbObjectToResponseObject = dbMovieObject => {
  return {
    movieId: dbMovieObject.movie_id,
    directorId: dbMovieObject.director_id,
    movieName: dbMovieObject.movie_name,
    leadActor: dbMovieObject.lead_actor,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
  SELECT
  movie_name
  FROM
  movie;`
  const movieArray = await db.all(getMovieQuery)
  response.send(
    movieArray.map(movieDetails => convertObjKeyPascalToCamel(movieDetails)),
  )
})

//API 2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
  INSERT INTO
  movie (director_id, movie_name, lead_actor)
  VALUES ('${directorId}', '${movieName}', '${leadActor}');`
  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//API 3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery1 = `
  SELECT
  *
  FROM
  movie
  WHERE
  movie_id = ${movieId};`
  const movielist = await db.get(getMovieQuery1)
  response.send(dbObjectToResponseObject(movielist))
})

//API 4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  UPDATE movie
  SET 
  director_id = "${directorId}",
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE 
  movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API 5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE
  FROM 
  movie
  WHERE
  movie_id = ${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 6

const convertDirectorDbAPI = objectItem => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  }
}
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT
  *
  FROM
  director;`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray.map(eachItem => convertDirectorDbAPI(eachItem)))
})

//API 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorsMovieQuery = `
  SELECT
  movie_name AS movieName
  FROM
  movie
  WHERE
  director_id = ${directorId};`
  const movieList = await db.all(getDirectorsMovieQuery)
  response.send(movieList)
})
module.exports = app
