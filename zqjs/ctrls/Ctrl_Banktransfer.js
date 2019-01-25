angular.module('starter.controllers').controller('BanktransferCtrl',
    ['$rootScope', '$scope',
    function ($rootScope, $scope) {
        $scope.banklist = [];
        $scope.query_error_msg = '';
        $scope.query = {
            bank_id: '', // 银行ID
            bank_password: '', // 银行账户密码
            future_account: '', // 期货账户
            future_password: '', // 期货账户密码
            currency: 'CNY', // 币种代码
            amount: 0 // 转账金额, >0 表示转入期货账户, <0 表示转出期货账户
        }

        $scope.checkAct = function () {
            if ($rootScope.login_data.state !== "success") {
                $scope.banklist = [];
                $scope.query.bank_id = '';
                $scope.query.bank_password = '';
                $scope.query.future_password = '';
                $scope.query.amount = '';
                return false;
            } else {
                return true;
            }
        }

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            tqsdk.update_data({
                'state': {
                    page: 'banktransfer'
                }
            });
            $scope.query_error_msg = '';
            if (!$scope.checkAct()) return;
            // todo:
            $scope.banklist = tqsdk.get_by_path('trade/' + tqsdk.get_account_id() + '/banks');
            $scope.query.future_account = tqsdk.get_account_id();
            var banks_id = Object.keys($scope.banklist);
            $scope.query.bank_id = banks_id.length > 0 ? banks_id[0] : '';
        });

        $scope.transfer = function (dir) {
            $scope.query_error_msg = '';
            if (!$scope.checkAct()){
                $scope.query_error_msg = '用户登录后才能使用银期转账功能！';
                return;
            } else if (!$scope.query.bank_id) {
                $scope.query_error_msg = '请选择银行一个账户！';
                return;
            } else if (!$scope.query.bank_password) {
                $scope.query_error_msg = '请输入银行账户密码！';
                return;
            } else if (!$scope.query.future_password) {
                $scope.query_error_msg = '请输入期货账户密码！';
                return;
            } else if (!$scope.query.amount || $scope.query.amount < 0) {
                $scope.query_error_msg = '请输入转账金额！';
                return;
            }
            $scope.query_error_msg = '';
            var query = Object.assign({aid: "req_transfer"}, $scope.query);
            query.amount = dir == "IN" ? $scope.query.amount : 0 - $scope.query.amount;
            tqsdk.transfer(query)
        }
    }
])
