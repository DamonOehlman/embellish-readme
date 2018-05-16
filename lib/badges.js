// @flow

const r2 = require('r2');
const CodeClimate = { require('./codeclimate') };
const { isFilePresent } = require('./lib/file-tools');

/*::
import { Package } from './package';

export type BadgeBuilder = (packageData: Package) => Promise<string>;
*/

class Badges {
  static isBadgeUrl(url /*: string */) /*: boolean */ {
    return !!url;
  }

  static nodeico(packageData /*: Package */) /*: Promise<string> */ {
    // TODO: do something sensible with the flags
    return Promise.resolve([
      '[',
      '![NPM]',
      `(https://nodei.co/npm/${packageData.name}.png)]`,
      `(https://nodei.co/npm/${packageData.name}/)`,
    ].join(''));
  }

  static travis(packageData /*: Package */) /*: Promise<string> */ {
    const repository = packageData.getRepositry();
    return Promise.resolve(repository ? [
      '[',
      '![Build Status]',
      `(https://api.travis-ci.org/${repository.path}.svg?branch=master)`,
      `](https://travis-ci.org/${repository.path})`
    ].join('') : '');
  }

  static bithound(packageData /*: Package */) /*: Promise<string> */ {
    const repository = packageData.getRepositry();
    const host = repository && repository.host.split('.')[0];

    return Promise.resolve(repository && host ? [
      '[',
      '![bitHound Score]',
      `(https://www.bithound.io/${host}/${repository.path}/badges/score.svg)`,
      `](https://www.bithound.io/${host}/${repository.path})`
    ].join('') : '');
  }

  static async codeClimateMaintainability(packageData /*: Package */) /*: Promise<string> */ {
    const repository = packageData.getRepositry();
    const host = repository && repository.host.split('.')[0];

    const codeClimateId = await fetchCodeClimateId(`${host}/${repository.path}`);
    if (!codeClimateId) {
      return '';
    }

    return repository && host ? [
      '[',
      '![Maintainability]',
      `(https://api.codeclimate.com/v1/badges/${codeClimateId}/maintainability)`
      `](https://codeclimate.com/${host}/${repository.path}/maintainability)`
    ].join('') : '';
  }
}

async function fetchCodeClimateId(slug /*: string */) /* Promise<string> */ {
  try {
    const result = await r2(`https://api.codeclimate.com/v1/repos?github_slug=${slug}`).json;
    if (Array.isArray(result.data) && result.data.length > 0) {
      return (result.data.attributes || {}).badge_token;
    }
  } catch (e) {}
}

module.exports = {
  Badges
};
