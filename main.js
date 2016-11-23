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
    let readFilePath = url.parse(request.url).pathname;
    if (readFilePath === '/') readFilePath = '/index.html';
    readFilePath = path.posix.join(this.serveBasePath, readFilePath);
    this.fs.readFile(readFilePath, (error, data) => {
      if (error) {
        if (this.enableLog) gulpUtil.log(`File "${readFilePath}" not found in memory.`);
        if (next) next();
        else response.end();
      } else {
        if (this.enableLog) gulpUtil.log(`Serving file "${readFilePath}" from memory.`);
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
      const writeFilePath = path.posix.join('/', destPath, file.relative);
      if (file.isBuffer()) {
        if (file.isDirectory()) {
          if (this.enableLog) gulpUtil.log(`Creating directory "${writeFilePath}" in memory.`);
          this.fs.mkdirpSync(writeFilePath);
        } else {
          if (this.enableLog) gulpUtil.log(`Writing file "${writeFilePath}" to memory.`);
          this.fs.writeFileSync(writeFilePath, file.contents, {encoding: 'binary'});
        }
      } else if (file.isStream()) {
        throw new gulpUtil.PluginError(__filename, 'Streams not supported. Must convert to buffer first.');
      }
      callback(null, file);
    });
  };

  static create() { return new this(); }
};
