angular.module('starter.controllers').controller('UserinfoCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicHistory', 'LoginService', '$interval', '$http',
    function($rootScope, $scope, $ionicLoading, $ionicHistory, LoginService, $interval, $http) {
        $scope.content = {
            title: '',
            longTitle: ''
        }

        $scope.setContent = function() {
            if ($rootScope.login_states.type == 'sim') {
                $scope.content.title = '模拟';
                $scope.content.longTitle = '正在使用模拟环境';
            } else if ($rootScope.login_states.type == 'act') {
                $scope.content.title = '实盘';
                $scope.content.longTitle = '正在使用实盘环境';
            } else {
                $scope.content.title = '未登录';
                $scope.content.longTitle = '未登录';
            }
        }

        $scope.$watch('login_states.type', function(t) {
            $scope.setContent();
        });

        $scope.do_login = function(account_id, password) {
            LoginService.do_http_login({
                "account_id": account_id,
                "password": password
            }).then(function(response) {
                if (response.status == 200) {
                    var d = response.data;

                    // 重连服务器
                    if (d["broker_id"] == 'sim') {
                        WS.reinit(SETTING.sim_server_url);
                    } else {
                        WS.reinit(SETTING.act_server_url);
                    }

                    // 更新存储数据
                    localStorage.setItem('Shinny-Session', d["Shinny-Session"]);
                    localStorage.setItem('account_id', d["account_id"]);
                    localStorage.setItem('broker_id', d["broker_id"]);
                    localStorage.setItem('expire_time', d["expire_time"]);
                    localStorage.setItem('user_id', d["user_id"]);

                    $http.defaults.headers.common['Shinny-Session'] = localStorage.getItem('Shinny-Session');

                    var stop = $interval(function() {
                        if (DM.datas.session_id && LoginService.is_login_server()) {
                            $interval.cancel(stop);
                            $ionicLoading.hide().then(function() {
                                $rootScope.login_states.type = $rootScope.login_params.type;
                                $rootScope.login_error = false;
                                $rootScope.login_error_msg = "";
                            });
                            $ionicHistory.goBack();
                        } else {
                            if (DM.datas.session_id) {
                                $ionicLoading.hide().then(function() {
                                    $rootScope.login_states.type = 'none';
                                    $rootScope.login_error = true;
                                    $rootScope.login_error_msg = '发生错误 登录交易服务器失败';
                                });
                                $interval.cancel(stop);
                            } else {
                                $rootScope.login_error = true;
                                $rootScope.login_error_msg = '正在登录';
                            }
                        }
                    }, 100);

                } else {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_error = true;
                        $rootScope.login_error_msg = '发生错误  [' + response.status + ']';
                    });

                }
            }, function(response) {
                if (response.status == 403) {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_error = true;
                        $rootScope.login_error_msg = "用户名或密码错误";
                    });
                } else {
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_error = true;
                        $rootScope.login_error_msg = '发生错误  [' + response.status + ']';
                    });
                }
            });
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
                            $rootScope.login_error_msg = "请输入手机号";
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
