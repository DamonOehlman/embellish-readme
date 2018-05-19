// @flow

const r2 = require('r2');
const out = require('out');
const { join } = require('path');
const { isFilePresent } = require('./file-tools');

/*::
import { Package } from './package';

export type BadgeBuilder = (packageData: Package) => Promise<string>;

type Stability = 'deprecated'
  | 'experimental'
  | 'unstable'
  | 'stable'
  | 'frozen'
  | 'locked';
*/

const stabilityColors /*: Map<Stability,string> */ = new Map([
  [ 'deprecated', 'aa8899' ],
  [ 'experimental', 'red' ],
  [ 'unstable', 'yellowgreen' ],
  [ 'stable', 'green' ],
  [ 'frozen', 'blue' ],
  [ 'locked', '00bbff' ],
]);


class Badges {
  static isBadgeUrl(url /*: string */) /*: boolean */ {
    return !!url;
  }

  static nodeico(packageData /*: Package */) /*: Promise<string> */ {
    out('nodei.co:    !{check|green}')

    // TODO: do something sensible with the flags
    return Promise.resolve([
      '[',
      '![NPM]',
      `(https://nodei.co/npm/${packageData.name}.png)]`,
      `(https://nodei.co/npm/${packageData.name}/)`,
    ].join(''));
  }

  static async travis(packageData /*: Package */, basePath /*: string */) /*: Promise<string> */ {
    const repository = packageData.getRepositry();
    const haveTravisFile = await isFilePresent(join(basePath, '.travis.yml'));
    if (!haveTravisFile) {
      out('travis:      !{0x2717|yellow} not configured (see: https://travis-ci.org/)')
      return '';
    }

    return Promise.resolve(repository ? [
      '[',
      '![Build Status]',
      `(https://api.travis-ci.org/${repository.path}.svg?branch=master)`,
      `](https://travis-ci.org/${repository.path})`
    ].join('') : '');
  }

  static bithound(packageData /*: Package */) /*: Promise<string> */ {
    out('bithound:    !{0x2717|red} service retired :(');
    return '';
  }

  static stability(packageData /*: Package */) /*: Promise<string> */ {
    const stability = packageData.stability;
    const stabilityColor = stability && stabilityColors.get(stability);
    if (!stabilityColor) {
      out('stability:   !{0x2717|yellow} not specified (or invalid stability) in package.json')
      return '';
    }

    out(`stability:   !{check|green} (stability = ${stability})`);
    return Promise.resolve([
      '[',
      `![${stability}]`,
      `(https://img.shields.io/badge/stability-${stability}-${stabilityColor}.svg)`,
      `](https://github.com/dominictarr/stability#${stability})`,
    ].join(''));
  }

  static async codeClimateMaintainability(packageData /*: Package */) /*: Promise<string> */ {
    const repository = packageData.getRepositry();
    const host = repository && repository.host.split('.')[0];

    const codeClimateId = await fetchCodeClimateId(repository.path);
    if (!codeClimateId) {
      out('codeclimate: !{0x2717|yellow} not configured (see: https://codeclimate.com)')
      return '';
    }

    out(`nodei.co:    !{check|green} (badge id = ${codeClimateId})`);
    return repository && host ? [
      '[',
      '![Maintainability]',
      `(https://api.codeclimate.com/v1/badges/${codeClimateId}/maintainability)`,
      `](https://codeclimate.com/${host}/${repository.path}/maintainability)`,
    ].join('') : '';
  }
}

async function fetchCodeClimateId(slug /*: string */) /* Promise<string> */ {
  try {
    const result = await r2(`https://api.codeclimate.com/v1/repos?github_slug=${slug}`).json;
    if (Array.isArray(result.data) && result.data.length > 0) {
      return (result.data[0].attributes || {}).badge_token;
    }
  } catch (e) {}
}

module.exports = {
  Badges
};
