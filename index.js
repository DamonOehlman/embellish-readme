// @flow
const fs = require('fs');
const { parse } = require('marked-ast');
const toMarkdown = require('marked-ast-markdown');

/*::
type EmbelishOptions = {
  content: ?string,
  filename: ?string
};
*/

async function embelish({ content, filename } /*: EmbelishOptions */) {
  if (filename) {
    return embelish({ content: await readFileContent(filename) });
  }

  if (!content) {
    throw new Error('Unable to embelish content unless content is provided');
  }

  const ast = parse(content);
  console.log(ast);
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

module.exports = {
  embelish
};
