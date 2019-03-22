$(function() {
  // ace 编辑器初始化 + 配置
  let editor = ace.edit('editor')
  editor.setTheme('ace/theme/solarized_light')
  let JavascriptMode = ace.require('ace/mode/javascript').Mode
  editor.session.setMode(new JavascriptMode())

  // let baseUrl = 'http://192.168.16.185:3000'
  let baseUrl = 'http://localhost:3000'

  if (window.location.href.indexOf('mock-server') > -1) {
    baseUrl = './'
  }
  let tools = new Tools()
  let mockList = []

  // 初始化列表
  let mockListInit = function() {
    if (Array.isArray(mockList) && mockList.length > 0) {
      let listHtml = ''
      mockList.forEach((value, index) => {
        listHtml += `<tr data-index="${index}" data-pname="${
          value.pname
        }" data-path="${value.path}">
                      <td>${value.pname}</td>
                      <td style="word-break: keep-all;">${value.path}</td>
                      <td>
                        <a href="javascript:void(0);" class="jdelete">删除</a>
                        <a href="javascript:void(0);" class="jdetail">详情</a>
                      </td>
                      <td>${value.templ}</td>
                      </tr>`
      })
      $('#mock-list').html(listHtml)
    }
  }

  // 获取 Mock Url 列表
  let getMockList = function() {
    let params = {
      url: baseUrl + '/path/list',
      type: 'get'
    }

    tools.ajax(
      params,
      function(res) {
        let code = parseInt(res.code, 10)
        if (code === 0) {
          mockList = res.data
          mockListInit()
        } else if (code === 1) {
          $.DialogByZ.Autofade({ Content: res.msg, Type: 'error' })
        }
      },
      function(err) {
        console.log(err)
      }
    )
  }
  getMockList()

  // 添加
  $('#jadd').on('click', function() {
    let inputValue = editor.getValue(),
      data
    if (inputValue === '') {
      $.DialogByZ.Autofade({ Content: '请输入内容！', Type: 'error' })
      return false
    }
    try {
      data = JSON.parse(editor.getValue())
    } catch (error) {
      $.DialogByZ.Autofade({ Content: error, Type: 'error' })
      return false
    }

    // 验证填入信息完整性
    if (data.pname === '' || data.path === '' || data.templ === '') {
      $.DialogByZ.Autofade({ Content: '请输入完整信息！', Type: 'error' })
      return false
    }
    // 验证 templ 的格式
    if (typeof data.templ !== 'object') {
      $.DialogByZ.Autofade({
        Content: 'templ 需要输入一个对象！',
        Type: 'error'
      })
      return false
    }

    data.templ = JSON.stringify(data.templ)
    // 组装参数 请求接口
    let params = {
      url: baseUrl + '/add/path',
      data: data
    }

    tools.ajax(
      params,
      function(res) {
        let code = parseInt(res.code, 10)
        if (code === 0) {
          getMockList()
          $.DialogByZ.Autofade({ Content: '操作成功！', Type: 'success' })
        } else {
          $.DialogByZ.Autofade({ Content: res.msg, Type: 'error' })
        }
      },
      function(err) {
        console.log(err)
      }
    )
  })

  // 清空
  $('#jreset').on('click', function() {
    editor.setValue('')
  })

  // 单行删除
  $('#mock-list').on('click', '.jdelete', function() {
    if (!confirm('确定删除此条记录？')) {
      return false
    }

    let _this = this
    let params = {
      url: baseUrl + '/remove/path',
      data: {
        pname: $(this)
          .parents('TR')
          .data('pname'),
        path: $(this)
          .parents('TR')
          .data('path')
      }
    }
    tools.ajax(
      params,
      function(res) {
        let code = parseInt(res.code, 10)
        if (code === 0) {
          $.DialogByZ.Autofade({ Content: '删除成功！', Type: 'success' })
          let index = $(_this)
            .parents('TR')
            .data('index')
          mockList.splice(index, 1)
          mockListInit()
        } else {
          $.DialogByZ.Autofade({ Content: res.msg, Type: 'error' })
        }
      },
      function(err) {
        console.log(err)
      }
    )
  })

  // 查看详情
  $('#mock-list').on('click', '.jdetail', function() {
    let content = {
      pname: $(this)
        .parents('TR')
        .data('pname'),
      path: $(this)
        .parents('TR')
        .data('path'),
      templ: JSON.parse(
        $(this)
          .parent('td')
          .next()
          .html()
      )
    }
    editor.setValue(JSON.stringify(content, null, '\t'))

    $(this)
      .parents('TR')
      .addClass('active')
      .siblings('TR')
      .removeClass('active')
  })

  // 测试
  $('#testInput').click(() => {
    const inputValue = editor.getValue()

    if (inputValue === '') {
      $.DialogByZ.Autofade({
        Content: '请先选择需要调试的接口！',
        Type: 'error'
      })
      return false
    }

    try {
      let { pname, path } = JSON.parse(editor.getValue())
      const fullUrl = `${location.origin}/${pname}${path}`
      window.open(fullUrl)
    } catch (error) {
      $.DialogByZ.Autofade({ Content: error, Type: 'error' })
      return false
    }
  })
})
