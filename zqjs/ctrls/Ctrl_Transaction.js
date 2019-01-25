angular.module('starter.controllers').controller('TransactionCtrl',
	['$rootScope', '$scope',
	function ($rootScope, $scope) {
        $scope.transfers = {};
        $scope.filter = {
        	type: 'all'
		}
		$scope.$on("$ionicView.afterEnter", function (event, data) {
			tqsdk.update_data({'state':{
				page: 'moneyhistory'
			}});
			if($rootScope.login_data.state !== "success"){
				Toast.alert('用户登录后可查看转账记录！')
				return;
			}
			$scope.transfers = tqsdk.get_by_path('trade/'+ tqsdk.get_account_id() +'/transfers');
		});
	}]);
