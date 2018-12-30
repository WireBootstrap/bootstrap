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
                        '../../plugins/eb-csv-export.js',
                        '../../plugins/eb-filter-label.js',
                        '../../plugins/eb-search-list.js',
                        '../../plugins/eb-dataset-paging.js',
                        '../../plugins/eb-dropdown-list.js',
                        '../../plugins/eb-table.js',
                        '../../plugins/eb-button-list.js',
                        '../../plugins/eb-check-box.js',
                        '../../classes/eb-ui-MessageDialog.js',
                        '../../plugins/eb-ui-ErrorDialog.js',
                        '../../plugins/eb-ui-config.js'
                ],
                dest: '../lib/eb-bootstrap.js'
            }
        },
        
        uglify: {
          options: {
            banner: '/* <%= pkg.description %> ' +
                '(<%= grunt.template.today("yyyy-mm-dd") %>) ' +
                '(c) 2014 - <%= grunt.template.today("yyyy") %> Enterprise Blocks, Inc. ' +
                'License details : <%= pkg.license %> */'
            },
            dist: {
            files: {
                '../lib/eb-bootstrap.min.js': ['../lib/eb-bootstrap.js']
            }
          }
        }
        
    });
 
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['concat', 'uglify']);
 
};