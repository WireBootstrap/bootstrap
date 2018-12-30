module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        //meta: {
        //    basePath: '../'
        //},

        cssmin: {
            target: {
                files: [{
                    //                    expand: true,
                    //cwd: '../bootstrap',
                    src: ['../../css/eb-bootstrap.css'],
                    dest: '../lib/eb-bootstrap.min.css',
                    ext: '.min.css'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['cssmin']);

};