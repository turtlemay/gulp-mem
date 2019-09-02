const PluginError = require('plugin-error')
const MemoryFS = require('memory-fs')
const log = require('fancy-log')
const mimeTypes = require('mime-types')
const path = require('path')
const through2 = require('through2')
const url = require('url')

module.exports = class {
  constructor() {
    this.enableLog = true

    /** @type {(msg: any) => void} */
    this.logFn = log
    /** @type {(msg: any) => void} */
    this.errorFn = log.error

    this.serveBasePath = '/'
    this.fs = new MemoryFS()

    this.middleware = this.middleware.bind(this)
    this.dest = this.dest.bind(this)
  }

  /**
   * @param {Object} request
   * @param {Object} response
   * @param {Function} next
   */
  middleware(request, response, next) {
    const readFilePath = this._getFilePathFromUrl(request.url)
    this.fs.readFile(readFilePath, (error, data) => {
      if (error) {
        this._error(`File "${readFilePath}" not found in memory.`)
        if (next) next()
        else response.end()
      } else {
        this._log(`Serving file "${readFilePath}" from memory.`)
        const mimeType = mimeTypes.lookup(readFilePath) || 'application/octet-stream'
        response.writeHead(200, { 'Content-Type': mimeType })
        response.end(data)
      }
    })
  }

  /** @param {String} destPath */
  dest(destPath) {
    return through2.obj((file, encoding, callback) => {
      if (file.isStream()) {
        throw new PluginError(__filename, 'Streams not supported. Must convert to buffer first.')
      }
      if (file.isDirectory()) {
        return void callback(null, file)
      }
      let realDestPath
      if (destPath instanceof Function) {
        realDestPath = destPath(file)
      } else {
        realDestPath = destPath
      }
      const writeFilePath = path.posix.join('/', realDestPath, file.relative).replace(/\\/g, '/')
      const createDirPath = path.posix.dirname(writeFilePath)
      this._log(`Creating directory "${createDirPath}" in memory.`)
      this.fs.mkdirpSync(createDirPath)
      this._log(`Writing file "${writeFilePath}" to memory.`)
      this.fs.writeFileSync(writeFilePath, file.contents, { encoding: 'binary' })
      callback(null, file)
    })
  }

  /** @param {String} fileUrl */
  _getFilePathFromUrl(fileUrl) {
    let s = url.parse(fileUrl).pathname
    if (s === '/') s = '/index.html'
    s = path.posix.join('/', this.serveBasePath, s)
    return s
  }

  /** @param {String} message */
  _log(message) {
    if (this.enableLog && this.logFn instanceof Function) {
      this.logFn(message)
    }
  }

  /** @param {String} message */
  _error(message) {
    if (this.enableLog && this.errorFn instanceof Function) {
      this.errorFn(message)
    }
  }
}
