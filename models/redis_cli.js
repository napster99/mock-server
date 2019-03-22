'use strict'

const Redis = require('ioredis')
const redisConfig = require('./config')[process.env.ENV || 'local'][
  'redis_config'
]
const redisCli = new Redis(redisConfig)

let instance = null,
  prefix = 'bsurl'

class RedisCli {
  constructor() {}
  // 哈希存储 key：pname field：path value：templ
  addPathMock(pname, path, templ) {
    redisCli.hmset(pname, path, templ)
  }
  // 删除哈希值
  delPathMock(pname, path) {
    redisCli.hdel(pname, path)
  }
  // 获取 给定了 key和field 的哈希值
  hmget(pname, path) {
    return new Promise((resolve, reject) => {
      redisCli.hmget(pname, path, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  // 无序集合存储 接口名
  sadd(pname) {
    redisCli.sadd(prefix, pname)
  }
  // 返回无序集合中的所有元素
  smembers() {
    return new Promise((resolve, reject) => {
      redisCli.smembers(prefix, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  // 获取 哈希 表中的所有字段
  hkeys(pname) {
    return new Promise((resolve, reject) => {
      redisCli.hkeys(pname, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  // 删除制定的 key
  removeItem(path) {
    redisCli.del(path)
  }
}

module.exports = instance || (instance = new RedisCli())
