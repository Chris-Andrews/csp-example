var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('default',['js', 'browser-sync']);

// Static server
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        },
        open: false,
    });
});


var args = watchify.args;
args.debug = true;

var bundler = watchify(browserify(watchify.args));

// var bundler = watchify(browserify('./client/app/app.js',
//             // Assigning debug to have sourcemaps
//             _.assign(watchify.args, {
//                 debug: true
//             })));

// add the file to bundle
bundler.add('./csp-example.js');
// add any other browserify options or transforms here
//bundler.transform('brfs');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('./bundle.js'))
    // optional, remove if you dont want sourcemaps
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write({includeContent:false,sourceRoot:'./'}))
      .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./'));
}

gulp.watch('./csp-example.js', ['js']);
gulp.watch('./index.html').on('change',reload);
gulp.watch('./bundle.js').on('change',reload);
