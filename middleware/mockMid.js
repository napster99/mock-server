'use strict'

/**
 * mock
 */

const _ = require('lodash/core')
const pc = require('../controller/pathController')

/**
 *
 * @param {*} params 数据格式中的params
 * @param {*} outparams
 * @param {*} ctx
 */
const checkParams = (params, outparams, ctx) => {
  let result = []
  if (!_.isEmpty(params)) {
    let pramsArr = Object.keys(params)

    for (let i = 0; i < pramsArr.length; i++) {
      const item = pramsArr[i]
      const paramsVaule = params[item]
      const sArr = paramsVaule.split('|')
      if (sArr.length > 1) {
        //检查参数是否传递
        if (sArr[1] === 'required') {
          if (!outparams) {
            ctx.body = {
              code: 1,
              msg: `params is required`
            }
            return false
          }
          if (!outparams[item] && outparams[item] !== 0) {
            ctx.body = {
              code: 1,
              msg: `params::${item}::is required`
            }
            return false
          }
        }
      }
      //检查参数类型是否匹配
      const paramsType = sArr.length > 1 ? sArr[0] : paramsVaule
      //整型
      if (
        paramsType === 'number' &&
        sArr[1] === 'required' &&
        (!/^[0-9]*$/.test(outparams[item]) ||
          (!outparams[item] && outparams[item] !== 0))
      ) {
        ctx.body = {
          code: 2,
          msg: `params::${item}::must be a number`
        }
        return false
      }
    }
  }
  return true
}

/**
 *
 * @param {*} key
 * @param {*} value
 * @param {*} preObj
 * @param {*} rootObj
 */
const fillStructure = (key, value, preObj, rootObj) => {
  let keyArr = key.split('-')
  if (keyArr.length > 1) {
    let fKey = keyArr[0]
    if (preObj) {
      if (_.isArray(preObj)) {
        preObj[fKey] = preObj[0][fKey] || {}
      } else {
        preObj[fKey] = preObj[fKey] || {}
      }
    } else {
      rootObj[fKey] = rootObj[fKey] || {}
    }
    keyArr.shift()
    fillStructure(
      keyArr.join('-'),
      value,
      preObj ? preObj[fKey] : rootObj[fKey],
      rootObj
    )
  } else {
    let _value = {},
      isArray = value.split('|')[0] === 'array'
    if (isArray) {
      _value = []
    }
    if (preObj) {
      if (_.isArray(preObj)) {
        if (!preObj.length) {
          //初始化第一个元素
          preObj.push({})
        }
        preObj[0][key] = _value
        preObj[0][key]._value = value
      } else {
        preObj[key] = _value
        preObj[key]._value = value
      }
    } else {
      if (isArray) {
        rootObj[key] = rootObj[key] || []
      } else {
        rootObj[key] = {}
      }
      rootObj[key]._value = value
    }
  }
}

/**
 *
 * @param {*} data
 */
const fillData = data => {
  for (let item in data) {
    if (item === '_value' || !data[item]._value) continue
    const vArr = data[item]._value.split('|')
    const _valueType = vArr[0]
    let _valueV = vArr[1],
      _arrayLen = vArr[2]
    delete data[item]._value
    if (_valueType === 'array') {
      if (_valueV && !_arrayLen) {
        _valueV = _valueV.replace(/\'/g, '"')
        try {
          if (JSON.parse(_valueV) instanceof Array) {
            data[item] = JSON.parse(_valueV)
          } else {
            throw Error()
          }
        } catch (e) {
          if (data[item].length === 1) {
            for (let i = 0; i < _valueV - 1; i++) {
              data[item].push(JSON.parse(JSON.stringify(data[item][0])))
            }
          }
        }
      } else {
        //数组单一类型
        if (_valueV && _arrayLen) {
          for (let i = 0; i < _arrayLen; i++) {
            if (_valueV === 'string') {
              data[item].push(
                Math.random()
                  .toString(36)
                  .substr(2)
              )
            } else if (_valueV === 'number') {
              data[item].push(~~(Math.random() * 1000))
            } else {
              data[item].push(_valueV)
            }
          }
        }
      }
      for (let innerItem of data[item]) {
        fillData(innerItem)
      }
    } else if (_valueType === 'string') {
      let randomText = Math.random()
        .toString(36)
        .substr(2)
      data[item] = _valueV ? _valueV : randomText
    } else if (_valueType === 'number') {
      data[item] = _valueV ? Number(_valueV) : ~~(Math.random() * 1000)
    } else if (_valueType === 'boolean') {
      let _valueV_ = [true, false][~~(Math.random() * 2 * 10) % 2]
      if (_valueV === 'true') {
        _valueV_ = true
      } else if (_valueV === 'false') {
        _valueV_ = false
      }
      data[item] = _valueV_
    } else {
      fillData(data[item])
    }
  }
}

/**
 *
 * @param {*} ctx
 * @param {*} next
 */
const mockMid = async (ctx, next) => {
  let outparams = ctx.method === 'POST' ? ctx.request.body : ctx.request.query,
    params = {},
    backData = {}
  try {
    let pname = ctx.path.match(/^\/[0-9a-zA-Z]+/)[0].replace(/^\//, ''),
      path = ctx.path.replace(/^\/[0-9a-zA-Z]+/, '')
    //mock path
    let isMockPath = await pc.isMockPath(pname, path)
    if (isMockPath[0]) {
      //get schema data
      let schemaData = await pc.getSchemaData(pname, path)
      if (schemaData[0] && typeof schemaData[0] === 'string') {
        schemaData = JSON.parse(schemaData[0])
      }
      if (!_.isEmpty(schemaData)) {
        if (checkParams(schemaData['params'], outparams, ctx)) {
          Object.keys(schemaData['data']).map(item => {
            fillStructure(item, schemaData['data'][item], null, backData)
          })
          fillData(backData)
          ctx.body = backData
        }
      } else {
        return (ctx.body = {
          code: 1,
          msg: `${path}-未配置Mock 规则`
        })
      }
    } else {
      return (ctx.body = {
        code: 1,
        msg: `${path}-未配置Mock URL`
      })
    }
  } catch (err) {
    console.error(err)
    ctx.body = {
      code: 1,
      msg: err.message || err
    }
  }
}

module.exports = mockMid
