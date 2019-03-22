const router = require('koa-router')()

//健康检查
router.get('/health', async (ctx, next) => {
  ctx.status = 200
})

module.exports = router
