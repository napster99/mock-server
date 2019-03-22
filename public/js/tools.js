function Tools() {}

/**
 * 
 */
Tools.prototype.ajax = function (params, cb, err) {
  $.ajax({
    url: params.url,
    data: params.data || '',
    type: params.type || "POST",
    dataType: params.dataType || 'json',
    async: params.async || 'TRUE',
    timeout: params.timeout || 5000,
    contentType: "application/x-www-form-urlencoded;charset=utf-8",
    success: function (res) {
      cb(res)
    },
    error: function (e) {
      err(e)
    }
  })
}

/**
 * 
 */
Tools.prototype.syntaxHighlight = function (json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
