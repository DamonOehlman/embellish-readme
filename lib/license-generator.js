// @flow

const path = require('path');
const fs = require('fs');
const debug = require('debug')('embelish:license');
const formatter = require('formatter');
const { ContentGenerator } = require('./content');
const { Package } = require('./package');
const { isFilePresent, readFileContent } = require('./file-tools');

const REGEX_LICENSE = /^licen(c|s)e$/i;

async function insertLicense(ast, packageData /*: Package */, basePath /*: string */) {
  const licenseHeaderIndex = ast.findIndex((item) => {
    return item.type === 'heading' && REGEX_LICENSE.test(item.raw);
  });

  const licenseContent = await generateLicense(packageData, basePath);
  debug(`license header index = ${licenseHeaderIndex}`);
  if (licenseHeaderIndex >= 0) {
    ast.splice(licenseHeaderIndex + 1, ast.length, ContentGenerator.paragraph(licenseContent));
  }

  // update the license file
  await updateLicenseFile(basePath, licenseContent);
}

async function generateLicense(packageData /*: Package */, basePath /*: string */) {
  if (!packageData.license) {
    return '';
  }

  const licenseName = packageData.license.toLowerCase();
  const licenseTemplateFile = path.resolve(__dirname, '..', 'licenses', `${licenseName}.txt`);
  const haveLicenseTemplate = await isFilePresent(licenseTemplateFile);
  const templateContent = haveLicenseTemplate ? await readFileContent(licenseTemplateFile) : '';
  const template = formatter(templateContent);

  return template({
    year: new Date().getFullYear(),
    holder: packageData.author
  });
}

function updateLicenseFile(basePath /*: string */, content /*: string */) /*: Promise<void> */ {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(basePath, 'LICENSE'), content, 'utf-8', (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

module.exports = {
  insertLicense
};
