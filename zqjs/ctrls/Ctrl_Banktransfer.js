angular.module('starter.controllers').controller('BanktransferCtrl', ['$rootScope', '$scope', 'QueryService', '$ionicLoading',
    function ($rootScope, $scope, QueryService, $ionicLoading) {
        $scope.banklist = [];
        $scope.bank_id = '';
        $scope.bank_balance = null;
        $scope.future_balance = null;

        $scope.query = {};
        $scope.query.bank_pass = '';
        $scope.query.transfer_amount = 0;

        $scope.checkAct = function () {
            if ($rootScope.login_states.type == "sim" || $rootScope.login_states.type == "none") {
                $scope.banklist = [];
                $scope.bank_id = '';
                $scope.bank_balance = null;
                $scope.future_balance = null;
                navigator.notification.alert(
                    '实盘登录用户才能使用银期转账功能！', // message
                    function () {
                        return false;
                    }, // callback
                    '提示', // title
                    '确定' // buttonName
                );
                return false;
            } else {
                return true;
            }
        }

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            DM.update_data({
                'state': {
                    page: 'banktransfer'
                }
            });

            if (!$scope.checkAct()) {
                return;
            }

            QueryService.bank_account()
                .then(function (response) {
                    console.log(response.data.banklist);
                    $scope.banklist = response.data.banklist;
                    if ($scope.banklist.length == 0) {
                        navigator.notification.alert(
                            '没有签约银行信息', // message
                            function () {
                                QueryService.future_balance()
                                    .then(function (response) {
                                        $scope.future_balance = response.data.withdrawquota;

                                    }, function (response) {
                                        navigator.notification.alert(
                                            '查询期货可取余额失败 [' + response.status + ']', // message
                                            function () {
                                                return;
                                            }, // callback
                                            '查询失败', // title
                                            '确定' // buttonName
                                        );
                                    });
                                return;
                            }, // callback
                            '查询失败', // title
                            '确定' // buttonName
                        );
                    }

                }, function (response) {
                    navigator.notification.alert(
                        '查询签约银行失败 [' + response.status + ']', // message
                        function () {
                            return;
                        }, // callback
                        '查询失败', // title
                        '确定' // buttonName
                    );
                });
        });

        $scope.getBankId = function () {
            var x = document.getElementById("bank_list").selectedIndex;
            var y = document.getElementById("bank_list").getElementsByTagName("option");
            if (y[x]) {
                return y[x].id;
            } else {
                navigator.notification.alert(
                    '未选择银行卡', // message
                    function () {
                        return;
                    }, // callback
                    '查询失败', // title
                    '确定' // buttonName
                );
                return false;
            }

        }

        $scope.query = function (type) {
            if (!$scope.checkAct()) {
                return;
            }

            $ionicLoading.show({
                hideOnStateChange: true,
            });
            if (type == 'BANK') {
                $scope.bank_id = $scope.getBankId();
                if (!$scope.bank_id) {
                    return;
                }
                $scope.query.bank_pass = $scope.query.bank_pass ? $scope.query.bank_pass : '';

                QueryService.bank_balance($scope.bank_id, $scope.query.bank_pass)
                    .then(function (response) {
                        $scope.bank_balance = Math.max(response.data.bank_fetchamount, response.data.bank_useamount);
                        $ionicLoading.hide();
                    }, function (response) {
                        navigator.notification.alert(
                            '查询银行余额失败 [' + response.message + ']', // message
                            function () {
                                return;
                            }, // callback
                            '查询失败', // title
                            '确定' // buttonName
                        );
                        $ionicLoading.hide();
                    });
            } else if (type == 'FUTURE') {
                QueryService.future_balance()
                    .then(function (response) {
                        $scope.future_balance = response.data.withdrawquota;
                        $ionicLoading.hide();
                    }, function (response) {
                        navigator.notification.alert(
                            '查询期货余额失败 [' + response.status + ']', // message
                            function () {
                                return;
                            }, // callback
                            '查询失败', // title
                            '确定' // buttonName
                        );
                        $ionicLoading.hide();
                    });
            }

        }

        $scope.transfer = function (dir) {
            if (!$scope.checkAct()) {
                return;
            }

            $scope.bank_id = $scope.getBankId();
            if (!$scope.bank_id) {
                return;
            }
            console.log($scope.query.transfer_amount, dir)
            if ($scope.query.transfer_amount > 0) {
                var amount = $scope.query.transfer_amount;
                if (dir == "IN") {

                } else if (dir == "OUT") {
                    amount = 0 - amount;
                }

                WS.send({
                    aid: "req_transfer_money", // 下单请求
                    req_id: WS.getReqid(),
                    balance_add: amount,
                    bank_id: $scope.bank_id,
                    bank_password: $scope.query.bank_pass ? $scope.query.bank_pass : '',
                });

            } else {
                navigator.notification.alert(
                    '请输入转账金额', // message
                    function () {
                        return;
                    }, // callback
                    '提示', // title
                    '确定' // buttonName
                );
            }
        }


    }
])
