
angular.module('eb.bootstrap')

.directive('ebTable', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onReady: '=',
            ebData: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            var plugin;

            $(document).on("ready", '.eb-table', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            });

            var config = {};

            if ($scope.ebData) {
                config.data = $scope.ebData;
            }

            if (attrs.ebTable)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebtable));

            var plugin = $(el).ebTable(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

            el.ready(function () {
                if (typeof $scope.onReady == 'function')
                    setTimeout(function () {
                        $scope.onReady();
                    }, 100);
            });
        }
    }
});
