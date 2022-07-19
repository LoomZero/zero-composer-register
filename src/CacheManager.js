const FS = require('fs');
const Path = require('path');
const Crypto = require('crypto');

module.exports = class CacheManager {

  constructor(path) {
    this.path = path;
    this._loaded = {};
  }

  getFile(id) {
    return Path.join(this.path, id + '.json');
  }

  getHash(data) {
    if (typeof data !== 'string') data = JSON.stringify(data);
    return Crypto.createHash('md5').update(data).digest('hex');
  }

  get(id, hash) {
    hash = this.getHash(hash);
    const file = this.getFile(id);
    if (this._loaded[file] === undefined) {
      try {
        this._loaded[file] = JSON.parse('' + FS.readFileSync(file));
        if (this._loaded[file].hash === hash) {
          console.log('CACHE: Load cache id "' + id + '" with hash "' + hash + '"');
        } else {
          delete this._loaded[file];
          console.log('CACHE: Load cache id "' + id + '" with hash "' + hash + '" but the hash is expired.');
        }
      } catch (e) {
        console.log('CACHE: Don`t load the cache for id "' + id + '" with hash "' + hash + '": ' + e.message);
      }
    }
    return this._loaded[file] ? this._loaded[file].data : null;
  }

  set(id, hash, data) {
    hash = this.getHash(hash);
    const file = this.getFile(id);
    this._loaded[file] = { hash, data };
    FS.writeFileSync(file, JSON.stringify(this._loaded[file], null, 2));
  }

}