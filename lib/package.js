// @flow

const fs = require('fs');

/*::
type PackageRepositoryDetails = string | {
  type: string,
  url: string
};

type PackageData = {
  author: string,
  license: ?string,
  name: string,
  private: boolean,
  repository: PackageRepositoryDetails
};

type Repository = {
  host: string,
  path: string
};
*/

const REPO_REGEXES = [
  /^.*(github\.com)\/(.*)\.git.*$/, // github
  /^.*(bitbucket\.org)\/(.*)\.git.*$/ // bitbucket
];

class Package {
  /*::
  author: string;
  license: ?string;
  name: string;
  private: boolean;
  repository: PackageRepositoryDetails;
  */

  constructor(data /*: PackageData */) {
    this.author = data.author;
    this.license = data.license;
    this.name = data.name;
    this.private = data.private;
    this.repository = data.repository;
  }

  static deserialize(json) /*: Package */ {
    const repository = json.repository;

    return new Package({
      author: json.author,
      license: json.license,
      name: json.name,
      private: json.private || false,
      repository: repository
    });
  }

  static readFromFile(filename /*: string */) /*: Promise<Package> */ {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf-8', (err, content) => {
        if (err) {
          return reject(err);
        }
  
        try {
          resolve(Package.deserialize(JSON.parse(content)));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  getRepositry() /*: ?Repository */ {
    const url = this.getRepositoryUrl();
    const match = REPO_REGEXES.reduce(function(memo, regex) {
      return memo || regex.exec(url);
    }, false);
  
    return match ? {
      host: match[1],
      path: match[2].split('/').splice(0, 2).join('/')
    } : null;
  }

  getRepositoryUrl() /*: string */ {
    if (typeof this.repository == 'string') {
      return this.repository;
    }

    return (this.repository || {}).url;
  }
}

module.exports = {
  Package
};
