### 添加 mock url

> url:/add/path  
> args：pname, path, templ  
> method: post

### 获取所有 mock url

> url:/path/list  
> args：无  
> method: get

### 删除接口 mock url

> url:/remove/path  
> args:pname, path  
> method: post

### 名词解释

pname : 项目名字  
path : 请求路径  
templ : 自定义数据格式

```
//e.g:
{
  "params": {               //请求参数
    "id": "number|required",
    "name": "string",
    "age": "array"
  },
  "data": {
    "code": "number|0",     //类型|指定值
    "data": "array|2",      //类型为array的时候 ，2 代表array的长度
    "data-name": "string",
    "data-age": "object",
    "data-age-sex": "number",
    "data-a": "array",
    "data-a-b": "array|3",
    "data-a-b-c": "string",
    "msg": "string"
  }
}
```
