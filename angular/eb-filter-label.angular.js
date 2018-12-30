
angular.module('eb.bootstrap')

 .directive('ebFilterLabel', function () {

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

                if (attrs.ebFilterLabel)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebFilterLabel));

                var plugin = $(el).ebFilterLabel(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }
});
