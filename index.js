const gulpUtil = require('gulp-util');
const MemoryFS = require('memory-fs');
const mimeTypes = require('mime-types');
const path = require('path');
const through2 = require('through2');
const url = require('url');

module.exports = class {
  constructor() {
    this.middleware = this.middleware.bind(this);
    this.dest = this.dest.bind(this);
    this.enableLog = true;
    this.serveBasePath = '/';
    this.fs = new MemoryFS();
  }

  middleware(request, response, next) {
    const readFilePath = this._getFilePathFromUrl(request.url);
    this.fs.readFile(readFilePath, (error, data) => {
      if (error) {
        this._log(`File "${readFilePath}" not found in memory.`);
        if (next) next();
        else response.end();
      } else {
        this._log(`Serving file "${readFilePath}" from memory.`);
        const mimeType = mimeTypes.lookup(readFilePath) || 'application/octet-stream';
        response.writeHead(200, {'Content-Type': mimeType});
        response.end(data);
      }
    });
  };

  dest(destPath) {
    if (!destPath) throw new gulpUtil.PluginError(__filename, 'Must provide destination directory.');
    this.fs.mkdirpSync(path.posix.join('/', destPath));
    return through2.obj((file, encoding, callback) => {
      if (file.isStream()) {
        throw new gulpUtil.PluginError(__filename, 'Streams not supported. Must convert to buffer first.');
      }
      const writeFilePath = (
        path.posix.join('/', destPath, file.relative).replace(/\\/g, '/')
      );
      if (file.isDirectory()) {
        this._log(`Creating directory "${writeFilePath}" in memory.`);
        this.fs.mkdirpSync(writeFilePath);
      } else {
        this._log(`Writing file "${writeFilePath}" to memory.`);
        this.fs.writeFileSync(writeFilePath, file.contents, {encoding: 'binary'});
      }
      callback(null, file);
    });
  };

  _getFilePathFromUrl(fileUrl) {
    let s = url.parse(fileUrl).pathname;
    if (s === '/') s = '/index.html';
    s = path.posix.join('/', this.serveBasePath, s);
    return s
  }

  _log(message) {
    if (!this.enableLog) return;
    gulpUtil.log(message);
  }

  static create() { return new this(); }
};
