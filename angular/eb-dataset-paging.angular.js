
angular.module('eb.bootstrap')

 .directive('ebDatasetPaging', function () {

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

                if (attrs.ebDatasetPaging)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebDatasetPaging));

                var plugin = $(el).ebDatasetPaging(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }
});
