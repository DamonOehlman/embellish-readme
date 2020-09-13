import * as path from 'path';
import * as fs from 'fs';
import { ContentGenerator } from './content';
import type { PackageData } from './package';
import { isFilePresent, readFileContent } from './file-tools';
import * as Mustache from 'mustache';

const debug = require('debug')('embelish:license');

const REGEX_LICENSE = /^licen(c|s)e$/i;

export async function insertLicense(ast: any, data: PackageData, basePath: string) {
  const licenseHeaderIndex = ast.findIndex((item: any) => {
    return item.type === 'heading' && REGEX_LICENSE.test(item.raw);
  });

  const licenseContent = await generateLicense(data, basePath);
  if (licenseContent) {
    debug(`license header index = ${licenseHeaderIndex}`);
    if (licenseHeaderIndex >= 0) {
      ast.splice(licenseHeaderIndex + 1, ast.length, ContentGenerator.paragraph(licenseContent));
    }

    // update the license file
    await updateLicenseFile(basePath, licenseContent);
  }
}

async function generateLicense(data: PackageData, basePath: string) {
  const licenseHolder = data.embellish?.licenseHolder || data.author;
  if (data.license && licenseHolder) {
    const licenseName = data.license.toLowerCase();
    const licenseTemplateFile = path.resolve(__dirname, '..', 'licenses', `${licenseName}.txt`);
    const haveLicenseTemplate = await isFilePresent(licenseTemplateFile);
    if (!haveLicenseTemplate) {
      throw new Error(`License template for ${data.license} not found.  Consider submitting an embellish-readme PR`);
    }

    const templateContent = haveLicenseTemplate ? await readFileContent(licenseTemplateFile) : '';
    return templateContent
      ? Mustache.render(templateContent, {
          year: new Date().getFullYear(),
          holder: licenseHolder,
        })
      : '';
  }
}

function updateLicenseFile(basePath: string, content: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path.resolve(basePath, 'LICENSE'), content, 'utf-8', err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}
