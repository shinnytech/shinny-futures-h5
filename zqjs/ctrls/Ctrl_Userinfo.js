angular.module('starter.controllers').controller('UserinfoCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicHistory', '$interval', '$timeout',
    function($rootScope, $scope, $ionicLoading, $ionicHistory, $interval, $timeout) {

        $scope.do_login = function(bid, user_name, password) {
            TR_WS.send({
                "aid": "req_login",
                "bid": bid,
                "user_name": user_name,
                "password": password
            });

            DM.datas.notify = {};

            var stopTimeout = $timeout(function(){
                if (!DM.datas.trade || !DM.datas.trade[user_name] || !DM.datas.trade[user_name].session){
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.state = 'none';
                        $rootScope.login_data.error_msg = '等待回应超时，可能的原因 (1)服务器正在运维，(2)网络不通，无法连接服务器，请稍后/检查网络后重试。';
                    });
                }
                $timeout.cancel(stopTimeout);
            }, 10000);

            var stop = $interval(function() {
                if (DM.datas.trade && DM.datas.trade[user_name] && DM.datas.trade[user_name].session
                    && DM.datas.trade[user_name].session.user_id == user_name
                ){
                    DM.update_data({
                        account_id: user_name
                    });
                    $interval.cancel(stop);
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.state = 'success';
                        $rootScope.login_data.error_msg = '';
                    });
                    $timeout.cancel(stopTimeout);
                }
            }, 100);
        }


        $scope.click_login = function() {
            $ionicLoading.show({
                template: '登录中...'
            }).then(function() {
                var bid = $rootScope.login_data.bid;
                var user_name = $rootScope.login_data.user_name;
                var password = $rootScope.login_data.password;
                if (bid == undefined) {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.error_msg = "请选择期货公司";
                    });
                    return;
                } else if (user_name == undefined) {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.error_msg  = "请输入期货账号";
                    });
                    return;
                } else if (password == undefined) {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.error_msg = "请输入密码";
                    });
                    return;
                }
                localStorage.setItem('bid', $rootScope.login_data.bid);
                localStorage.setItem('user_name', $rootScope.login_data.user_name);
                $scope.do_login(bid, user_name, password);
            });
        }

        $scope.$on("$ionicView.afterEnter", function(event, data) {
            DM.update_data({
                'state': {
                    page: 'userinfo'
                }
            });
            if(!$scope.brokers || $scope.brokers.length === 0){
                $scope.brokers = DM.datas.brokers;
            }
        });

        // 返回上一页
        $scope.goBack = function() {
            if($ionicHistory.backView() === null) {
                $rootScope.$state.go('app.quote');
            } else {
                $ionicHistory.goBack();
            }
        };
    }
]);
