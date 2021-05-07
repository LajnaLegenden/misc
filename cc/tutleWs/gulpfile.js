var gulp = require("gulp");
var ts = require("gulp-typescript");
let nodemon = require('gulp-nodemon')

var tsProject = ts.createProject("tsconfig.json");

// gulp.task("ts", function() {
//     return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
// });

gulp.task('assets', function() {
    return gulp
        .src('server/assets/**/*')
        .pipe(gulp.dest('dist/assets'));
});

// gulp.task('views', function() {
//     return gulp
//         .src('server/views/**/*.hbs')
//         .pipe(gulp.dest('dist/views'));
// });

// gulp.task('server', function(done) {
//     nodemon({
//         script: 'dist/main.js'
//     })
// })

// gulp.task('watch', function(cb) {
//     gulp.watch('server/**/*.ts', gulp.series('ts'))
//     gulp.watch('server/assets/**/*', gulp.series('assets'));
//     gulp.watch('server/views/**/*', gulp.series('views'));
// });
// gulp.task('serve', gulp.series(['watch']), function() {
//     return nodemon({
//             script: 'dist/main.js',
//         })
//         .on('restart', function() {
//             console.log('restarted');
//         })
// })


gulp.task('sass', function() {
    return gulp.src(sassFilesTobeProcessed).
    pipe(sass()).
    pipe(concat('ready_stylesheet.css')).
    pipe(gulp.dest('express/public/stylesheets'))
})

gulp.task('watch', function() {
    return gulp.watch('server/assets/**/*', gulp.series(['assets']));
})

gulp.task('serve', gulp.series(['watch']), function() {
    return nodemon({
            script: 'dist/main.js',
        })
        .on('restart', function() {
            console.log('restarted');
        })
})

//gulp.task('default', gulp.series(['ts', 'views', 'assets', 'watch', "server", ]));