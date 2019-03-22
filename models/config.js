'use strict'

module.exports = {
  local: {
    redis_config: {
      // keyPrefix: 'bs:',
      host: '127.0.0.1',
      port: 6379
    }
  },
  daily: {
    redis_config: {
      // keyPrefix: 'bs:',
      host: 'common-redis.fe-daily.svc.cluster.local',
      port: 6379
    }
  }
}
