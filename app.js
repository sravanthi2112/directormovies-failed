const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()

app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//case convertion

const caseconversion = dbobject => {
  return {
    movieName: dbobject.movie_name,
  }
}

//get movie list API 1

app.get('/movies/', async (request, response) => {
  const getmoviesquery = `
  SELECT movie_name
  FROM movie`
  const movielist = await db.all(getmoviesquery)
  response.send(movielist.map(eachmovie => caseconversion(eachmovie)))
})

// post movie API 2

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postmoviequery = `
  INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES (
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  await db.run(postmoviequery)
  response.send('Movie Successfully Added')
})

// get movie based on id API 3

const convertcase = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetailsQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movieIdDetail = await db.get(getMovieDetailsQuery)
  response.send(convertcase(movieIdDetail))
})

//API 4 updating the movie details

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateQuery = `
  UPDATE 
    movie 
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId};`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

//API 5 delete a movie from movie table

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM 
    movie
  WHERE 
    movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

// API 6 get list of directors from director table

const directorcaseConversion = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const directorsQuery = `
  SELECT *
  FROM director`
  const direstorsList = await db.all(directorsQuery)
  response.send(
    direstorsList.map(eachDirector => directorcaseConversion(eachDirector)),
  )
})

// API 7 list of all movie names directed by particular director

const directorMovieCaseConversion = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const movieNamesQuery = `
  SELECT movie_name
  FROM movie
  WHERE director_id = ${directorId}`
  const directorMovies = await db.get(movieNamesQuery)
  response.send(caseconversion(directorMovies))
})

module.exports = app
