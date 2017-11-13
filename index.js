// @flow
const debug = require('debug')('embelish');
const fs = require('fs');
const path = require('path');
const { parse } = require('marked-ast');
const toMarkdown = require('marked-ast-markdown');
const formatter = require('formatter');
const { ContentGenerator } = require('./lib/content');
const { Badges } = require('./lib/badges');
const { Package } = require('./lib/package');

/*::
type EmbelishOptions = {
  content?: string,
  filename?: string,
  basePath?: string,
  packageData: Package
};

type AstSegmenter = number | () => boolean;
*/

const REGEX_LICENSE = /^licen(c|s)e$/i;

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

async function insertLicense(ast, packageData /*: Package */, basePath /*: string */) {
  const licenseHeaderIndex = ast.findIndex((item) => {
    return item.type === 'heading' && REGEX_LICENSE.test(item.raw);
  });

  debug(`license header index = ${licenseHeaderIndex}`);
  if (licenseHeaderIndex >= 0) {
    ast.splice(licenseHeaderIndex + 1, ast.length, await generateLicense(packageData, basePath));
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

async function generateLicense(packageData /*: Package */, basePath /*: string */) {
  if (!packageData.license) {
    return '';
  }

  const licenseName = packageData.license.toLowerCase();
  const licenseTemplateFile = path.resolve(__dirname, 'licenses', `${licenseName}.txt`);
  const haveLicenseTemplate = await isFilePresent(licenseTemplateFile);
  const templateContent = haveLicenseTemplate ? await readFileContent(licenseTemplateFile) : '';
  const template = formatter(templateContent);

  return ContentGenerator.paragraph(template({
    year: new Date().getFullYear(),
    holder: packageData.author
  }));
}

async function generateBadges(packageData /*: Package */, basePath /*: string */) {
  const initialBadges = packageData.private ? [] : [
    ContentGenerator.paragraph(Badges.nodeico(packageData))
  ];

  return initialBadges.concat([
    await isFilePresent(path.resolve(basePath, '.travis.yml'))
    ? Badges.travis(packageData)
    : null,
    Badges.bithound(packageData)
  ].filter(Boolean).map(ContentGenerator.paragraph)).reverse();
}

function readFileContent(filename /*: string */) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }

      resolve(content);
    });
  });
}

function isFilePresent(filename /*: string */) /*: Promise<boolean> */ {
  return new Promise(resolve => fs.exists(filename, resolve));
}

module.exports = {
  embelish
};
