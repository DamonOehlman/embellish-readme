// @flow
const debug = require('debug')('embelish');
const fs = require('fs');
const { parse } = require('marked-ast');
const toMarkdown = require('marked-ast-markdown');
const { ContentGenerator } = require('./lib/content');
const { Badges } = require('./lib/badges');

/*::
type EmbelishOptions = {
  content?: string,
  filename?: string
};

type AstSegmenter = number | () => boolean;
*/

const REGEX_LICENSE = /^licen(c|s)e$/i;

async function embelish({ content, filename } /*: EmbelishOptions */) /*: Promise<string> */ {
  if (filename) {
    return embelish({ content: await readFileContent(filename) });
  }

  if (!content) {
    throw new Error('Unable to embelish content unless content is provided');
  }

  const ast = parse(content);
  insertLicense(ast);
  insertBadges(ast);
  return Promise.resolve(toMarkdown(ast));
}

function readFileContent(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }

      resolve(content);
    });
  });
}

function insertBadges(ast) {
  const firstNonPrimaryHeadingIndex = ast.findIndex((item) => {
    return item.type === 'heading' && item.level > 1;
  });

  if (firstNonPrimaryHeadingIndex === -1) {
    ast.push(ContentGenerator.badges());
  } else {
    // insert the newly generated badges
    ast.splice(firstNonPrimaryHeadingIndex, 0, ContentGenerator.badges());

    // remove any of the previously generated (or manually created badges)
    removeNodeIfBadges(ast, firstNonPrimaryHeadingIndex - 1);
  }
}

function insertLicense(ast) {
  const licenseHeaderIndex = ast.findIndex((item) => {
    return item.type === 'heading' && REGEX_LICENSE.test(item.raw);
  });

  debug(`license header index = ${licenseHeaderIndex}`);
  if (licenseHeaderIndex >= 0) {
    ast.splice(licenseHeaderIndex + 1, ast.length, ContentGenerator.license());
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

module.exports = {
  embelish
};
