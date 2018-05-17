// @flow
const debug = require('debug')('embellish');
const path = require('path');
const out = require('out');
const { parse } = require('marked-ast');
const toMarkdown = require('marked-ast-markdown');
const { ContentGenerator } = require('./lib/content');
const { Badges } = require('./lib/badges');
const { Package } = require('./lib/package');
const { readFileContent, isFilePresent } = require('./lib/file-tools');
const { insertLicense } = require('./lib/license-generator');

/*::
type EmbelishOptions = {
  content?: string,
  filename?: string,
  basePath?: string,
  packageData: Package
};

type AstSegmenter = number | () => boolean;

import type { BadgeBuilder } from './lib/badges';
*/

async function embelish({ content, filename, packageData, basePath } /*: EmbelishOptions */) /*: Promise<string> */ {
  if (filename) {
    const packageFile = path.resolve(path.dirname(filename), 'package.json');

    return embelish({
      content: await readFileContent(filename),
      basePath: path.dirname(packageFile),
      packageData: await Package.readFromFile(packageFile)
    });
  }

  if (!content || !basePath) {
    throw new Error('Unable to embelish content unless content is provided');
  }

  const ast = parse(content);
  await insertLicense(ast, packageData, basePath);
  await insertBadges(ast, packageData, basePath);
  return Promise.resolve(toMarkdown(ast));
}

async function insertBadges(ast, packageData /*: Package */, basePath /*: string */) {
  const firstNonPrimaryHeadingIndex = ast.findIndex((item) => {
    return item.type === 'heading' && item.level > 1;
  });

  const badges = await generateBadges(packageData, basePath);
  if (firstNonPrimaryHeadingIndex === -1) {
    badges.forEach(badge => ast.push(badge));
  } else {
    badges.forEach(badge => ast.splice(firstNonPrimaryHeadingIndex, 0, badge));

    // remove any of the previously generated (or manually created badges)
    removeNodeIfBadges(ast, firstNonPrimaryHeadingIndex - 1);
  }
}

function removeNodeIfBadges(ast, index) /*: void */ {
  const node = ast[index];
  if (node.type !== 'paragraph') {
    return;
  }

  const nonEmptyNodes = node.text.filter(content => content !== ' ');
  const badgeUrls = nonEmptyNodes
    .map(node => node.type === 'link' && node.href)
    .filter(href => Badges.isBadgeUrl(href));

  // if we only have badge urls in the paragraph then remove the line and recurse to the
  // ast node above (same index after we remove this one)
  if (badgeUrls.length === nonEmptyNodes.length) {
    ast.splice(index, 1);
    removeNodeIfBadges(ast, index - 1)
  }
}

async function generateBadges(packageData /*: Package */, basePath /*: string */) /*: Promise<string> */ {
  const badgeLoaders /*: BadgeBuilder[] */ = [
    Badges.nodeico,
    Badges.travis,
    Badges.bithound, // note: soon their service is going away :(
    Badges.codeClimateMaintainability
  ];

  out('!{bold}generating badges');
  const promises = badgeLoaders.map(loader => loader(packageData, basePath));
  return Promise.all(promises).then(badges =>  badges.filter(Boolean).map(ContentGenerator.paragraph).reverse());
}

module.exports = {
  embelish
};
