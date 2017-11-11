// @flow

/*::
import { Package } from './package';

export type BadgeBuilder = (packageData: Package) => string;
*/

class Badges {
  static isBadgeUrl(url /*: string */) /*: boolean */ {
    return !!url;
  }

  static nodeico(packageData /*: Package */) /*: string */ {
    // TODO: do something sensible with the flags
    return [
      '[',
      '![NPM]',
      `](https://nodei.co/npm/${packageData.name}/)`,
      `(https://nodei.co/npm/${packageData.name}.png)`,
    ].join('');
  }

  static travis(packageData /*: Package */) /*: string */ {
    const repository = packageData.getRepositry();
    return repository ? [
      '[',
      '![Build Status]',
      `(https://api.travis-ci.org/${repository.path}.svg?branch=master)`,
      `](https://travis-ci.org/${repository.path}project.path)`
    ].join('') : '';
  }

  static bithound(packageData /*: Package */) /*: string */ {
    const repository = packageData.getRepositry();
    const host = repository && repository.host.split('.')[0];

    return repository && host ? [
      '[',
      '![bitHound Score]',
      `(https://www.bithound.io/${host}/${repository.path}/badges/score.svg)`,
      `](https://www.bithound.io/${host}/${repository.path})`
    ].join('') : '';
  }
}

module.exports = {
  Badges
};
