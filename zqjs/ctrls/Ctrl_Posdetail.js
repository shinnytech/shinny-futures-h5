angular.module('starter.controllers').controller('PosdetailCtrl', ['$rootScope', '$scope', '$ionicScrollDelegate', '$ionicPopover', '$interval', '$ionicHistory', 'numericKeyboardService',
    function ($rootScope, $scope, $ionicScrollDelegate, $ionicPopover, $interval, $ionicHistory, numericKeyboardService) {

        $scope.ins_id = null;
        $scope.position = null;
        $scope.buy_close_avaliable = false;
        $scope.sell_close_avaliable = false;

        $scope.order = {
            price: 0,
            volume: 1
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
        // p : ['TODAY'|'D1'|'H1'|'M5'] | ['info'|'discuss'|'plan'|'tools']
        $scope.switchType = function (c, p) {
            $scope[c].type = p;
            if (c == 'panel') {
                DM.update_data({
                    state: {
                        subpage: p,
                    }
                });
                if(DM.datas.account_id && DM.datas.trade[DM.datas.account_id].positions){
                    $scope.position = DM.datas.trade[DM.datas.account_id].positions[$scope.ins_id];
                    if($scope.position){
                        var volume_long = $scope.position.volume_long_today + $scope.position.volume_long_his;
                        var volume_short = $scope.position.volume_short_today + $scope.position.volume_short_his;
                        $scope.buy_close_avaliable = volume_short > 0 ? true : false;
                        $scope.sell_close_avaliable = volume_long > 0 ? true : false;
                    } else {
                        $scope.buy_close_avaliable = false;
                        $scope.sell_close_avaliable = false;
                    }
                } else {
                    $scope.buy_close_avaliable = false;
                    $scope.sell_close_avaliable = false;
                }
                if(numericKeyboardService.isOpened()) numericKeyboardService.close();
                $ionicScrollDelegate.scrollTop(true);
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

        $scope.$watch('setting.showAvgline', function () {});

        // .fromTemplateUrl() method
        $scope.popover = $ionicPopover.fromTemplateUrl('chart-popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function (type) {
            if (type == 'setting') {
                $scope.popover.show();
            }
        };

        $scope.closePopover = function (t) {
            $scope.popover.hide();
        };

        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });

        $scope.goBack = function () {
            if(numericKeyboardService.isOpened()) numericKeyboardService.close();
            $ionicScrollDelegate.scrollTop(true);
            $ionicHistory.goBack();
        };

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            if(!DM.datas.state.detail_ins_id){
                $rootScope.$state.go('app.quote');
                return;
            }
            $scope.ins_id = DM.datas.state.detail_ins_id;

            $scope.order = {
                price: DM.datas.quotes[$scope.ins_id] ? DM.datas.quotes[$scope.ins_id].last_price : 0,
                volume: 1
            }

            DM.update_data({
                state: {
                    page: "posdetail",
                    subpage: 'info',
                    req_id: ""
                }
            });
            if(InstrumentManager.isCustomIns($scope.ins_id)){
                $scope.btn.text = '删除自选';
            } else {
                $scope.btn.text = '添加自选';
            }
        });

        $scope.btn = {
            text: '',
            toggleCustom: function(){
                if(InstrumentManager.isCustomIns($scope.ins_id)){
                    InstrumentManager.delCustomIns($scope.ins_id);
                    $scope.btn.text = '添加自选';
                    Toast.success('自选合约 已经删除 ' + $scope.ins_id);
                } else {
                    InstrumentManager.addCustomIns($scope.ins_id);
                    $scope.btn.text = '删除自选';
                    Toast.success('自选合约 已经添加 ' + $scope.ins_id);
                }
            }
        };

        $scope.$watch('ins_id', function (newValue) {
            if(newValue){
                $scope.insObj = InstrumentManager.getInstrumentById(newValue);
                $scope.ins_id_show = $scope.insObj.ins_id; //name.match(re)[2] || '';
                $scope.ins_name = $scope.insObj.simple_name; //name.match(re)[2] || '';
                if($scope.chart.type == 'TODAY'){
                    $scope.sendChart()
                }else{
                    $scope.sendKChart();
                }
            }
        });

        $scope.insert_order = function(offset, dir){
            if(!DM.datas.account_id){
                $rootScope.$state.go('app.userinfo');
                return;
            }
            if($scope.insObj.class != 'FUTURE'){
                Toast.alert($scope.ins_name + '  不支持交易！');
                return;
            }

            if($scope.order.volume <= 0){
                navigator.notification.alert(
                    '请输入下单手数！',
                    function() {
                        return;
                    },
                    '手数错误',
                    '确定'
                );
                return;
            }

            // todo
            var price_type = 'ANY';
            var price = 0;

            if ($scope.order.price != '市价') {
                price_type = 'LIMIT';
                var ins = DM.datas.quotes[$scope.ins_id];
                switch ($scope.order.price) {
                    case '排队价':
                        price = dir == 'SELL' ? ins.ask_price1 : ins.bid_price1;
                        break;
                    case '对手价':
                        price = dir == 'SELL' ? ins.bid_price1 : ins.ask_price1;
                        break;
                    case '涨停价':
                        price = ins.upper_limit;
                        break;
                    case '跌停价':
                        price = ins.lower_limit;
                        break;
                    default:
                        price = $scope.order.price;
                        break;
                }
                $scope.order.price = price;
            }

            var req_insert_order = {
                aid: "insert_order", // 下单请求
                exchange_id: $scope.insObj.exchange_id,
                instrument_id: $scope.insObj.ins_id,
                volume_condition: "ANY",
                time_condition: price_type === 'ANY' ? 'IOC' : 'GFD',
                hedge_flag: "SPECULATION",
                user_id: DM.datas.account_id,
                limit_price: Number(price)
            }
            var insert_msg = '确认 '; // 提示用户字符串
            var open = 0; // 开仓手数
            var close = 0; // 平仓手数
            var close_today = 0; // 平今手数

            if(offset === 'OPEN'){
                open = $scope.order.volume;
                insert_msg += (dir === 'BUY' ? '买开' : '卖开');
                insert_msg += open + '手，' + '价格' + $scope.order.price + '？';
            } else if ($scope.position) {
                var close_avaliable = dir === 'BUY' ?
                    $scope.position.volume_short_today + $scope.position.volume_short_his :
                    $scope.position.volume_long_today + $scope.position.volume_long_his;
                close = Math.min(close_avaliable, $scope.order.volume);
                if($scope.insObj.exchange_id === 'SHFE'){
                    close_today = dir === 'BUY' ?
                        ($scope.position.volume_short_today >= close ? close : $scope.position.volume_short_today) :
                        ($scope.position.volume_long_today >= close ? close : $scope.position.volume_long_today);
                    close = dir === 'BUY' ?
                        ($scope.position.volume_short_today >= close ? 0 : close - $scope.position.volume_short_today) :
                        ($scope.position.volume_long_today >= close ? 0 : close - $scope.position.volume_long_today);
                }
                insert_msg += (dir === 'BUY' ? '买平' : '卖平');
                insert_msg += (close + close_today ) + '手，' + '价格' + $scope.order.price + '？';
            } else {
                insert_msg = '无可平仓单！';
            }
            // 提示用户后下单
            navigator.notification.confirm(
                insert_msg,
                function (buttonIndex) {
                    if (buttonIndex == 1) {
                        if(open > 0){
                            TR_WS.send(Object.assign({
                                order_id: WS.getReqid(),
                                direction: dir,
                                offset: "OPEN", // OPEN | CLOSE | CLOSETODAY
                                volume: Number(open),
                                price_type: price_type, // 报单类型
                            }, req_insert_order));
                        }
                        if(close > 0){
                            TR_WS.send(Object.assign({
                                order_id: WS.getReqid(),
                                direction: dir,
                                offset: "CLOSE", // OPEN | CLOSE | CLOSETODAY
                                volume: Number(close),
                                price_type: price_type, // 报单类型
                            }, req_insert_order));
                        }
                        if(close_today > 0){
                            TR_WS.send(Object.assign({
                                order_id: WS.getReqid(),
                                direction: dir,
                                offset: "CLOSETODAY", // OPEN | CLOSE | CLOSETODAY
                                volume: Number(close_today),
                                price_type: price_type, // 报单类型
                            }, req_insert_order));
                        }
                    } else {
                        return;
                    }
                },
                '确认下单',
                ['确认', '取消']
            );
        }

        $scope.open_cb = function() {
            $('ion-content.posdetail').css('top', '-245px');
        }

        $scope.close_cb = function() {
            $('ion-content.posdetail').css('top', '44px');
        }
    }
]);
