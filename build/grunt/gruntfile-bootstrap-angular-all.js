module.exports = function(grunt) {
     
    grunt.initConfig({
 
        pkg: grunt.file.readJSON('package.json'),
 
        meta: {
            //basePath: '../'
        },
         
        concat: {
            options: {
                stripBanners: true,
                separator: ';'
            },
            dist: {
                src: [
                '../lib/eb-bootstrap.js',
                '../lib/eb-bootstrap.angular.js'
                ],
                dest: '../lib/eb-bootstrap.angular-all.js'
            }
        },
        
        uglify: {
          options: {
            banner: '/* Angular and <%= pkg.description %> ' +
                '(<%= grunt.template.today("yyyy-mm-dd") %>) ' +
                '(c) 2014 - <%= grunt.template.today("yyyy") %> Enterprise Blocks, Inc. ' +
                'License details : <%= pkg.license %> */'
            },
            dist: {
            files: {
                '../lib/eb-bootstrap.angular-all.min.js': ['../lib/eb-bootstrap.angular-all.js']
            }
          }
        }
        
    });
 
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['concat', 'uglify']);
 
};