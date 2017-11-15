const fs = require('fs');

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
  readFileContent,
  isFilePresent
};
