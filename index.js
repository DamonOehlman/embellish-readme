// @flow
const debug = require('debug')('embelish');
const fs = require('fs');
const { parse } = require('marked-ast');
const toMarkdown = require('marked-ast-markdown');
const { ContentGenerator } = require('./lib/content');

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
    ast.splice(firstNonPrimaryHeadingIndex, 0, ContentGenerator.badges());
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

module.exports = {
  embelish
};
