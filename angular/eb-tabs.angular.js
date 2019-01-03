angular.module('eb.bootstrap')

.directive('ebTabs', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onItemClick: "=",
            currentTab: "=",
            control: "="
        },
        link: function ($scope, el, attrs) {
            
            if (typeof $scope.control != 'undefined') {
                $scope.control = $scope.control || {};
                $scope.control.setTab = function (tab) {
                    _setTab(tab);
                }
            }

            el.bind('click', function (event) {
                _setTab(event.target);
            });

            function _setTab(tab) {

                var li = angular.element(tab);
                li = angular.element(li[0].closest("li"));

                if (li.hasClass("disabled")) return;

                el.find("li").removeClass("active");
                li.addClass("active");

                var config = attrs.ebTabs;
                if (config) config = $scope.$parent.$eval(config);
                else throw "Missing config property";

                var panes = angular.element(document.querySelector(config.tabs));

                panes.find(".tab-pane").hide();

                var tab = panes.find(li.context.dataset.tab);
                tab.css("display", "inline").css("visibility", "visible");

                if (typeof $scope.currentTab != 'undefined')
                    $scope.currentTab = li.context.dataset.tab;

                if ($scope.onItemClick)
                    $scope.onItemClick(li.context.dataset.tab);

                if (config.onItemClick)
                    config.onItemClick(li.context.dataset.tab);

            }

        }
    }
});
