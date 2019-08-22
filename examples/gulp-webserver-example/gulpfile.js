const gulp = require('gulp')
const GulpMem = require('../..')
const gulpWebserver = require('gulp-webserver')
const log = require('fancy-log')

const gulpMem = new GulpMem()

gulpMem.serveBasePath = './build'
gulpMem.logFn = log
gulpMem.errorFn = log.error

gulp.task('default', () => {
  return gulp.src('./src/**/*')
    .pipe(gulpMem.dest('./build'))
    .pipe(gulpWebserver({
      middleware: gulpMem.middleware,
    }))
})
