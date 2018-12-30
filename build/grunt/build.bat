REM call npm install grunt --save-dev
REM call npm install grunt-contrib-concat
REM call npm install grunt-contrib-uglify
REM call npm install grunt-contrib-cssmin
call grunt -gruntfile gruntfile-bootstrap-plugins.js
call grunt -gruntfile gruntfile-bootstrap-css.js
call grunt -gruntfile gruntfile-bootstrap-angular.js
