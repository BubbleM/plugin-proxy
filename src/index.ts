import * as path from 'path';
import * as k2c from 'koa2-connect';
import Uma, { IContext, TPlugin } from '@umajs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { UmaLogger } from '@umajs/logger';

const { ROOT } = Uma.options;

const logger = new UmaLogger({
  level: 'ALL', // 日志输出级别
  consoleLevel: 'ALL',
  replaceConsole: false,
  dir: path.resolve(ROOT, '../logs/proxy'), // 日志目录
  errorLogName: 'errorlogger.log', // error级别日志文件名
  infoLogName: 'infologger.log', // info级别日志文件名
  warnLogName: 'warnlogger.log', // warn级别日志文件名
  allowDebugAtProd: true, // 是否允许打印debug日志
});

export type TProxyOptions = {
  prefix: RegExp | string,
  target: {
    [key: string]: string
  },
  timeout: number,
  name?: 'proxy'
}

export default (uma: Uma, options: TProxyOptions = {
  prefix: '/proxy',
  target: {},
  timeout: 10000,
}): TPlugin => {
  let PrefixReg = options.prefix.toString();
  let ProxyReg = new RegExp("^" + PrefixReg + "([a-zA-Z0-9_]+)");
  return {
    context: {
      proxy: createProxyMiddleware({
        changeOrigin: true, // 默认fasle，是否需要改变原始主机头为目标URL
        secure: false, // 是否要验证SSL证书
        proxyTimeout: options.timeout, // 代理转发请求返回超时
        router: (req: any) => {
          /**
           * 根据网关配置列表获取转发目标
           */
          let targetList = options.target;
          const serverName = req.url.match(ProxyReg)[2];
          const targetName = targetList[serverName];
          if (targetName) {
            req.targetOrigin = targetName;

            return targetName;
          }
        },
        pathRewrite: (path, req) => { // 重写请求
          return path.replace(ProxyReg, '')
        },
        onProxyReq(proxyReq, req) {
          let BODYDATA = req["BODYDATA"] || {};
          if (JSON.stringify(BODYDATA) !== '{}') { // 如果使用koa-body解析了参数需要重新写入body data
            let originContenType: string = <string>proxyReq.getHeader('Content-Type') || '';
            if (originContenType.indexOf('form') !== -1) { // 处理form类型
              let body = BODYDATA;
              let urlWithParams = '';
              for (let key in body) {
                urlWithParams += `${key}=${body[key]}&`
              }
              proxyReq.setHeader('Content-Length', Buffer.byteLength(urlWithParams));
              proxyReq.write(urlWithParams);
            } else {
              proxyReq.setHeader('Content-Type', 'application/json; charset=utf-8');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(BODYDATA)));
              proxyReq.write(JSON.stringify(BODYDATA));
            }
            proxyReq.end();
          }

          return proxyReq;
        },
        onProxyRes(proxyRes, req) { // 监听proxy的回应事件
          if (proxyRes.statusCode === 200) {
            logger.info(JSON.stringify({
              action: 'proxy',
              url: req.originalUrl,
              message: `转发代理成功,${proxyRes.statusCode}! 请求参数${req.method === 'POST' ? JSON.stringify(req["BODYDATA"]) : 'GET'}`,
              reqConf: {
                method: req.method,
                targetOrigin: req["targetOrigin"],
              },
              reqBody: req['BODYDATA'] || ''
            }))
          } else {
            logger.error(JSON.stringify({
              action: 'proxy',
              url: req.originalUrl,
              message: `转发代理成功，响应异常,${proxyRes.statusCode}!${proxyRes.statusMessage} 请求参数${req.method === 'POST' ? JSON.stringify(req["BODYDATA"]) : 'GET'}`,
              reqConf: {
                method: req.method,
                targetOrigin: req["targetOrigin"],
              },
              reqBody: req['BODYDATA'] || ''
            }))
          }
        },
        onError(err, req: any, res: any) {
          logger.error(JSON.stringify({
            action: 'proxy',
            url: req.url,
            message: '转发代理失败',
            error: err,
            reqConf: {
              targetOrigin: req["targetOrigin"],
              method: req.method,
            },
          }))
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          res.end('Something went wrong while proxy');
        },
      })
    },
    filter: {
      regexp: new RegExp(PrefixReg),
      async handler(ctx: IContext, next: Function) {
        const { body = {} } = ctx.request;
        if (ctx.req.method === 'POST' && JSON.stringify(body) !== '{}') {
          ctx.req['BODYDATA'] = body;
        }

        try {
          k2c(ctx.proxy)(ctx, next);
        } catch (error) {
          await next();
        }
      }
    }
  }
}