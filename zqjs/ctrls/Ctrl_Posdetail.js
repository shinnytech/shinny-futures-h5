angular.module('starter.controllers').controller('PosdetailCtrl', ['$rootScope', '$scope', '$ionicPopover', '$ionicNavBarDelegate', '$interval', '$ionicHistory', '$ionicPopup', '$ionicLoading', 'LoginService',
    function ($rootScope, $scope, $ionicPopover, $ionicNavBarDelegate, $interval, $ionicHistory, $ionicPopup, $ionicLoading, LoginService) {

        $scope.ins_id = DM.datas.state.detail_ins_id;
        $scope.pos_id = DM.datas.state.detail_pos_id;

        $scope.order = {
            price: DM.datas.quotes[$scope.ins_id].last_price,
            volume: 1
        }

        // 选择合约的数据集
        $scope.insList = {};
        $scope.insList.array = [];
        $scope.insList.selected = $scope.ins_id;

        $scope.msg = {
            text: ''
        }

        $scope.seconds = 5 * 60;

        // TODAY D1 H1 M5
        $scope.chart = {
            type: 'M5'
        }

        // info discuss plan tools
        $scope.panel = {
            type: 'info'
        }

        // c : ['chart'|'panel']
        // p : ['TODAY'|'D1'|'H1'|'M5'] | ['info'|'discuss'|'plan'|'plan_2'|'tools']
        $scope.switchType = function (c, p) {
            $scope[c].type = p;
            if (c == 'panel') {
                DM.update_data({
                    state: {
                        subpage: p,
                    }
                });
            } else {
                $scope.seconds = 0;
                switch (p) {
                case 'TODAY':
                    $scope.seconds = 24 * 60 * 60;
                    $scope.sendChart();
                    break;
                case 'D1':
                    $scope.seconds = 24 * 60 * 60;
                    $scope.sendKChart();
                    break;
                case 'H1':
                    $scope.seconds = 60 * 60;
                    $scope.sendKChart();
                    break;
                case 'M5':
                    $scope.seconds = 5 * 60;
                    $scope.sendKChart();
                    break;
                }
            }
        }

        // 日内图
        $scope.sendChart = function () {
            var secondsToNano = Math.pow(10, 9);
            DM.update_data({
                state: {
                    chart_id: "chart_day",
                    chart_interval: 2 * 60 * secondsToNano
                }
            });
            WS.send({
                aid: "set_chart", // 请求K线
                chart_id: "chart_day",
                ins_list: $scope.ins_id,
                duration: 2 * 60 * secondsToNano, // 一个柱子表示的周期长度
                trading_day_start: 0, // 0 表示当前交易日
                trading_day_count: $scope.seconds * secondsToNano // 请求交易日 1 天
            });
        }

        // K 线图
        $scope.sendKChart = function () {
            var secondsToNano = Math.pow(10, 9);
            DM.update_data({
                state: {
                    chart_id: "chart_kline",
                    chart_interval: $scope.seconds * secondsToNano
                }
            });
            var view_width = 500;
            WS.send({
                aid: "set_chart", // 请求 K 线
                chart_id: "chart_kline",
                ins_list: $scope.ins_id,
                duration: $scope.seconds * secondsToNano,
                view_width: view_width
            });
        }

        $scope.setting = {
            'showPositions': true,
            'showOrders': true,
            'showAvgline': true,
        };

        function updateState() {
            if ($scope.setting.showPositions) {
                DM.update_data({
                    state: {
                        showPositions: true
                    }
                });
            } else {
                DM.update_data({
                    state: {
                        showPositions: false
                    }
                });
            }

            if ($scope.setting.showOrders) {
                DM.update_data({
                    state: {
                        showOrders: true
                    }
                });
            } else {
                DM.update_data({
                    state: {
                        showOrders: false
                    }
                });
            }

        }

        $scope.$watch('setting.showPositions', function () {
            updateState()
        });

        $scope.$watch('setting.showOrders', function () {
            updateState()
        });

        $scope.$watch('setting.showAvgline', function () {
            console.log('showAvgline: ', $scope.setting.showAvgline);
        });

        // .fromTemplateUrl() method
        $scope.popover = $ionicPopover.fromTemplateUrl('chart-popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.popover_other_pos = $ionicPopover.fromTemplateUrl('other-pos-popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover_other_pos = popover;
        });

        $scope.openPopover = function (type) {
            if (type == 'choose_other_pos') {
                $scope.popover_other_pos.show();
            } else if (type == 'setting') {
                $scope.popover.show();
            }
        };

        $scope.closePopover = function (t) {
            if (t == 'choose_other_pos') {
                $scope.ins_id = $scope.insList.selected;
                var pos_list = DM.datas.quotes[$scope.ins_id].pos_list;
                if (pos_list) {
                    $scope.pos_id = pos_list.split(',')[0];
                    DM.update_data({
                        state: {
                            detail_ins_id: $scope.ins_id,
                            detail_pos_id: $scope.pos_id
                        }
                    });
                } else {
                    $scope.pos_id = 'new';
                    DM.update_data({
                        state: {
                            detail_ins_id: $scope.ins_id,
                            detail_pos_id: "new"
                        }
                    });
                }
            }
            $scope.popover_other_pos.hide();
            $scope.popover.hide();
        };

        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
        $scope.history = '';
        $scope.goBack = function () {
            $rootScope.$state.go($scope.history);
        };

        $scope.$on("$ionicView.beforeEnter", function (event, data) {
            console.log("$ionicView.beforeEnter");
            $scope.ins_id = DM.datas.state.detail_ins_id;
            $scope.pos_id = DM.datas.state.detail_pos_id;
            $scope.insList.selected = $scope.ins_id;
            $scope.order = {
                price: DM.datas.quotes[$scope.ins_id].last_price,
                volume: 1
            }
            // $scope.chart.type = 'M5';
            // $scope.panel.type = 'info';
        });

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            console.log("$ionicView.afterEnter");
            if ($ionicHistory.backView() == null) {
                $scope.history = "app.tabs.position";
            } else if ($ionicHistory.backView().stateName == "app.tabs.position" || $ionicHistory.backView().stateName == "app.tabs.quote") {
                $scope.history = $ionicHistory.backView().stateName;
            }

            DM.update_data({
                state: {
                    page: "posdetail",
                    subpage: 'info',
                    req_id: ""
                }
            });

            // 不同页面跳转 可选的全部合约列表不同
            if ($ionicHistory.backView().stateName == "app.tabs.position") {
                for (var pos in DM.datas.positions) {
                    var ins = DM.datas.positions[pos].instrument_id;
                    if ($scope.insList.array.indexOf(ins) < 0) {
                        $scope.insList.array.push(ins);
                    }
                }

            } else if ($ionicHistory.backView().stateName == "app.tabs.quote") {
                var ins_type = DM.datas.state.ins_type;
                var ins_str = DM.datas[ins_type + "_ins_list"] || '';
                $scope.insList.array = ins_str == '' ? [] : ins_str.split(',');
            }
        });

        $scope.$watch('ins_id', function (newValue) {
            $scope.insObj = window.InstrumentManager.getInstrumentById(newValue);
            $scope.ins_name = $scope.insObj.simple_name; //name.match(re)[2] || '';
            if($scope.chart.type == 'TODAY'){
                $scope.sendChart()
            }else{
                $scope.sendKChart();
            }
            
        });

        $scope.sendMessage = function () {
            console.log($scope.msg.text);
            nim.sendText({
                scene: 'team',
                to: '18182525',
                text: $scope.msg.text,
                done: function (error, msg) {
                    MessageQueue.push(msg);
                    DM.update_data({
                        state: {
                            lastestChatTime: msg.time
                        }
                    });
                }
            });
        }

        $scope.insert_order = function(offset, dir){
            if(!DM.datas.account_id){
                $rootScope.$state.go('app.userinfo');
                return;
            }

            var req_id = DM.datas.session_id + WS.getReqid();
            if(offset === 'CLOSE' && $scope.insObj.exchange_id === 'SHFE'){
                offset = 'CLOSETODAY';
            }
            TR_WS.send({
                aid: "insert_order", // 下单请求
                order_id: req_id,
                exchange_id: $scope.insObj.exchange_id,
                instrument_id: $scope.ins_id,
                direction: dir,
                offset: offset, // OPEN | CLOSE | CLOSETODAY
                volume: $scope.order.volume,
                price_type: "LIMIT", // 报单类型
                limit_price: $scope.order.price
            });
        }
    }
]);
