import * as path from 'path';
import * as out from 'out';
import { ContentGenerator } from './content';
import { BUILDERS, BadgeBuilder, isBadgeUrl } from './badges';
import { Package, PackageData } from './package';
import { readFileContent, isFilePresent } from './file-tools';
import { insertLicense } from './license-generator';

const debug = require('debug')('embellish');
const { parse } = require('marked-ast');
const { toMarkdown } = require('marked-ast-markdown');

interface BaseOptions<T> {
  type: T;
}

interface FileOptions extends BaseOptions<'file'> {
  filename: string;
}

interface ContentOptions extends BaseOptions<'content'> {
  content: string;
  basePath: string;
  packageData: PackageData;
}

type AstSegmenter = number | (() => boolean);

async function embellish(options: FileOptions | ContentOptions): Promise<string> {
  if (options.type === 'file') {
    const packageFile = path.resolve(path.dirname(options.filename), 'package.json');

    return embellish({
      type: 'content',
      content: await readFileContent(options.filename),
      basePath: path.dirname(packageFile),
      packageData: await Package.readFromFile(packageFile),
    });
  }

  const { content, basePath, packageData } = options;
  const ast = parse(content);
  await insertLicense(ast, packageData, basePath);
  await insertBadges(ast, packageData, basePath);
  return Promise.resolve(toMarkdown(ast));
}

async function insertBadges(ast: any, data: PackageData, basePath: string) {
  const firstNonPrimaryHeadingIndex = ast.findIndex((item: any) => {
    return item.type === 'heading' && item.level > 1;
  });

  const badges = await generateBadges(data, basePath);
  if (firstNonPrimaryHeadingIndex === -1) {
    badges.forEach(badge => ast.push(badge));
  } else {
    badges.forEach(badge => ast.splice(firstNonPrimaryHeadingIndex, 0, badge));

    // remove any of the previously generated (or manually created badges)
    removeNodeIfBadges(ast, firstNonPrimaryHeadingIndex - 1);
  }
}

function removeNodeIfBadges(ast: any, index: number) {
  const node = ast[index];
  if (node.type !== 'paragraph') {
    return;
  }

  const nonEmptyNodes = node.text.filter((content: any) => content !== ' ');
  const badgeUrls = nonEmptyNodes
    .map((node: any) => node.type === 'link' && node.href)
    .filter((href: string) => isBadgeUrl(href));

  // if we only have badge urls in the paragraph then remove the line and recurse to the
  // ast node above (same index after we remove this one)
  if (badgeUrls.length === nonEmptyNodes.length) {
    ast.splice(index, 1);
    removeNodeIfBadges(ast, index - 1);
  }
}

async function generateBadges(data: PackageData, basePath: string) {
  const badgeLoaders: (BadgeBuilder | string)[] = [
    BUILDERS.nodeico,
    '---',
    BUILDERS.stability,
    BUILDERS.travis,
    BUILDERS.codeClimateMaintainability,
  ];

  out('!{bold}generating badges');
  const promises = badgeLoaders.map(loader => {
    if (typeof loader == 'string') {
      return loader;
    }

    return loader(data, basePath);
  });

  // build the blocks
  const blocks = await Promise.all(promises).then(badges => badges.filter(Boolean));

  // create the paragraphs
  const paragraphs = blocks.reduce<string[][]>(
    (memo, block) => {
      if (block === '---') {
        memo.push([]);
      } else if (block) {
        memo[memo.length - 1].push(block);
      }

      return memo;
    },
    [[]],
  );

  return paragraphs
    .reverse() // TODO: remove this when we are generating paragraphs in the expected order
    .map(para => para.join(' '))
    .map(ContentGenerator.paragraph);
}

module.exports = {
  embellish,
};
