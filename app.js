'use strict'

const Koa = require('koa')
const path = require('path')
const json = require('koa-json')
const cors = require('koa-cors')
const onerror = require('koa-onerror')
const staticServer = require('koa-static')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const timerMid = require('./middleware/timerMid')
const onmock = require('./service/onmock')['onmock']
const index = require('./routes/index')
const health = require('./routes/health')
const app = new Koa()

// error handler
onerror(app)

onmock(app)

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)

app.use(staticServer(path.join(__dirname, './public')))
app.use(json())
app.use(logger())
app.use(cors())

// timer
app.use(timerMid)

app.use(index.allowedMethods())

// routes
app.use(index.routes())
app.use(health.routes())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
