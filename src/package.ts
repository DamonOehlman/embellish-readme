import * as fs from 'fs';
import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

const EmbellishOverridesProps = t.partial({
  licenseHolder: t.string,
});

const RepositoryProps = t.union([
  t.string,
  t.type({
    type: t.string,
    url: t.string,
  }),
]);

const PackageStabilityProps = t.keyof({
  deprecated: null,
  experimental: null,
  unstable: null,
  stable: null,
  frozen: null,
  locked: null,
});

const PackageDataOptionalProps = t.partial({
  license: t.string,
  embellish: EmbellishOverridesProps,
  private: t.boolean,
  repository: RepositoryProps,
  stability: PackageStabilityProps,
});

const PackageDataProps = t.intersection([
  t.type({
    author: t.string,
    name: t.string,
  }),
  PackageDataOptionalProps,
]);

const REPO_REGEXES = [
  /^.*(github\.com)\/(.*)\.git.*$/, // github
  /^.*(bitbucket\.org)\/(.*)\.git.*$/, // bitbucket
];

export type PackageData = t.TypeOf<typeof PackageDataProps>;

export class Package {
  constructor(public readonly data: PackageData) {}

  static deserialize(json: unknown) {
    const result = PackageDataProps.decode(json);
    if (isRight(result)) {
      return result.right;
    }

    throw new Error(`Unable to decode package data: ${PathReporter.report(result)}`);
  }

  static readFromFile(filename: string) {
    return new Promise<PackageData>((resolve, reject) => {
      fs.readFile(filename, 'utf-8', (err, content) => {
        if (err) {
          return reject(err);
        }

        try {
          resolve(Package.deserialize(JSON.parse(content)));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export const getRepository = (data: PackageData) => {
  const { repository } = data;
  if (!repository) {
    return undefined;
  }

  const url = typeof repository === 'string' ? repository : repository.url;
  const match = REPO_REGEXES.reduce<RegExpExecArray | null>((memo, regex) => {
    return memo || regex.exec(url);
  }, null);

  return match
    ? {
        host: match[1] as string,
        path: match[2].split('/').splice(0, 2).join('/') as string,
      }
    : undefined;
};
