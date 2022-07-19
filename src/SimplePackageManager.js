const Https = require('https');

module.exports = class SimplePackageManager {

  /**
   * @param {import('./CacheManager')} cm 
   */
  constructor(cm) {
    this.cm = cm;
    this._repos = [];
  }

  /** @returns {import('./Repository')[]} */
  get repos() {
    return this._repos;
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

  /**
   * @param {import('./Repository')} repo 
   * @returns 
   */
  addRepo(repo) {
    this.repos.push(repo);
    return this;
  }

  async generatePackageJson() {
    const json = {
      packages: {},
    };

    for (const repo of this.repos) {
      console.log('GENERATE: ' + repo.name);
      const releases = await repo.getReleases(true);

      for (const release of releases) {
        try {
          const version = release.tag_name;
          const cache_id = repo._vendor + '.' + repo._repo + '.release.' + version;
          let data = this.cm.get(cache_id, release);
          if (!data) {
            data = JSON.parse(await repo.checkout(version).getFile('composer.json'));
            this.cm.set(cache_id, release, data);
          }

          json.packages[data.name] = json.packages[data.name] || {};
          json.packages[data.name][version] = data;
          json.packages[data.name][version].dist = repo.getDist();
          json.packages[data.name][version].version = version;
        } catch (e) {
          console.log(e);
        }
      }
    }
    return json;
  }

  async generatePackageRegisterMD() {
    const lines = [
      '# Register',
      '',
    ];
    const vendors = {};

    for (const repo of this.repos) {
      vendors[repo._vendor] = vendors[repo._vendor] || [];
      vendors[repo._vendor].push(repo);
    }
    for (const vendor in vendors) {
      lines.push('## Vendor: [' + vendor + '](https://github.com/' + vendor  + '?tab=repositories)');
      lines.push('');
      for (const repo of vendors[vendor]) {
        const releases = await repo.getReleases(true);
        
        lines.push('### [' + repo._repo + '](https://github.com/' + vendor + '/' + repo._repo + ') | ' + releases[0].tag_name);
        lines.push('<details><summary>Releases for ' + repo._repo + '</summary>');
        lines.push('');
        for (const release in releases) {
          lines.push('- [' + releases[release].name + '](' + releases[release].html_url + ')');
        }
        lines.push('');
        lines.push('</details>');
        lines.push('');
      }
      lines.push('');
    }
    return lines.join('\n');
  }

}