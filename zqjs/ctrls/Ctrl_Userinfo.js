angular.module('starter.controllers').controller('UserinfoCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicPopup', '$ionicHistory', '$interval', '$timeout',
    function($rootScope, $scope, $ionicLoading, $ionicPopup, $ionicHistory, $interval, $timeout) {

        var stop_settlementconfirm = null;
        var scope_user_name = '';

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
                for (var k in DM.datas.notify) {
                    var noty = DM.datas.notify[k]
                    if (noty.code === 3) {
                        $rootScope.login_data.error_msg = noty.content;
                        $interval.cancel(stop);
                        $timeout.cancel(stopTimeout);
                        $ionicLoading.hide(function(){
                            DM.datas.notify = {};
                        })
                    }
                }
                
                if (DM.datas.trade && DM.datas.trade[user_name] && DM.datas.trade[user_name].session
                    && DM.datas.trade[user_name].session.user_id == user_name
                ){
                    $interval.cancel(stop);
                    scope_user_name = user_name;
                    $ionicLoading.hide().then(function() {
                        stop_settlementconfirm = $interval(function(){
                            var hasSettlementConfirm = false;
                            // 处理 success.settlementconfirm
                            for (var k in DM.datas.notify) {
                                var noty = DM.datas.notify[k];
                                if (noty.type === 'SETTLEMENT') {
                                    hasSettlementConfirm = true;
                                    $scope.settlement_confirm(noty['content']);
                                    $interval.cancel(stop_settlementconfirm);
                                }
                            }
                            if (!hasSettlementConfirm) {
                                $rootScope.login_data.state = 'success';
                                $rootScope.login_data.error_msg = '';
                                DM.update_data({
                                    account_id: user_name
                                });
                            }
                        }, 500);
                        $timeout(function(){
                            $interval.cancel(stop_settlementconfirm);
                        }, 60000);
                        DM.datas.notify = {}; 
                    });
                    $timeout.cancel(stopTimeout);
                }
            }, 100);
        }

        $scope.settlement_confirm = function (template) {
            var myPopup = $ionicPopup.show({
                template: '<pre>' + template + '</pre>',
                title: '交易结算单',
                cssClass: 'settlement_confirm',
                scope: $scope,
                buttons: [ {
                    text: '<b>确认</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $rootScope.login_data.state = 'success';
                        $rootScope.login_data.error_msg = '';
                        DM.update_data({
                            account_id: scope_user_name
                        });
                        return true;
                    }
                }]
            });
    
            myPopup.then(function (r) {
                if (r) {
                    TR_WS.send({
                        "aid": "confirm_settlement"
                    });
                }
            });
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
                var stop = $interval(function() {
                    if (DM.datas.brokers) {
                        $scope.brokers = DM.datas.brokers;
                        $interval.cancel(stop);
                    }
                }, 200);
            } else {
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
