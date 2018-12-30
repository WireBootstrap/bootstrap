
angular.module('eb.bootstrap')

.directive('ebDropdownList', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onItemClick: '=',
            ebData: "=",
            ebModel: "=",
            onReady: '=',
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            $(document).on("ready", '.eb-dropdown-list', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            }).on("itemClick", '.eb-dropdown-list', function (e, d) {
                if ($scope.onItemClick)
                    $scope.onItemClick(e, d, el);
            });

            var config = {};

            if ($scope.ebModel) {

                config = {
                    events: {
                        itemClick: {
                            callback: function (e) {
                                if (Array.isArray($scope.ebModel))
                                    $scope.ebModel.push(e.data.cell.value);
                                else {
                                    $scope.$parent.$eval("{0}='{1}'".format(attrs.ebModel, e.data.cell.value));
                                }
                            }
                        }
                    }
                };

            }

            if ($scope.ebModel && $scope.ebData) 
                config.selected = $scope.ebModel;
            
            if ($scope.ebData) {
                config.data = $scope.ebData;
            }

            if (attrs.ebDropdownList)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebDropdownList));

            var plugin = $(el).ebDropdownList(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;


        }
    }
});
