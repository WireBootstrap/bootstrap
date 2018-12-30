
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

;
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
;
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
;
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
;
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

;
angular.module('eb.bootstrap')

.directive('ebCheckBox', function () {

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

            $(document).on("ready", '.eb-check-box', function (e, d) {
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

            if (attrs.ebCheckBox)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebCheckBox));

            var plugin = $(el).ebCheckBox(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

        }
    }
});
