'use strict'

/**
 * Mock Path
 */

let instance = null
const redisCli = require('../models/redis_cli')

let emiter = null
process.nextTick(() => {
  emiter = require('../service/onmock')['emiter']
})

class PathController {
  constructor() {}

  async getAllMockPath() {
    let allObj = {},
      pnameArrs = await redisCli.smembers()
    for (let i = 0; i < pnameArrs.length; i++) {
      const pname = pnameArrs[i]
      if (!allObj[pname]) allObj[pname] = {}
      let keys = await redisCli.hkeys(pname)
      for (let j = 0, len = keys.length; j < len; j++) {
        let schemaData = await redisCli.hmget(pname, keys[j])
        allObj[pname][keys[j]] = (schemaData && schemaData[0]) || null
      }
    }

    return allObj
  }

  async getSchemaData(pname, path) {
    return await redisCli.hmget(pname, path)
  }

  async outerAllMockPath() {
    let allObj = await this.getAllMockPath()
    let arrs = []
    for (const i in allObj) {
      for (const j in allObj[i]) {
        arrs.push({
          pname: i,
          path: j,
          templ: allObj[i][j]
        })
      }
    }

    return arrs
  }

  pathAdd(pname, path, templ) {
    redisCli.sadd(pname)
    redisCli.addPathMock(pname, path, templ)
    emiter.emit('reflash', '/' + pname + path)
  }

  delPath(pname, path) {
    redisCli.delPathMock(pname, path)
  }

  async isMockPath(pname, path) {
    return await redisCli.hmget(pname, path)
  }
}

module.exports = instance || (instance = new PathController())
