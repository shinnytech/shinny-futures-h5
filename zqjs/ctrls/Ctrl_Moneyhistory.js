Ctrls.controller('MoneyhistoryCtrl',
	['$rootScope', '$scope', '$ionicLoading',
		'LoginService', 'QueryService',
		'datetime','ionicDatePicker',
	function ($rootScope, $scope, $ionicLoading,
	          LoginService, QueryService,
	          datetime, ionicDatePicker) {

		$scope.$on("$ionicView.afterEnter", function (event, data) {
			DM.update_data({'state':{
				page: 'moneyhistory'
			}});

			$scope.enddate = new Date();
			$scope.opendate = new Date();
			$scope.opendate.setDate($scope.opendate.getDate()-10)

			// 默认请求一次
			$scope.query();

		});


		$scope.query = function(){
			$ionicLoading.show({
				hideOnStateChange: true,
			});
			$scope.history = {};

			//  如果没有登录 -> 跳出登录页面?

			if(!LoginService.is_login_server()){
				$rootScope.loginModal.show();
				$ionicLoading.hide();
				return;
			}

			var parser = datetime("yyyyMMdd");
			parser.setDate($scope.opendate);
			var dstart = parser.getText();
			parser.setDate($scope.enddate);
			var dend = parser.getText();

			QueryService.history(dstart, dend)
				.then(function(response){
					$scope.history = response.data.data;
					for(var i=0; i<$scope.history.length; i++){
						$scope.history[i].delta = 0;
						for(var j=0; j<$scope.history[i].actions.length; j++){
							$scope.history[i].delta += $scope.history[i].actions[j].delta;
						}
					}
					$ionicLoading.hide();
				}, function(response) {
					navigator.notification.alert(
						'查询失败 [' + response.status + ']',  // message
						function(){return;},         // callback
						'查询失败',            // title
						'确定'                  // buttonName
					);
					$ionicLoading.hide();
				});
		}

		var ipObj1 = {
			callback: function (val) {  //Mandatory
				if($scope.selectDateModal == 'opendate'){
					$scope.opendate = new Date(val);
				}else if($scope.selectDateModal == 'enddate'){
					$scope.enddate = new Date(val);
				}
				console.log('Return value is : ' + val, new Date(val));
			}
		};


		$scope.openDatePicker = function(type){
			$scope.selectDateModal = type;
			console.log($scope.selectDateModal)
			if($scope.selectDateModal == 'opendate'){
				ipObj1.from = new Date(2012, 8, 1);
				ipObj1.to = $scope.enddate;
			}else if($scope.selectDateModal == 'enddate'){
				ipObj1.from = $scope.opendate;
				ipObj1.to = new Date();
			}

			ionicDatePicker.openDatePicker(ipObj1);
		};

	}])