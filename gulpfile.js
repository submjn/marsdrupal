/* Gulp Plugins Import */
const gulp = require('gulp');
const del = require('del');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const pngquant = require('imagemin-pngquant');
const ngAnnotate = require('gulp-ng-annotate');
const bytediff = require('gulp-bytediff');
const templateCache = require('gulp-angular-templatecache');
const order = require('gulp-order');
const fse = require('fs-extra');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const runSequence  = require('run-sequence');
const imagemin = require('gulp-imagemin');
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');
const livereload = require('gulp-livereload');

/* Configuration settings for Gulp */
var ngFolder = 'app-git';
var _root = ngFolder + "/",                    // Root Folder
    _dest = _root + "assets/dist/",                         // Destination Folder
    _gulpConfigPath = ngFolder + "/gulp-config.json",                 // Gulp Configuration File

    // HTML Templates
    _htmlTemplatesSrc = _root + "js/templates/*.html",
    _htmlTemplatesDest = _dest + "js/templates/",

    // Javascript
    _jsSrc = _root + "js/**/*.js",
    _jsDest = _dest + 'js',

    // SCSS Styles
    _stylesSrc = _root + "assets/scss/**/*.scss",
    _stylesDest = _root + "assets/css";

/* Clean Task */
gulp.task("ng-clean", function(cb){
    del([_dest + '/**'], cb)
});

/* Gulp task for creating template cache */
gulp.task("ng-templatecache", function(cb) {
    var config = {
        htmltemplates: _htmlTemplatesSrc,
        templateCache: {
            file: "templates.js",
            options: {
                module: "app",
                root: "templateCache/",
                standAlone: false
            }
        },
        temp: _htmlTemplatesDest
    };

    return gulp
        .src(config.htmltemplates)
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            html5: true,
            removeComments: true
        }))
        .pipe(templateCache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));

});

/* Javascript Hinting */
/*JS syntax error showing*/
gulp.task('ng-jshint', function() {
    var lintConfig = {
        "strict": false,
        "quotmark": false,
        "browser": true,
        "devel": true,
        "globals": {
            "$": true,
        }
    };
    return gulp.src(_root + 'js/**/*.js')
        .pipe(jshint(lintConfig))
        .pipe(jshint.reporter('default'));
});

/* Functions */
function json2array(json){
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(json[key]);
    });
    return result;
}

function gulpScriptsTask(type, srcArr, filename, msg){
    var module  = (type === 'module') ? true : false;
    //run with command 'gulp --type=dev' to enable development mode
    var prod = (gutil.env.type !== 'dev') ? true : false;
    return gulp.src(srcArr)
        .pipe(concat(filename))
        .pipe(gulpif(module, gulpif(prod, babel({
            presets: ['es2015'],
            compact: false,
            "retainLines": true
        }))))
        .pipe(gulpif(module, ngAnnotate({ add: true })))
        //.pipe(gulpif(module, rename({suffix: '.min'})))
        //.pipe(gulpif(prod, bytediff.start()))
        //.pipe(gulpif(module, gulpif(prod, uglify({mangle: false}))))
        //.pipe(gulpif(prod, uglify({mangle: false})))
        //.pipe(gulpif(prod, bytediff.stop()))
        .pipe(gulp.dest(_jsDest));
}

function generateScripts(type, input){
    Object.keys(input).forEach(function(key, keyIndex) {
        //console.log("index:",keyIndex,"key:",key,"value:");
        var objKey = key + '.js';
        var srcArr = input[key], newArr = [];
        for(var k = 0; k < srcArr.length; k++){
            newArr.push(_root + srcArr[k]);
            console.log(srcArr[k]);
        }

        // for(var k = srcArr.length; k > 0; k--){
        //     newArr.push(_root + srcArr[k-1]);
        // }
        // for(var k = 0; k < srcArr.length; k++){
        //     console.log(newArr[k]);
        // }
        //console.log(newArr);
        gulpScriptsTask(type, newArr, objKey, key + 'scripts task complete');
    });
}

/*Scripts*/
// Run gulp templateCache task before this task
gulp.task("ng-scripts", ["ng-templatecache"] ,function(){
    var config = fse.readJsonSync(_gulpConfigPath, {throws: false}); //JSON.parse(fse.readFileSync(_gulpConfigPath));
    var jsonConfig = json2array(config),
        scriptArr = json2array(jsonConfig[1]),
        libs = scriptArr[0], modules = scriptArr[1];

    generateScripts('lib', libs);
    generateScripts('module', modules);
});

/*Styles*/
gulp.task("ng-styles", function() {
    gulp.src(_stylesSrc)
        .pipe(sass({outputStyle: "compressed"}).on("error", gutil.log))
        .pipe(gulp.dest(_stylesDest));
});

/* Task to watch scss changes */
gulp.task("ng-watch", function(){
    gulp.watch(_htmlTemplatesSrc, function(){ runSequence('ng-templatecache', 'ng-scripts')});
    gulp.watch(_stylesSrc,['ng-styles']);
    gulp.watch(_jsSrc,['ng-scripts']);
});

gulp.task("ng-default", ["ng-templatecache", "ng-scripts", "ng-styles", "ng-watch"]);

gulp.task("ng-build", ["ng-templatecache", "ng-scripts", "ng-styles"]);

// MARS Theme
gulp.task('imagemin', function () {
    return gulp.src('./themes/custom/mars/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./themes/custom/mars/images'));
});

gulp.task('sass', function () {
  gulp.src('./themes/custom/mars/sass/**/*.scss')
    .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./themes/custom/mars/css'));
});

gulp.task('uglify', function() {
  gulp.src('./themes/custom/mars/lib/*.js')
    .pipe(uglify('main.js'))
    .pipe(gulp.dest('./themes/custom/mars/js'))
});

gulp.task('watch', function(){
    livereload.listen();

    gulp.watch('./themes/custom/mars/sass/**/*.scss', ['sass']);
    gulp.watch('./themes/custom/mars/lib/*.js', ['uglify']);
    gulp.watch(['./themes/custom/mars/css/*.css', './themes/custom/mars/**/*.twig', './themes/custom/mars/js/*.js'], function (files){
        livereload.changed(files)
    });
});

gulp.task('default', ['sass','uglify', 'imagemin', 'watch']);