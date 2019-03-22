const router = require('koa-router')()
const pc = require('../controller/pathController')

//添加接口
router.post('/add/path', async (ctx, next) => {
  const body = ctx.request.body,
    path = body.path,
    templ = body.templ,
    pname = body.pname

  if (!pname) {
    return (ctx.body = {
      code: 1,
      msg: 'pname不能为空'
    })
  }
  if (!path) {
    return (ctx.body = {
      code: 1,
      msg: 'path不能为空'
    })
  }
  if (!templ) {
    return (ctx.body = {
      code: 1,
      msg: 'templ不能为空'
    })
  }
  try {
    if (typeof templ === 'object') {
      templ = JSON.stringify(templ)
    }
  } catch (err) {
    return (ctx.body = {
      code: 1,
      msg: err.message || err
    })
  }
  
  pc.pathAdd(pname, path, templ)

  ctx.body = {
    code: 0
  }
})

//获取所有path信息
router.get('/path/list', async (ctx, next) => {
  let result = await pc.outerAllMockPath()
  ctx.body = {
    code: 0,
    data: result
  }
})

//删除接口
router.post('/remove/path', async (ctx, next) => {
  const body = ctx.request.body,
    path = body.path,
    pname = body.pname

  if (!pname) {
    return (ctx.body = {
      code: 1,
      msg: 'pname不能为空'
    })
  }
  if (!path) {
    return (ctx.body = {
      code: 1,
      msg: 'path不能为空'
    })
  }
  pc.delPath(pname, path)

  ctx.body = {
    code: 0
  }
})

module.exports = router
