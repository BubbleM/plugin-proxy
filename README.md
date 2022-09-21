## 基于 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) 包装的轻量级代理插件

### Install
`npm i @umajs/plugin-proxy --save`

### Basic usage
```
// config/plugin.config.ts
{
  proxy: {
    enable: true, // 开启代理插件
    options: {
      prefix: /(proxy)/,
      target: {
        baidu: 'http://www.baidu.com',
        a: 'http://www.a.com/user/getName'
      }
      timeout: 10000,
    }
  }
}
```
/proxy/${target}/xxx 会被转发到对应 /${target}/xxx
- http://localhost:8058/proxy/baidu/xxx -> http://www.baidu.com/xxx
- http://localhost:8058/proxy/a/user/getName?id=1 -> http://www.a.com/user/getName?id=1

### Options
#### prefix
> 代理网关前缀，根据访问路由进行匹配，匹配成功走转发逻辑 支持正则

prefix: new RegExp(/(proxy|api)/) 以proxy开头或api开头的会被转发

#### target
> 代理转发目标地址，可通过路径指定 key为目标地址的标识，value为具体目标地址
1. target: require(path.join(ROOT, '../config/index')),
```
// config/index.ts
module.exports = {
  baidu: 'http://www.baidu.com',
}
```
2. target: {
    baidu: 'http://www.baidu.com',
   }
#### timeout
> 网关超时时间，单位毫秒，默认 10000 毫秒

/**
  1. ${ROOT}/config/config.js 可以指定配置目录的具体文件地址 文件维护网关中心配置
  2. option 通过option参数维护网关中心配置
*/