import { join } from 'path';
import { isFilePresent } from './file-tools';
import { Package, PackageData, getRepository } from './package';
import * as out from 'out';
import * as bent from 'bent';

const getJSON = bent('json');

export type BadgeBuilder = (data: PackageData, basePath: string) => Promise<string | undefined>;

type Stability = 'deprecated' | 'experimental' | 'unstable' | 'stable' | 'frozen' | 'locked';

const stabilityColors: Record<Stability, string> = {
  deprecated: 'aa8899',
  experimental: 'red',
  unstable: 'yellowgreen',
  stable: 'green',
  frozen: 'blue',
  locked: '00bbff',
};

export const isBadgeUrl = (url?: string) => {
  return !!url;
};

const nodeico: BadgeBuilder = data => {
  out('nodei.co:    !{check|green}');

  // TODO: do something sensible with the flags
  return Promise.resolve(
    ['[', '![NPM]', `(https://nodei.co/npm/${data.name}.png)]`, `(https://nodei.co/npm/${data.name}/)`].join(''),
  );
};

const travis: BadgeBuilder = async (data: PackageData, basePath: string) => {
  const repository = getRepository(data);
  if (!repository) {
    return undefined;
  }

  const haveTravisFile = await isFilePresent(join(basePath, '.travis.yml'));
  if (!haveTravisFile) {
    out('travis:      !{0x2717|yellow} not configured (see: https://travis-ci.org/)');
    return '';
  }

  return Promise.resolve(
    [
      '[',
      '![Build Status]',
      `(https://api.travis-ci.org/${repository.path}.svg?branch=master)`,
      `](https://travis-ci.org/${repository.path})`,
    ].join(''),
  );
};

const stability: BadgeBuilder = (data: PackageData) => {
  const { stability } = data;
  if (!stability) {
    out('stability:   !{0x2717|yellow} not specified (or invalid stability) in package.json');
    return Promise.resolve(undefined);
  }

  out(`stability:   !{check|green} (stability = ${stability})`);
  return Promise.resolve(
    [
      '[',
      `![${stability}]`,
      `(https://img.shields.io/badge/stability-${stability}-${stabilityColors[stability]}.svg)`,
      `](https://github.com/dominictarr/stability#${stability})`,
    ].join(''),
  );
};

const codeClimateMaintainability: BadgeBuilder = async (data: PackageData) => {
  const repository = getRepository(data);
  if (!repository) {
    return Promise.resolve(undefined);
  }

  const host = repository && repository.host.split('.')[0];
  if (!host) {
    return undefined;
  }

  const codeClimateId = repository && (await fetchCodeClimateId(repository.path));
  if (!codeClimateId) {
    out('codeclimate: !{0x2717|yellow} not configured (see: https://codeclimate.com)');
    return '';
  }

  out(`code climate !{check|green} (badge id = ${codeClimateId})`);
  return [
    '[',
    '![Maintainability]',
    `(https://api.codeclimate.com/v1/badges/${codeClimateId}/maintainability)`,
    `](https://codeclimate.com/${host}/${repository.path}/maintainability)`,
  ].join('');
};

export const BUILDERS = {
  nodeico,
  travis,
  stability,
  codeClimateMaintainability,
};

async function fetchCodeClimateId(slug: string) {
  try {
    const result = await getJSON(`https://api.codeclimate.com/v1/repos?github_slug=${slug}`);
    if (Array.isArray(result) && result.length > 0) {
      return (result[0].attributes || {}).badge_token as string;
    }
  } catch (e) {}
}
