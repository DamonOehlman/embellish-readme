// @flow

/*::
type PackageRepositoryDetails = string | {
  type: string,
  url: string
};

type PackageData = {
  author: string,
  license: ?string,
  name: string,
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
  repository: PackageRepositoryDetails;
  */

  constructor(data /*: PackageData */) {
    this.author = data.author;
    this.license = data.license;
    this.name = data.name;
    this.repository = data.repository;
  }

  static deserialize(json) /*: Package */ {
    const repository = json.repository;

    return new Package({
      author: json.author,
      license: json.license,
      name: json.name,
      repository: repository
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
