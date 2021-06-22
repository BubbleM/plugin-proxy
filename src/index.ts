import * as Koa from 'koa';
import Uma from '@umajs/core';
import * as k2c from 'koa2-connect';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { TProxyOptions } from './type/index';

const defaultOptions = {
  prefix: '/api',
  proxyTimeout: 10000,
  router: () => { }
}

export default (uma: Uma, option: TProxyOptions = defaultOptions): Koa.Middleware => async (ctx: Koa.Context, next: Function) => {
  let { prefix, proxyTimeout } = option;
  if (ctx.url.startsWith(prefix)) {
    ctx.respond = false; // 绕过koa内置对象response ，写入原始res对象，而不是koa处理过的response

    let targetOrigin = '';
    const startTime = new Date();

    k2c(createProxyMiddleware({
      target: targetOrigin,
      changeOrigin: true, // 默认fasle，是否需要改变原始主机头为目标URL
      secure: false, // 是否要验证SSL证书
      proxyTimeout, // 代理转发请求返回超时
      router: () => {
        /**
        * 支持动态配置host https://yxpbuyerservice.youxinpai.com
        */
        if (ctx.url.startsWith('/api')) {
          const { host = '' } = ctx.query;

          targetOrigin = `${host}`;

          return targetOrigin;
        }
      },
      pathRewrite: { // 重写请求
        '^/proxy/([a-zA-Z0-9_]+)/': '/',
        '^/api': '',
      },
      onProxyReq(proxyReq, req: any) { // 监听proxy的请求事件
        // 转发后可通过 token 鉴权
        if (req.url.indexOf('host')) {
          proxyReq.setHeader('clienttype', 0);
          proxyReq.setHeader('tvaid', 651824);
          proxyReq.setHeader('clientsource', 2);
          proxyReq.setHeader('iswap', 'true');
        }

        const { body = {} } = ctx.request;

        if (req.method === 'POST' && JSON.stringify(body) !== '{}') {
          const bodyData = JSON.stringify(body);

          proxyReq.setHeader('Content-Type', 'application/json; charset=utf-8');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
          proxyReq.end();
        }

        return proxyReq;
      },
      onProxyRes(proxyRes, req: any) { // 监听proxy的回应事件
        const endTime = new Date();

        console.log(JSON.stringify({
          targetOrigin,
          originalUrl: req.originalUrl,
          method: req.method,
          url: req.url,
          messAge: `转发代理成功,${proxyRes.statusCode}! 耗时 ${endTime.getTime() - startTime.getTime()}`,
        }));
      },
      onError(err, req: any, res: any) {
        const errInfo = {
          targetOrigin,
          method: req.method,
          url: req.url,
          messAge: '转发代理失败',
          error: err,
        };

        console.error(JSON.stringify(errInfo));
        typeof res.send === 'function' && res.send(JSON.stringify(errInfo));
        res.end();
      },
    }))(ctx, next);
  } else {
    await next();
  }
};