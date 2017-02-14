const gulp = require('gulp')
const GulpMem = require('../..')
const gulpWebserver = require('gulp-webserver')

const gulpMem = new GulpMem()

gulpMem.serveBasePath = './build'

gulp.task('default', () => {
  return gulp.src('./src/**/*')
    .pipe(gulpMem.dest('./build'))
    .pipe(gulpWebserver({
      middleware: gulpMem.middleware,
    }))
})
