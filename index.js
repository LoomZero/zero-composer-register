const FS = require('fs');
const Path = require('path');

const CacheManager = require('./src/CacheManager');
const Repository = require('./src/Repository');
const SimplePackageManager = require('./src/SimplePackageManager');

const data = require('./vendor.json');

(async function() {

  try { 
    const cm = new CacheManager(Path.join(__dirname, 'cachedata'));
    const manager = new SimplePackageManager(cm);

    for (const vendor in data) {
      for (const repo of data[vendor]) {
        manager.addRepo(new Repository(manager, vendor, repo));
      }
    }

    const json = await manager.generatePackageJson();
    FS.writeFileSync('./packages.json', JSON.stringify(json, null, 2));
    const register = await manager.generatePackageRegisterMD();
    FS.writeFileSync('./register.md', register); 
  } catch (e) {
    console.error(e);
  }

})();