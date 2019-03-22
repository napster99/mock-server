'use strict'

const router = require('koa-router')()
const mockMid = require('../middleware/mockMid')
const pc = require('../controller/pathController')
const EventEmitter = require('events').EventEmitter
const emiter = new EventEmitter()

async function onmock(app) {
  let allObj = await pc.getAllMockPath()
  for (const pname in allObj) {
    let innerObj = allObj[pname]
    for (const path in innerObj) {
      const theUrl = '/' + pname + path
      router.get(theUrl, mockMid).post(theUrl, mockMid)
    }
  }

  app.use(router.routes())

  //listening for handle trigger
  emiter.on('reflash', url => {
    console.log('reflash::', url)
    router.get(url, mockMid).post(url, mockMid)
  })
}

module.exports = {
  onmock,
  emiter
}
