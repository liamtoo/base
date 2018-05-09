// Set domain to your local development domain or 'auto' to use BrowserSync.
// Set domain to null to disable BrowserSync.
var domain = 'auto'; 

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var log = require('fancy-log');
var colors = require('ansi-colors');
var notify = require('gulp-notify');

if (domain == 'auto') {
  // Attempt to automatically get the domain name from Dev Desktop's config files.
  domain = require('gulp-getdevdesktopdomain');
  if (domain == null) {
    log.error(colors.red.bold('Error: Could not set BrowserSync domain name automatically.'));
    log.error(colors.red.bold('Manually set a domain name in gulpfile.js to use BrowserSync.'));
  } else {
    log.info('Found Dev Desktop domain: ' + colors.magenta(domain));
  }
}

gulp.task('serve', function() {

  gulp.watch("sass/**/*.scss", gulp.series(['sass']));

  // Skip BrowserSync init if no domain is provided.
  if (domain) {
    browserSync.init({
      proxy: domain
      // browser:     "google chrome"
    });

    gulp.watch("templates/**/*.twig").on('change', browserSync.reload);
    gulp.watch('js/*.js').on('change', browserSync.reload);
  }
});

gulp.task('sass', function() {
  stream = gulp.src("sass/**/*.scss")
    .pipe(plumber(function(error) {
      log.error(colors.red.bold('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    }))
    .pipe(plumber({errorHandler: notify.onError("Error : <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.identityMap())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer([
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 28',
      'safari >= 5',
      'opera >= 23',
      'ios >= 6',
      'android >= 4.2'
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("css"));

  // Only add BrowserSync to the stream if a domain name is provided.
  if (domain) {
    stream = stream.pipe(
      browserSync.stream({
        stream: true
      })
    );
  }

  return stream;
});

gulp.task('default', gulp.series(['sass', 'serve']));
