import Uma from '@umajs/core';
import * as path from 'path';

const { ROOT } = Uma.options;
export default {
  proxy: {
    enable: true,
    options: {
      prefix: /(proxy)/,
      // prefix: new RegExp(/(proxy|api)/),
      target: require(path.join(ROOT, '../config/index')),
      // target: {
      //   baidu: 'http://www.baidu.com',
      // }
      timeout: 10000,
    },
  },
};
