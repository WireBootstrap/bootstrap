
angular.module('eb.bootstrap')

.directive('ebSearchList', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            ebData: "=",
            ebModel: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            var config = {};

            if ($scope.ebModel) {
                config = {
                    events: {
                        itemClick: {
                            callback: function (e) {
                                if (Array.isArray($scope.ebModel)) {
                                    var ipos = $scope.ebModel.indexOf(e.data.cell.value);
                                    if (ipos > -1)
                                        $scope.ebModel.splice(ipos, 1);
                                    else
                                        $scope.ebModel.push(e.data.cell.value);
                                }
                                else {
                                    $scope.$parent.$eval("{0}='{1}'".format(attrs.ebModel, e.data.cell.value));
                                }
                            }
                        }
                    }
                };

            }

            if ($scope.ebData) {
                config.data = $scope.ebData;
            }

            if (attrs.ebSearchList)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebSearchList));

            var plugin = $(el).ebSearchList(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

        }
    }
});
