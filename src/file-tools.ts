import * as fs from 'fs';

export function readFileContent(filename: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }

      resolve(content);
    });
  });
}

export function isFilePresent(filename: string) {
  return new Promise<boolean>(resolve => fs.exists(filename, resolve));
}
