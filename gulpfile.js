var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    bower = require('gulp-bower'),
    replace = require('gulp-replace'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync').create();
    
/* Replace strings */
gulp.task('replace_txt', function(){
  gulp.src('./source/php/**/*.php')
    .pipe(replace('startertheme', 'barnibil'))
    .pipe(gulp.dest('./source/php/'));
});


// Compile Sass, Autoprefix and minify
gulp.task('styles', function() {
    return gulp.src('./source/scss/**/*.scss')
        .pipe(plumber(function(error) {
            gutil.log(gutil.colors.red(error.message));
            this.emit('end');
        }))
        .pipe(sourcemaps.init()) // Start Sourcemaps
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build'));
        //.pipe(rename({suffix: '.min'}))
        //.pipe(cssnano())
        //.pipe(sourcemaps.write('.')) // Creates sourcemaps for minified styles
        //.pipe(gulp.dest('./build'))
});

// JSHint, concat, and minify JavaScript
gulp.task('site-js', function() {
  return gulp.src([	
	  	  
           // Grab your custom scripts
  		  './source/js/*.js'
  		  
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('theme-scripts.js'))
    .pipe(gulp.dest('./build/assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.')) // Creates sourcemap for minified JS
    .pipe(gulp.dest('./build/assets/js'))
});   


// JSHint, concat, and minify Foundation JavaScript
gulp.task('foundation-js', function() {
  return gulp.src([	
  		  
  		  // Foundation core - needed if you want to use any of the components below
          './node_modules/foundation-sites/js/foundation.core.js',
          './node_modules/foundation-sites/js/foundation.util.*.js',
          
          // Pick the components you need in your project
          './node_modules/foundation-sites/js/foundation.abide.js',
          './node_modules/foundation-sites/js/foundation.accordion.js',
          './node_modules/foundation-sites/js/foundation.accordionMenu.js',
          './node_modules/foundation-sites/js/foundation.drilldown.js',
          './node_modules/foundation-sites/js/foundation.dropdown.js',
          './node_modules/foundation-sites/js/foundation.dropdownMenu.js',
          './node_modules/foundation-sites/js/foundation.equalizer.js',
          './node_modules/foundation-sites/js/foundation.interchange.js',
          './node_modules/foundation-sites/js/foundation.magellan.js',
          './node_modules/foundation-sites/js/foundation.offcanvas.js',
          './node_modules/foundation-sites/js/foundation.orbit.js',
          './node_modules/foundation-sites/js/foundation.responsiveMenu.js',
          './node_modules/foundation-sites/js/foundation.responsiveToggle.js',
          './node_modules/foundation-sites/js/foundation.reveal.js',
          './node_modules/foundation-sites/js/foundation.slider.js',
          './node_modules/foundation-sites/js/foundation.sticky.js',
          './node_modules/foundation-sites/js/foundation.tabs.js',
          './node_modules/foundation-sites/js/foundation.toggler.js',
          './node_modules/foundation-sites/js/foundation.tooltip.js',
  ])
	.pipe(babel({
		presets: ['es2015'],
	    compact: true
	}))
    .pipe(sourcemaps.init())
    .pipe(concat('foundation.js'))
    .pipe(gulp.dest('./build/assets/js/vendor'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.')) // Creates sourcemap for minified Foundation JS
    .pipe(gulp.dest('./build/assets/js/vendor'))
}); 


// Browser-Sync watch files and inject changes
gulp.task('browsersync', function() {
    // Watch files
    var files = [
    	'./build/assets/css/*.css', 
    	'./build/assets/js/*.js',
    	'/**/*.php',
    	'./build/assets/images/**/*.{png,jpg,gif,svg,webp}',
    ];

    browserSync.init(files, {
	    // Replace with URL of your local site
	    proxy: "http://thefrontend.no.dev/",
    });
    
    gulp.watch('./source/scss/**/*.scss', ['styles']);
    gulp.watch('./source/js/*.js', ['site-js']).on('change', browserSync.reload);

});

gulp.task('copy:php', function() {
    /* Templates */
    gulp.src(['source/php/**/*'])
        .pipe(gulp.dest('build'));
        
    /* Includes */
	return gulp.src(['source/includes/**/*'], { base: 'source', read: false })
		.pipe(gulp.dest('build'));
			
	
});

/* Copy fonts to assets dir */
gulp.task('copy:fonts', function() {
   
    /* Fonts */
    return gulp.src(['source/fonts/**/*'])
		.pipe(gulp.dest('build/assets/fonts'));
		
});


/* Copy fonts to assets dir */
gulp.task('copy:locale', function() {
   
    /* Translation files */
    return gulp.src(['./source/locale/*.mo'])
		.pipe(gulp.dest('./build/locale/'));
		
});


// Images
gulp.task('copy:images', function() {
  return gulp.src('./source/images/**/*')
	.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
	//.pipe(plugins.livereload(server))
	.pipe(gulp.dest('./build/assets/images'));
	//.pipe(plugins.notify({ message: 'Images task complete' }));
});

// Watch files for changes (without Browser-Sync)
gulp.task('watch', function() {

	// Watch .php files 
	//gulp.watch(['source/php/**/*'], ['copy:php']);
	
	// Watch .scss files
	gulp.watch('./source/scss/**/*.scss', ['styles']);

	// Watch site-js files
	gulp.watch('./source/js/*.js', ['site-js']);
	
	// Watch locale-files 
	gulp.watch('./source/locale/*.mo'), [ 'copy:locale'];
	
	gulp.watch('./source/fonts/**/*'), [ 'copy:fonts'];
	
	gulp.watch('./source/images/**/*'), [ 'copy:images'];
  
	// Watch foundation-js files
	//gulp.watch('./source/js/vendor/foundation-sites/js/*.js', ['foundation-js']);

}); 


// Run styles, site-js and foundation-js
gulp.task('default', function() {
  gulp.start('styles', 'site-js', 'foundation-js', 'copy:php', 'copy:locale', 'copy:images', 'copy:fonts', 'watch');
});