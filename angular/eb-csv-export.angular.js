
angular.module('eb.bootstrap')

 .directive('ebCsvExport', function () {

        return {
            restrict: 'AEC',
            replace: false,
            scope: {
                ebData: "=",
                plugin: "="
            },
            link: function ($scope, el, attrs) {

                var config = {};

                if ($scope.ebData) {
                    config.data = $scope.ebData;
                }

                if (attrs.ebCsvExport)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebCsvExport));

                var plugin = $(el).ebCsvExport(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }

});

