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
                '../../angular/eb.angular.js',
                        '../../angular/eb-csv-export.angular.js',
                        '../../angular/eb-filter-label.angular.js',
                        '../../angular/eb-search-list.angular.js',
                        '../../angular/eb-dataset-paging.angular.js',
                        '../../angular/eb-dropdown-list.angular.js',
                        '../../angular/eb-table..angularjs',
                        '../../angular/eb-button-list.angular.js',
                        '../../angular/eb-checkbox.angular.js',
                        '../../angular/eb-tabs.angular.js'
                ],
                dest: '../lib/eb-bootstrap.angular.js'
            }
        },
        
        uglify: {
          options: {
            banner: '/* Angular <%= pkg.description %> ' +
                '(<%= grunt.template.today("yyyy-mm-dd") %>) ' +
                '(c) 2014 - <%= grunt.template.today("yyyy") %> Enterprise Blocks, Inc. ' +
                'License details : <%= pkg.license %> */'
            },
            dist: {
            files: {
                '../lib/eb-bootstrap.angular.min.js': ['../lib/eb-bootstrap.angular.js']
            }
          }
        }
        
    });
 
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['concat', 'uglify']);
 
};