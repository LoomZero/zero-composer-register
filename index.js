const Https = require('https');
const FS = require('fs');

const data = require('./vendor.json');

class SimplePackageManager {

  constructor() {
    this._repos = [];
  }

  request(url, options = {}) {
    return new Promise((resolve, reject) => {
      Https.get(url, options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      }).on('error', (e) => {
        reject(e);
      });
    });
  }

  addRepo(repo) {
    this._repos.push(repo);
    return this;
  }

  async generatePackageJson() {
    const json = {
      packages: {},
    };

    for (const repo of this._repos) {
      console.log('GENERATE: ' + repo.name);
      const releases = await repo.getReleases();

      for (const release of releases) {
        try {
          const data = JSON.parse(await repo.checkout(release).getFile('composer.json'));

          json.packages[data.name] = json.packages[data.name] || {};
          json.packages[data.name][release] = data;
          json.packages[data.name][release].dist = repo.getDist();
          json.packages[data.name][release].version = repo._version;
        } catch (e) {
          console.log(e);
        }
      }
    }
    return json;
  }

};

class Repo {

  constructor(manager, vendor, repo) {
    this._manager = manager;
    this._vendor = vendor;
    this._repo = repo;
    this._version = 'master';
    this._cache = {};
  }

  /** @returns {SimplePackageManager} */
  get manager() {
    return this._manager;
  }

  get name() {
    return this._vendor + '/' + this._repo;
  }

  checkout(version = 'master') {
    this._version = version;
    return this;
  }

  getDist() {
    return {
      type: 'zip',
      url: 'https://github.com/' + this._vendor + '/' + this._repo + '/archive/' + this._version + '.zip',
    };
  }

  async getReleases() {
    if (this._cache['getReleases'] === undefined) {
      const releases = [];
      const url = new URL('/repos/' + this._vendor + '/' + this._repo + '/releases', 'https://api.github.com/');
      console.log('REQUEST: ' + url);
      const releasesData = JSON.parse(await this.manager.request(url, {headers: {'User-Agent': 'Awesome-Octocat-App'}}));
      for (const release of releasesData) {
        releases.push(release.tag_name);
      }
      this._cache['getReleases'] = releases;
    }
    return this._cache['getReleases'];
  }

  async getFile(path) {
    const location = '/' + this._vendor + '/' + this._repo + '/' + this._version + '/' + path;

    if (this._cache['getFile:' + location] === undefined) {
      const url = new URL(location, 'https://raw.githubusercontent.com/');
      console.log('REQUEST: ' + url);
      const content = await this.manager.request(url);
      this._cache['getFile:' + location] = content;
    }
    return this._cache['getFile:' + location];
  }

};

(async function() {

  const manager = new SimplePackageManager();

  for (const vendor in data) {
    for (const repo of data[vendor]) {
      manager.addRepo(new Repo(manager, vendor, repo));
    }
  }

  const json = await manager.generatePackageJson();
  FS.writeFileSync('./packages.json', JSON.stringify(json, null, 2));

})();