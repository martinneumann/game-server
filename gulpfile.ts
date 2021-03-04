import { dest, series, src, task } from 'gulp'; // or import * as gulp from 'gulp'
import ts from 'gulp-typescript';
const eslint = require('gulp-eslint');
const browserify = require('browserify');
var source = require('vinyl-source-stream');
var clean = require('gulp-clean');

task('clean', function () {
    return src('dist', { read: false })
        .pipe(clean());
});

task('lint', () => {
    return src(['./backend/*.ts', './backend/world generation/*.ts', 'frontend/app.ts', './frontend/environment.ts'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

task('build', () => {
    return src(['./backend/*.ts', './frontend/app.ts', './frontend/environment.ts'])
        .pipe(ts())
        .pipe(dest('./dist/'))
});

task('build world gen', () => {
    return src(['./backend/world generation/*.ts'])
        .pipe(ts())
        .pipe(dest('./dist/world generation/'));
});

task('browserify', () => {
    return browserify(
        {
            extensions: ['.js'],
            debug: true,
            cache: {},
            packageCache: {},
            fullPaths: true,
            entries: ['./dist/app.js'],
        }
    )
        .bundle()
        .on("error", function (err: { message: string; }) { console.log("Error : " + err.message); })
        .pipe(source('app.js'))
        .pipe(dest('./dist'));
});

task('move html', () => {
    return src('./frontend/index.html')
        .pipe(dest('./dist/'));
});

task('move css', () => {
    return src('./frontend/css/*.css')
        .pipe(dest('./dist/assets/css/'));
});

exports.default = series('lint', 'build', 'build world gen', 'browserify', 'move html', 'move css')

