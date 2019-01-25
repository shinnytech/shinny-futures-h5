angular.module('starter.controllers').controller('UserinfoCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicPopup', '$ionicHistory', '$interval', '$timeout',
    function($rootScope, $scope, $ionicLoading, $ionicPopup, $ionicHistory, $timeout) {
        var is_connected_front_trade = false;
        var is_login_success = false;
        var stopTimeout = null;

        var cache_dom_dataset = {};

        function update_ui () {
            if (!tqsdk.is_logined()) return;
            var account = tqsdk.get_account();
            var container = document.querySelector('.userinfo .account_info');
            if(container && account) {
                for (var i = 0; i < CONST.userinfo_account.length; i++) {
                    var key = CONST.userinfo_account[i];
                    if (!cache_dom_dataset[key]){
                        var dom = container.querySelector('.datacontent.' + key);
                        cache_dom_dataset[key] = dom.dataset;
                    }
                    var val = account[key];
                    if(typeof val === 'number' && !Number.isInteger(val) && !Number.isNaN(val)){
                        val = val.toFixed(2);
                    }
                    cache_dom_dataset[key]['content'] = val;
                }
                // trading_day
                if (!cache_dom_dataset['trading_day']){
                    var dom = container.querySelector('.trading_day');
                    cache_dom_dataset['trading_day'] = dom.dataset;
                }
                var trading_day = tqsdk.get_trading_day("trade/"  + tqsdk.get_account_id()  + "/session/trading_day");
                cache_dom_dataset['trading_day']['content'] = trading_day;
            }
        }

        function on_data(){
            if ((is_connected_front_trade && is_login_success) || tqsdk.is_logined()) {
                $rootScope.login_data.state = 'success';
                $rootScope.login_data.error_msg = '';
                $ionicLoading.hide();
                if (stopTimeout) {
                    $timeout.cancel(stopTimeout);
                    stopTimeout = null;
                }
            }
            if (tqsdk.is_logined()) update_ui();
        }

        tqsdk.on('notify', function(notify){
            if(notify.level === 'INFO'){
                if (notify.type === 'MESSAGE') Toast.message(notify.content);
                else if (notify.type === 'SETTLEMENT') $rootScope.settlement_confirm(notify['content']);
            } else if(notify.level === 'WARNING' || notify.level === 'ERROR'){
                Toast.alert(notify.content);
            } 
            if (notify.code === 3) {
                is_login_success = false;
                $rootScope.login_data.error_msg = notify.content;
                $ionicLoading.hide();
            } else if (notify.content === '已经连接到交易前置') {
                is_connected_front_trade = true
            } else if (notify.content === '登录成功') {
                is_login_success = true
            }
        })


        // stop_settlementconfirm = $interval(function(){
        //     var hasSettlementConfirm = false;
        //     // 处理 success.settlementconfirm
        //     for (var k in DM.datas.notify) {
        //         var noty = DM.datas.notify[k];
        //         if (noty.type === 'SETTLEMENT') {
        //             hasSettlementConfirm = true;
        //             $rootScope.settlement_confirm(noty['content']);
        //             $interval.cancel(stop_settlementconfirm);
        //         }
        //     }
        //     if (!hasSettlementConfirm) {
        //         $rootScope.login_data.state = 'success';
        //         $rootScope.login_data.error_msg = '';
        //         DM.update_data({
        //             account_id: user_name
        //         });
        //     }
        // }, 500);
        // $timeout(function(){

        $scope.do_login = function(bid, user_name, password) {
            tqsdk.login({
                "bid": bid,
                "user_id": user_name,
                "password": password
            })

            stopTimeout = $timeout(function(){
                var trading_day = tqsdk.get_trading_day();
                if (!trading_day){
                    $ionicLoading.hide().then(function() {
                        $rootScope.login_data.state = 'none';
                        $rootScope.login_data.error_msg = '等待回应超时，可能的原因 (1)服务器正在运维，(2)网络不通，无法连接服务器，请稍后/检查网络后重试。';
                    });
                }
                $timeout.cancel(stopTimeout);
                stopTimeout = null;
            }, 10000);
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
            tqsdk.update_data({
                'state': {
                    'page': 'userinfo'
                }
            })
            tqsdk.on('rtn_brokers', function (brokers) {
                $scope.brokers = brokers;
            });
            tqsdk.on('rtn_data', on_data);
        });
       
        $scope.$on('$ionicView.afterLeave', function() {
            tqsdk.off('rtn_data', on_data)
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
