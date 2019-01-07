
angular.module('eb.bootstrap')

.directive('ebCheckbox', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onReady: '=',
            ebData: "=",
            ebModel: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs, ngModelCtrl) {

            $(document).on("ready", '.eb-checkbox', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            });

            var config = {};

            if ($scope.ebModel) {

                config = {
                    events: {
                        itemClick: {
                            callback: function (e) {                                
                                if (Array.isArray($scope.ebModel))
                                    if(e.data.action == "remove"){
                                        var i = $scope.ebModel.indexOf(e.data.cell.value);
                                        if (i > -1) $scope.ebModel.splice(i, 1);
                                    }
                                    else
                                        $scope.ebModel.push(e.data.cell.value);
                                else {
                                    $scope.$parent.$eval("{0}='{1}'".format(attrs.ebModel, e.data.cell.value));
                                    //new eb.PrimitiveReference($scope.$parent.$eval(attrs.ebModel)).set(e.data.cell.value);
                                }
                            }
                        }
                    }
                };
            }

            if ($scope.ebModel && $scope.ebData) {

                var sel = $scope.ebData.getColumn("Selected");

                if (!sel) {

                    // only works with Id, Name, no schema reference
                    var id = $scope.ebData.getColumn("d") ? "Id" : "Name";

                    if (Array.isArray($scope.ebModel)) {
                        $scope.ebData.addColumn("Selected");
                        $scope.ebData.Rows.forEach(function (r) {
                            r.Selected = ($scope.ebModel.indexOf(r[id]) > -1);
                        });
                    }
                    else
                        $scope.ebData.addColumn("Selected").calc(function (r) {
                            return $scope.ebModel == r[id];
                        });
                }

            }

            if ($scope.ebData)
                config.data = $scope.ebData;

            if (attrs.ebCheckbox)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebCheckbox));

            var plugin = $(el).ebCheckbox(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

        }
    }
});
