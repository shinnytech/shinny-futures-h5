angular.module('starter.controllers').controller('UserinfoCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicHistory', 'LoginService', '$interval', '$http',
    function($rootScope, $scope, $ionicLoading, $ionicHistory, LoginService, $interval, $http) {
        $scope.content = {
            title: '上期技术'
        }
        // $scope.setContent = function() {
        //     if ($rootScope.login_states.type == 'sim') {
        //         $scope.content.title = '上期技术';
        //     } else if ($rootScope.login_states.type == 'act') {
        //         $scope.content.title = '实盘';
        //     } else {
        //         $scope.content.title = '未登录';
        //     }
        // }
        // $scope.$watch('login_states.type', function(t) {
        //     $scope.setContent();
        // });

        $scope.do_login = function(account_id, password) {

            TR_WS.send({
                "aid": "req_login",
                "bid": "S上期技术",
                "user_name": account_id,
                "password": password
            });

            var stop = $interval(function() {
                var login_success = false;
                var login_connect_trade_front = false;
                var length = 0;
                if ( DM.datas.notify ){
                    for(var n in DM.datas.notify){
                        length ++;
                        var notify = DM.datas.notify[n];
                        if(notify.content === '已经连接到交易前置' ) login_connect_trade_front = true;
                        else if(notify.content === '登录成功' ) login_success = true;
                    }
                } 
                if( length >= 2 && login_connect_trade_front && login_success) {
                    DM.datas.account_id = account_id;
                    $interval.cancel(stop);
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_states.type = $rootScope.login_params.type;
                        $rootScope.login_error = false;
                        $rootScope.login_error_msg = "";
                    });
                    $ionicHistory.goBack();
                } else if( length >= 2 ) {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_states.type = 'none';
                        $rootScope.login_error = true;
                        $rootScope.login_error_msg = login_connect_trade_front ? '登录失败，请检查密码。' : '连接交易前置失败，请检查网络。';
                    });
                    $interval.cancel(stop);
                }
            }, 100);
        }

        $scope.do_resetPassword = function(mobile, broker_id){
            LoginService.do_http_resetPassword({
                "mobile": mobile,
                "broker_id": broker_id
            }).then(function(response){
                $ionicLoading.hide().then(function() {
                    navigator.notification.alert(
                        '已重置密码，请查收短信后重新登录。', // message
                        function () {
                            return false;
                        }, // callback
                        '提示', // title
                        '确定' // buttonName
                    );
                });
            },
            function(response){
                $ionicLoading.hide().then(function() {
                    navigator.notification.alert(
                        '请再试一次重置密码，查收短信后重新登录。', // message
                        function () {
                            return false;
                        }, // callback
                        '提示', // title
                        '确定' // buttonName
                    );
                });
            });
        }

        $scope.reset_pwd = function() {
            $ionicLoading.show({
                template: '重置密码...'
            }).then(function() {
                var account_id = '';
                if ($rootScope.login_params.type == 'sim') {
                    account_id = $rootScope.login_states.mobile;
                    localStorage.setItem('mobile', $rootScope.login_states.mobile);
                    if (account_id == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入账号";
                        });
                        return;
                    } 
                    $scope.do_resetPassword(account_id, 'sim');
                    
                } else if ($rootScope.login_params.type == 'act') {
                    account_id = $rootScope.login_states.account;
                    if (account_id == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入实盘账户";
                        });
                        return;
                    }
                    $scope.do_resetPassword(account_id, '');
                }
            });
        }

        $scope.click_login = function() {
            $ionicLoading.show({
                template: '登录中...'
            }).then(function() {
                console.log("The loading indicator is now displayed");
                var account_id = '';
                var password = '';
                if ($rootScope.login_params.type == 'sim') {
                    account_id = $rootScope.login_states.mobile;
                    password = $rootScope.login_states.sim_password;


                    if (account_id == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入手机号";
                        });
                        return;
                    } else if (password == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入密码";
                        });
                        return;
                    }
                    localStorage.setItem('mobile', $rootScope.login_states.mobile);

                } else if ($rootScope.login_params.type == 'act') {
                    account_id = $rootScope.login_states.account;
                    password = $rootScope.login_states.act_password;
                    if (account_id == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入实盘账户";
                        });
                        return;
                    } else if (password == undefined) {
                        $ionicLoading.hide().then(function() {
                            $rootScope.login_error = true;
                            $rootScope.login_error_msg = "请输入密码";
                        });
                        return;
                    }
                }
                $scope.do_login(account_id, password);
            });
        }

        $scope.$on("$ionicView.afterEnter", function(event, data) {
            DM.update_data({
                'state': {
                    page: 'userinfo'
                }
            });
        });

        $scope.open_account = function() {
            // 东方期货 0127  浏览器&registerWay=2
            if ($rootScope.login_states.type == "sim") {
                var m = $rootScope.login_states.mobile;
                window.location.href = 'https://appficaos.cfmmc.com/indexnew?brokerId=0127&openType=9&checkBrokerIdFlag=false&mobile=' + m;
            } else {
                $rootScope.registerModal.show();
            }
        }

        // 返回上一页
        $scope.goBack = function() {
            $rootScope.login_history = true;
            $ionicHistory.goBack();
        };
    }
]);
