Hard drive i/o is slow and writing to your ssd reduces its lifespan. This gulp plugin provides an in-memory destination for development builds without having to make a ramdisk or symlink your build folder into one.

# Installation

```bash
npm install -D gulp-mem
```

# Usage

Import the module and set up your instance:

```javascript
// Import the module.
const GulpMem = require('gulp-mem');

// Create your instance.
const gulpMem = new GulpMem();

// Set the base path to match your build destination.
// "/" or "./" corresponds to the mock filesystem root.
// If you build to "%PROJECT_PATH%/build" set your base path to "./build".
gulpMem.serveBasePath = './build';
```

Pipe stuff into `gulpMem.dest` instead of `gulp.dest` to write it to the in-memory filesystem:

```javascript
// You may want to use separate gulp sequences for dev and production builds,
// but you could also do some other inline check or conditionally patch the method.

gulp.task('build:dev', () => {
    return gulp.src('./**/*')
        // ...
        // Write to memory:
        .pipe(gulpMem.dest('./build'));
});

gulp.task('build:prod', () => {
    return gulp.src('./**/*')
        // ...
        // Write to disk:
        .pipe(gulp.dest('./build'));
});
```

Now you can serve the memory contents through your dev server using the [middleware](https://github.com/senchalabs/connect#use-middleware) at `gulpMem.middleware`. Most likely you'll want to use something like [BrowserSync](https://www.browsersync.io/):

```javascript
gulp.task('start-dev', () => {

    // Start your dev server using the middleware:
    browserSync.init({
        server: './build',
        middleware: gulpMem.middleware,
    });

    // Set up your watchers...
});
```

If you already have a server running in another process you can start a minimal `http` server in your gulp process and proxy to/from it.
You can also use the [filesystem api](https://nodejs.org/api/fs.html) on `gulpMem.fs` or patch in a different implementation.

# Optional Configuration

```javascript
// Log messages to console. (default `true`)
gulpMem.enableLog = true;
```
