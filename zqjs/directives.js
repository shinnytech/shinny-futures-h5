angular.module('starter')

.directive('tableAddon', [function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            var table_qt_rc = document.createElement('table');
            table_qt_rc.className = "quote qt_rc";
            table_qt_rc.innerHTML = '<thead> <tr class="odd"> <td>合约代码</td> </tr> <tr class="even"> <td>合约名称</td> </tr> </thead>';

            var div_qt_rwrapper = document.createElement('div');
            div_qt_rwrapper.className = "qt_rwrapper";
            var temp = '<table class="quote qt_r"> <thead> <tr class="odd"> <td>合约代码</td>';
            for (var i = 0; i < CONST.inslist_cols_odd_name.length; i++) {
                temp += '<td>' + CONST.inslist_cols_odd_name[i] + '</td>';
            }
            temp += '</tr> <tr class="even"> <td>合约名称</td>';
            for (var i = 0; i < CONST.inslist_cols_even_name.length; i++) {
                temp += '<td>' + CONST.inslist_cols_even_name[i] + '</td>';
            }
            temp += '</tr> </thead> <tbody> </tbody></table>';

            div_qt_rwrapper.innerHTML = temp;

            var div_qt_cwrapper = document.createElement('div');
            div_qt_cwrapper.className = "qt_cwrapper";
            div_qt_cwrapper.innerHTML = '<table class="quote qt_c"> <thead> <tr class="odd"> <td>合约代码</td> </tr> <tr class="even"> <td>合约名称</td></tr> </thead> <tbody> </tbody></table>';
            ele[0].appendChild(table_qt_rc);
            ele[0].appendChild(div_qt_rwrapper);
            ele[0].appendChild(div_qt_cwrapper);
        }
    }
}])

.directive('tableAddonOdd', [function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            var temp = ' <td>合约代码</td>';
            for (var i = 0; i < CONST.inslist_cols_odd_name.length; i++) {
                temp += '<td>' + CONST.inslist_cols_odd_name[i] + '</td>';
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
            for (var i = 0; i < CONST.inslist_cols_even_name.length; i++) {
                temp += '<td>' + CONST.inslist_cols_even_name[i] + '</td>';
            }
            ele[0].innerHTML = temp;
        }
    }
}])

.directive('bgOpacity', [function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.opacity = attrs.bgOpacity;
            div.style.backgroundColor = '#333';
            div.style.willChange = 'transform';

            var c = ele[0].querySelector('.scroll');
            ele[0].insertBefore(div, c);
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
            scope.$watch('login_states.type', function (v) {
                if (v == 'sim') {
                    scope.textBtn = '模拟';
                } else if (v == 'act') {
                    scope.textBtn = '实盘';
                } else {
                    scope.textBtn = '登录';
                }
            });
            ele[0].onclick = function (e) {
                $rootScope.$state.go('app.userinfo');
            }
        }
    }
}])
