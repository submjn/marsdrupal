// # To set up this gulp build:
// $ sudo apt-get install python-software-properties
// $ sudo apt-add-repository ppa:chris-lea/node.js
// $ sudo apt-get update
// $ sudo apt-get install nodejs
// $ node -v
// $ npm -v
// $ npm config set prefix '~/.npm-packages'
//
// # Append to ~/.bashrc:
// export PATH="$PATH:$HOME/.npm-packages/bin"
//
// $ npm install -g gulp
//
// $ npm install
//
// # To run the build:
// $ gulp

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

const ngAnnotate = require('gulp-ng-annotate');
const bytediff = require('gulp-bytediff');
const templateCache = require('gulp-angular-templatecache');
const order = require('gulp-order');
//const fs = require('fs');
const fse = require('fs-extra');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const runSequence  = require('run-sequence');
const imagemin = require('gulp-imagemin');
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');

/* Configuration settings for Gulp */
var _root = "",                    // Root Folder
    _dest = _root + "assets/dist/",                         // Destination Folder
    _gulpConfigPath = "./gulp-config.json",                 // Gulp Configuration File

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
gulp.task("clean", function(cb){
    del([_dest + '/**'], cb)
});

/* Gulp task for creating template cache */
gulp.task("templatecache", function(cb) {
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
gulp.task('jshint', function() {
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
        .pipe(gulpif(prod, babel({
            presets: ['es2015'],
            compact: false,
            "retainLines": true
        })))
        .pipe(gulpif(module, ngAnnotate({ add: true })))
        .pipe(gulpif(module, rename({suffix: '.min'})))
        .pipe(gulpif(prod, bytediff.start()))
        //.pipe(gulpif(module, gulpif(prod, uglify({mangle: true}))))
        .pipe(gulpif(prod, uglify({mangle: true})))
        .pipe(gulpif(prod, bytediff.stop()))
        .pipe(gulp.dest(_jsDest));
}

function generateScripts(type, input){
    Object.keys(input).forEach(function(key, keyIndex) {
        //console.log("index:",keyIndex,"key:",key,"value:",lib[key]);
        var objKey = key + '.js';
        var srcArr = input[key], newArr = [];
        for(var k = 0; k < srcArr.length; k++){
            newArr.push(_root + srcArr[k]);
        }
        gulpScriptsTask(type, newArr, objKey, key + 'scripts task complete');
    });
}

/*Scripts*/
// Run gulp templateCache task before this task
gulp.task("scripts", ["templatecache"] ,function(){
    var config = fse.readJsonSync(_gulpConfigPath, {throws: false}); //JSON.parse(fse.readFileSync(_gulpConfigPath));
    var jsonConfig = json2array(config),
        scriptArr = json2array(jsonConfig[1]),
        libs = scriptArr[0], modules = scriptArr[1];

    generateScripts('lib', libs);
    generateScripts('module', modules);
});

/*Styles*/
gulp.task("styles", function() {
    gulp.src(_stylesSrc)
        .pipe(sass({outputStyle: "compressed"}).on("error", gutil.log))
        .pipe(gulp.dest(_stylesDest));
});

/* Task to watch scss changes */
gulp.task("watch", function(){
    gulp.watch(_htmlTemplatesSrc, function(){ runSequence('templatecache', 'scripts')});
    gulp.watch(_stylesSrc,['styles']);
    gulp.watch(_jsSrc,['scripts']);
});

gulp.task("default", ["templatecache", "scripts", "styles", "watch"]);

gulp.task("mars-build", ["templatecache", "scripts", "styles"]);