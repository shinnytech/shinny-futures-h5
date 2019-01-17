angular.module('starter')

.directive('tableAddonOdd', [function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            var temp = ' <td>合约代码</td>';
            for (var i = 0; i < CONST.inslist_cols_odd.length; i++) {
                var name = CONST.inslist_cols_name[CONST.inslist_cols_odd[i]];
                temp += '<td>' + name + '</td>';
            }
            ele[0].innerHTML = temp;
        }
    }
}])

.directive('tableAddonEven', [function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            var temp = ' <td>合约名称</td>';
            for (var i = 0; i < CONST.inslist_cols_even.length; i++) {
                var name = CONST.inslist_cols_name[CONST.inslist_cols_even[i]];
                temp += '<td>' + name + '</td>';
            }
            ele[0].innerHTML = temp;
        }
    }
}])

.directive('calHeight', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            ele[0].style.height = '0px';
            ele[0].style.position = 'absolute';
            ele[0].style.bottom = '0px';
            var parent = ele[0].parentElement;
            var top = 0;
            for (var i = 0; i < parent.childElementCount - 1; i++) {
                top += parent.children[i].clientHeight;
            }
            ele[0].style.top = (top + 1) + 'px';
            var parentHeight = ele[0].parentElement.parentElement.clientHeight;
            if ($rootScope.$state.current.views) {
                parentHeight -= 49;
            }
            ele[0].style.height = (parentHeight - 44 - top) + 'px';
        }
    };
}])


    .directive('showTabs', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope, $el) {
            $rootScope.hideTabs = false;
        }
    };
}])

.directive('hideTabs', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope, $el) {
            $rootScope.hideTabs = true;
        }
    };
}])

.directive('navBarLeft', [function () {
    return {
        restrict: 'C',
        template: '<button class="button button-icon button-clear button-balance ion-navicon" menu-toggle="left"></button>',
    }
}])

.directive('navBarRight', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'C',
        template: '<button class="button">{{textBtn}}</button>',
        link: function (scope, ele, attrs) {
            scope.$watch('login_data.state', function (v) {
                if (v == 'none') {
                    scope.textBtn = '登录';
                } else if (v == 'success') {
                    scope.textBtn = $rootScope.login_data.bid;
                }
            });
            ele[0].onclick = function (e) {
                $rootScope.$state.go('app.userinfo');
            }
        }
    }
}])
