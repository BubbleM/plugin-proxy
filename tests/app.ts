import * as path from 'path';
import * as shell from "shelljs";
import Uma from '@umajs/core';
import { Router } from '@umajs/router';

shell.rm(path.resolve(__dirname, './plugins'));
shell.mkdir(path.resolve(__dirname, './plugins'));
shell.ln('-sf', path.resolve(__dirname, '../src'), path.resolve(__dirname, './plugins/proxy'));

const uma = Uma.instance({
  Router,
  bodyParser: { multipart: false },
  ROOT: __dirname,
  env: process.argv.indexOf('production') > -1 ? 'production' : 'development',
});

uma.start(8058);
