var gulp = require('gulp')
var connect = require('gulp-connect')

gulp.task('connect', function() {
    connect.server({
        port: 8081,
        root: './'
    })
})

gulp.task('default', ['connect'])
