angular.module('starter.controllers').controller('PositionCtrl', ['$rootScope', '$scope', '$ionicHistory', '$timeout', 'LoginService',
    function($rootScope, $scope, $ionicHistory, $timeout, LoginService) {
        // positions orders 
        $scope.panel = {
            type: ''
        }

        $scope.switchType = function(c, p) {
            $scope[c].type = p;
            $timeout(function() {
                DM.update_data({
                    'state': {
                        page: 'positions',
                        'subpage': p
                    }
                });
            }, 200);
        }

        $scope.$on("$ionicView.afterEnter", function(event, data) {
            // console.log(LoginService.is_login_server());
            if (LoginService.is_login_server()) {
                // 已经登录服务器了
                $rootScope.login_states.type = localStorage.getItem('broker_id');
                var ins_list = [];
                if(DM.datas.positions){
                    for(var key in DM.datas.positions){
                        var ins_id = DM.datas.positions[key].instrument_id;
                        ins_list.push(ins_id);
                    }
                }

                var cus_ins_list = InstrumentManager.getCustomInsList();
                var main_ins_list = InstrumentManager.getMainInsList();

                ins_list = ins_list.concat(cus_ins_list);
                ins_list = ins_list.concat(main_ins_list);

                WS.send({
                    aid: "subscribe_quote",
                    ins_list: ins_list.join(',')
                });
            } else {
                // 需要重新登录服务器
                if(!$rootScope.login_history ){
                    $rootScope.$state.go('app.userinfo');
                }else{
                    $rootScope.login_history = false;
                }
            }
            $scope.panel = {
                type: 'positions'
            };
            $timeout(function() {
                DM.update_data({
                    'state': {
                        page: 'positions',
                        subpage: $scope.panel.type
                    }
                });
            }, 500);
        });
    }
])