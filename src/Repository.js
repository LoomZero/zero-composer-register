module.exports = class Repository {

  constructor(manager, vendor, repo) {
    this._manager = manager;
    this._vendor = vendor;
    this._repo = repo;
    this._version = 'master';
    this._cache = {};
  }

  /** @returns {import('./SimplePackageManager')} */
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

  async getReleases(allData = false) {
    const cid = allData ? 'getReleases-AllData' : 'getReleases';
    if (this._cache[cid] === undefined) {
      const releases = [];
      const url = new URL('/repos/' + this._vendor + '/' + this._repo + '/releases', 'https://api.github.com/');
      console.log('REQUEST: ' + url);
      const releasesData = JSON.parse(await this.manager.request(url, {headers: {'User-Agent': 'Awesome-Octocat-App'}}));
      console.log(releasesData);
      this._cache['getReleases-AllData'] = releasesData;
      for (const release of releasesData) {
        releases.push(release.tag_name);
      }
      this._cache['getReleases'] = releases;
    }
    return this._cache[cid];
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

}