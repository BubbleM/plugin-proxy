import { BaseController, Path, Result } from '@umajs/core';

export default class Index extends BaseController {

  @Path('/index')
  index() {
    return Result.send('This is index.');
  }
}
