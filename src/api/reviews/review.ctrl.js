const reviewModel = require('../../db/model/review')
const exhibition = require('../../db/model/exhibition')
const count = require('../../db/model/getcount')
const upload = require('../../lib/s3Connect')
const mysql = require('../../lib/dbConnection')
const renewFunc = require('../../moduels/calAverage.js')
const dbpool = require('../../../config/connection')
const jwt = require('../../lib/token')

exports.writeReview = async (req, res) => {
  const { body, file } = req
  const { exId, reviewGrade } = body
  const { token } = req.header
  try {
    const tokenInfo = await jwt.decodedToken(token)
    pool = await mysql(dbpool)
    const queryResult = await reviewModel.writeReview(body, file, 1, pool)
    const totalCount = await count.getcount(exId, pool)
    const average = await exhibition.getExScore(exId, pool)
    const newAverage = renewFunc(totalCount.count, average.grade, reviewGrade)
    const scoreResult = await exhibition.updateScore(exId, newAverage, pool)
  } catch (e) {
    console.log(e) 
    pool.release()
    res.status(500).send({
      status: 'fail',
      code: 7001,
      message: 'write review select fail',
    })
    return
  }
  pool.release()
  res.status(200).send({
    status: 'success',
    code: 7000,
    message: 'write review select success',
  })
}

exports.getReview = async (req, res) => {
  try {
    const { query } = req
    pool = await mysql(dbpool)
    queryResult = await reviewModel.getReview(query, pool)
  } catch (e) {
    pool.release()
    res.status(500).send({
      status: 'fail',
      code: 7002,
      message: e,
    })
  }
  pool.release()
  res.status(200).send({
    status: 'success',
    code: 7000,
    message: 'Review Detail select success',
    data: {
      reviewData: queryResult,
      reviewLength: queryResult.length,
    },
  })
}

exports.updateReivew = async (req, res) => {
  const { body, file } = req
  const { exId, reviewGrade } = body
  const { token } = req.headers
  try {
    const tokenInfo = await jwt.decodedToken(token, req.app.get('jwt-secret'))
    pool = await mysql(dbpool)
    const queryResult = await reviewModel.updateReview(body, file, tokenInfo.userId, pool)
    const totalCount = await count.getcount(exId, pool)
    const average = await exhibition.getExScore(exId, pool)
    const newAverage = renewFunc(totalCount.count, average.grade, reviewGrade)
    const scoreResult = await exhibition.updateScore(exId, newAverage, pool)
  } catch (e) {
    console.log(e)
    pool.release()
    res.status(500).send({
      status: 'fail',
      code: 7003,
      message: 'update review fail',
    })
    return
  }
  pool.release()
  res.status(200).send({
    status: 'success',
    code: 7000,
    message: 'update review select success',
  })
}


exports.deleteReview = async (req, res) => {
  const { reviewId } = req.query
  const { token } = req.headers
  try {
    const tokenInfo = await jwt.decodedToken(token, req.app.get('jwt-secret'))
    pool = await mysql(dbpool)
    queryResult = await reviewModel.deleteReview(reviewId, tokenInfo.userId, pool)
  } catch (e) {
    console.log(e)
    pool.release()
    res.status(500).send({
      status: 'fail',
      code: 7004,
      message: e,
    })
    return
  }
  pool.release()
  res.status(200).send({
    status: 'success',
    code: 7000,
    message: 'Review delete success',
  })
}


exports.getListGuide = async (req, res) => {
  const { query } = req
  const { token } = req.headers
  try {
    const tokenInfo = await jwt.decodedToken(token, req.app.get('jwt-secret'))
    pool = await mysql(dbpool)
    const queryResult = await reviewModel.guideList(query, pool)
  } catch (e) {
    pool.release()
    res.status(500).send({
      status: 'fail',
      code: 7005,
      message: 'Sitelist select fail',
    })
  }
  pool.release()
  res.status(200).send({
    status: 'success',
    conde: 7000,
    message: 'Favorlist select success',
    data: queryResult,
  })
}