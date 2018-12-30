
angular.module('eb.bootstrap')

.directive('ebButtonList', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onItemClick: '=',
            onReady: '=',
            ebData: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            $(document).on("ready", '.eb-button-list', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            }).on("itemClick", '.eb-button-list', function (e, d) {
                if ($scope.onItemClick)
                    $scope.onItemClick(e, d, el);
            });

            var config = {
                data: $scope.ebData
            }

            if (attrs.ebButtonList)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebButtonList));

            var plugin = $(el).ebButtonList(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;


        }
    }
});

