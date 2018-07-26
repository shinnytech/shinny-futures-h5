angular.module('starter.controllers').controller('TransactionCtrl', ['$rootScope', '$scope', '$ionicLoading',
    'LoginService', 'QueryService', '$filter',
    'datetime', 'ionicDatePicker',
    function ($rootScope, $scope, $ionicLoading,
        LoginService, QueryService, $filter,
        datetime, ionicDatePicker) {

        // all inout close others
        $scope.filter = {
            type: 'all'
        };

        $scope.all_data = [];
        $scope.show_data = [];

        $scope.filterData = function (p) {
            $scope.filter.type = p;
            switch (p) {
            case 'all':
                $scope.show_data = $scope.all_data;
                break;
            case 'inout':
                $scope.show_data = $filter('toShow')($scope.all_data, 'inout');
                break;
            case 'close':
                $scope.show_data = $filter('toShow')($scope.all_data, 'close');
                break;
            case 'others':
                $scope.show_data = $filter('toShow')($scope.all_data, 'others');
                break;
            }
        };

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            DM.update_data({
                'state': {
                    page: 'transaction'
                }
            });

            $scope.enddate = new Date();
            $scope.opendate = new Date();
            $scope.opendate.setDate($scope.opendate.getDate() - 10)

            // 默认请求一次
            $scope.query();
        });

        $scope.query = function () {
            $ionicLoading.show({
                hideOnStateChange: true,
            });
            $scope.history = {};

            //  如果没有登录 -> 跳出登录页面?

            if (!LoginService.is_login_server()) {
                if(!$rootScope.login_history ){
                    $rootScope.$state.go('app.userinfo');
                }else{
                    $rootScope.login_history = false;
                }
                $ionicLoading.hide();
                return;
            }

            var parser = datetime("yyyyMMdd");
            parser.setDate($scope.opendate);
            var dstart = parser.getText();

            parser.setDate($scope.enddate);
            var dend = parser.getText();

            QueryService.history(dstart, dend)
                .then(function (response) {
                        $scope.all_data = response.data.data;
                        for (var i = 0; i < $scope.all_data.length; i++) {
                            $scope.all_data[i].delta = 0;
                            for (var j = 0; j < $scope.all_data[i].actions.length; j++) {
                                $scope.all_data[i].delta += $scope.all_data[i].actions[j].delta;
                            }
                        }
                        $scope.filterData($scope.filter.type);
                        $ionicLoading.hide();
                    },
                    function (response) {
                        navigator.notification.alert(
                            '查询失败 [' + response.status + ']', // message
                            function () {
                                return;
                            }, // callback
                            '查询失败', // title
                            '确定' // buttonName
                        );
                        $ionicLoading.hide();
                    });
        }

        var ipObj1 = {
            callback: function (val) { //Mandatory
                if ($scope.selectDateModal == 'opendate') {
                    $scope.opendate = new Date(val);
                } else if ($scope.selectDateModal == 'enddate') {
                    $scope.enddate = new Date(val);
                }
                console.log('Return value is : ' + val, new Date(val));
            }
        };

        $scope.openDatePicker = function (type) {

            $scope.selectDateModal = type;
            console.log($scope.selectDateModal)
            if ($scope.selectDateModal == 'opendate') {
                ipObj1.from = new Date(2012, 8, 1);
                ipObj1.to = $scope.enddate;
            } else if ($scope.selectDateModal == 'enddate') {
                ipObj1.from = $scope.opendate;
                ipObj1.to = new Date();
            }
            ionicDatePicker.openDatePicker(ipObj1);
        };

    }
])
