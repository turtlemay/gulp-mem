## Purpose of this module

Hard drive i/o is slow and writing to your ssd reduces its lifespan. This gulp plugin provides an in-memory destination for development builds (without having to make a ramdisk or symlinking your build folder into one).

## Installation

```bash
# yarn add --dev gulp-mem
npm install -D gulp-mem
```

## Usage

* Import the module:
    ```javascript
    // import GulpMem from 'gulp-mem';
    const GulpMem = require('gulp-mem');
    ```

* Create your instance:
    ```javascript
    // const gulpMem = new GulpMem();
    const gulpMem = GulpMem.create();
    ```

* Set the base path to match your build destination:
    ```javascript
    gulpMem.serveBasePath = './build';
    ```
    If you build to `%PROJECT_PATH%/build` set your base path to `./build`.
    "`/`" or "`./`" corresponds to the mock filesystem root.

* Pipe stuff into `gulpMem.dest` instead of `gulp.dest` to write it to the in-memory filesystem:
    ```javascript
    return gulp.src('./**/*')
        .pipe(gulpMem.dest('./build'));
    ```
    I use separate gulp sequences for dev builds and production builds, but you could also conditionally patch `gulp.dest` or check `argv` or an environment variable or something.

* Now you can serve the memory contents through your dev server using the [middleware](https://github.com/senchalabs/connect#use-middleware) at `gulpMem.middleware`. Most likely you'll want to use something like [BrowserSync](https://www.browsersync.io/):
    ```javascript
    browserSync.init({
        server: './build',
        middleware: gulpMem.middleware,
    });
    ```
    If you have a server running in another process you can start a `require('http')` server in your gulpfile and proxy to it.

* You can also use the [filesystem api](https://nodejs.org/api/fs.html) on `gulpMem.fs` or patch in a different implementation.

## Configuration

```javascript
// Log messages to console. (default `true`)
gulpMem.enableLog = true;
```
