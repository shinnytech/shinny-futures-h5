angular.module('starter.controllers').controller('MakeorderCtrl', ['$rootScope', '$scope', '$location', '$ionicScrollDelegate', '$interval', '$ionicHistory', '$ionicLoading', 'LoginService',
    function($rootScope, $scope, $location, $ionicScrollDelegate, $interval, $ionicHistory, $ionicLoading, LoginService) {
        $scope.ins_id = DM.datas.state.detail_ins_id;
        $scope.pos_id = DM.datas.state.detail_pos_id;

        $scope.fixed = DM.datas.quotes[$scope.ins_id].price_decs; // 显示价格要保留的小数位数

        $scope.order = {
            price: DM.datas.quotes[$scope.ins_id].last_price,
            hands: 1
        };

        $scope.estimate = {
            cost: 10,
            profit: 10,
            free: 10
        }

        var stop;

        var getIndexOfPos = function(new_pos_id) {
            var pos_divs = document.querySelectorAll('.makeorder .pos-group .pos-block');
            for (var i = 0; i < pos_divs.length; i++) {
                if (new_pos_id == pos_divs[i].getAttribute('data-id')) {
                    return i;
                }
            }
        };
        // 检查现在选中的持仓是否有变化
        $scope.checkCurrentPosition = function() {
            if (angular.isDefined(stop)) return;
            stop = $interval(function() {
                var new_pos_id = DM.datas.state.detail_pos_id;
                if (new_pos_id != $scope.pos_id) {
                    if ($scope.pos_id == 'new') {
                        // 原来选中新持仓 后来选中别的持仓 该持仓又不在可是范围内 把持仓移动到可是范围内
                        $scope.moveToView(new_pos_id);
                    }
                    $scope.pos_id = new_pos_id;
                    if ($scope.pos_id == 'new') {
                        $scope.pos_direction = '';
                    } else {
                        $scope.pos_direction = DM.datas.positions[$scope.pos_id].direction;
                    }
                    $scope.calEstimate();
                }
            }, 100);
        };
        $scope.stopCheckCurrentPosition = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.$on('$destroy', function() {
            $scope.stopCheckCurrentPosition();
        });

        $scope.$on("$ionicView.beforeEnter", function(event, data) {
            $scope.insObj = InstrumentManager.getInstrumentById($scope.ins_id);
        });
        $scope.$on("$ionicView.afterEnter", function(event, data) {

            DM.update_data({
                'state': {
                    page: 'makeorder'
                }
            });
            $scope.ins_id = DM.datas.state.detail_ins_id;

            $scope.ins_name = $scope.insObj.simple_name;
            $scope.pos_id = DM.datas.state.detail_pos_id;
            if ($scope.pos_id == 'new') {
                $scope.pos_direction = '';
            } else {
                $scope.pos_direction = DM.datas.positions[$scope.pos_id].direction;
            }
            $scope.calEstimate();
            $scope.checkCurrentPosition();

            $scope.moveToView($scope.pos_id);

        });

        $scope.moveToView = function(posid) {
            // 判断该持仓是否在可是范围内
            var scrollViewPosition = $ionicScrollDelegate.$getByHandle('positionsHandle').getScrollPosition();
            var scrollView = $ionicScrollDelegate.$getByHandle('positionsHandle').getScrollView();
            var left = scrollViewPosition.left;
            var index = getIndexOfPos(posid);
            if ((index * 100 - left) > scrollView.__clientWidth) {
                // 把持仓移动到可是范围内
                var targetLeft = (index + 1) * 100 - scrollView.__clientWidth;
                $ionicScrollDelegate.$getByHandle('positionsHandle').scrollTo(targetLeft, 0);
            }
        }


        $scope.changePrice = function(opt) {
            // TODO 换成合约服务
            // var priceTick = DM.datas.quotes[$scope.ins_id].price_tick;
            var priceTick = $scope.insObj.price_tick - 0;
            var ins = DM.datas.quotes[$scope.ins_id];

            switch ($scope.order.price) {
                case '排队价':
                    $scope.order.price = $scope.pos_direction == 'SELL' ? ins.ask_price1 : ins.bid_price1;
                    break;
                case '对手价':
                    $scope.order.price = $scope.pos_direction == 'SELL' ? ins.bid_price1 : ins.ask_price1;
                    break;
                case '涨停价':
                    $scope.order.price = ins.upper_limit;
                    break;
                case '跌停价':
                    $scope.order.price = ins.lower_limit;
                    break;
                default:
                    break;
            }

            $scope.order.price -= 0;
            if (opt == 'minus') {
                $scope.order.price -= priceTick;
            } else if (opt == 'plus') {
                $scope.order.price += priceTick;
            }
        }
        $scope.changeHands = function(opt) {
            if (opt == 'minus') {
                $scope.order.hands > 0 ? $scope.order.hands -= 1 : '';
            } else if (opt == 'plus') {
                $scope.order.hands += 1;
            }
        };

        $scope.$watch('order.price', function() {
            $scope.calEstimate();
        });

        $scope.$watch('order.hands', function() {
            $scope.calEstimate();
        });

        // 计算相应的 预计成本、预计获利、释放资金
        $scope.calEstimate = function() {
            var margin_rate_by_money = DM.datas.quotes[$scope.ins_id].margin_rate_by_money; //每手保证金率，按合约价值算
            var margin_rate_by_volume = DM.datas.quotes[$scope.ins_id].margin_rate_by_volume; //每手保证金率，按手数算
            // TODO 换成合约服务
            // var volume_multiple = DM.datas.quotes[$scope.ins_id].volume_multiple; // 合约乘数
            var volume_multiple = $scope.insObj.volume_multiple;
            var open_price = 0;
            var margin = 0;
            var volume = 0;
            if ($scope.pos_id == 'new') {
                open_price = 0;
                margin = 0;
                volume = 0;
                $scope.estimate.profit = 0;
                $scope.estimate.free = 0;
            } else {
                open_price = DM.datas.positions[$scope.pos_id].open_price; //成本价
                margin = DM.datas.positions[$scope.pos_id].margin; //占用资金
                volume = DM.datas.positions[$scope.pos_id].volume; //手数
                var diff_price = $scope.order.price - open_price;
                if ($scope.pos_direction == 'SELL') { diff_price *= -1 };
                $scope.estimate.profit = diff_price * $scope.order.hands * volume_multiple;
                $scope.estimate.free = margin / volume * Math.min(DM.datas.positions[$scope.pos_id].volume, $scope.order.hands);
            }
            $scope.estimate.cost = ($scope.order.price * volume_multiple * margin_rate_by_money + margin_rate_by_volume) * $scope.order.hands;
        }

        // 返回上一页
        $scope.goBack = function() {
            $rootScope.$state.go('app.posdetail');
        };

        // 获取标签上的价格
        $scope.getPrice = function(p) {
            var div = document.querySelector('.makeorder .price-label .' + p);
            var text = div.innerText;
            $scope.order.price = text;
            $scope.calEstimate();
        };

        $scope.insert_order = function(direction) {
            if (!LoginService.is_login_server()) {
                // 未登录 弹出登录页面
                if(!$rootScope.login_history ){
                    $rootScope.$state.go('app.userinfo');
                }else{
                    $rootScope.login_history = false;
                }
                return;
            }
            if ($scope.order.hands == 0) {
                navigator.notification.alert(
                    '手数不能为0呀!',
                    function() {
                        return;
                    },
                    '手数错误',
                    '确定'
                );
                return;
            }
            if ($scope.pos_id != 'new') {
                var already_direction = DM.datas.positions[$scope.pos_id].direction;
                var exchange_id = DM.datas.positions[$scope.pos_id].exchange_id;
                console.log(already_direction, direction);
                if (already_direction == direction) {
                    // 开仓方向和持仓方向一致
                    $scope.send_insert_order(direction, 'OPEN', $scope.order.hands);
                } else {
                    if ($scope.order.hands > DM.datas.positions[$scope.pos_id].available) {
                        // 检查平仓手数
                        navigator.notification.alert(
                            '平仓手数不足!', // message
                            function() {
                                return;
                            }, // callback
                            '手数不足', // title
                            '确定' // buttonName
                        );
                    } else {
                        // 上期所 区分平今 平昨
                        if (exchange_id == 'SHFE') {
                            var available_today = DM.datas.positions[$scope.pos_id].available_today;
                            var available_yesterday = DM.datas.positions[$scope.pos_id].available_yesterday;
                            if ($scope.order.hands <= available_today) {
                                $scope.send_insert_order(direction, 'CLOSETODAY', $scope.order.hands);
                            } else if ($scope.order.hands <= available_yesterday) {
                                $scope.send_insert_order(direction, 'CLOSE', $scope.order.hands);
                            } else {
                                $scope.send_insert_order(direction, 'CLOSETODAY', available_today);
                                var hands_remain = $scope.order.hands - available_today;
                                $scope.send_insert_order(direction, 'CLOSE', hands_remain);
                            }
                        } else {
                            $scope.send_insert_order(direction, 'CLOSE', $scope.order.hands);
                        }
                    }
                }
            } else {
                $scope.send_insert_order(direction, 'OPEN', $scope.order.hands);
            }
        }

        $scope.send_insert_order = function(direction, offset, hands) {

            var price_type = 'MARKET';
            var price = 0;

            if ($scope.order.price != '市价') {
                price_type = 'LIMIT';
                var ins = DM.datas.quotes[$scope.ins_id];
                switch ($scope.order.price) {
                    case '排队价':
                        price = direction == 'SELL' ? ins.ask_price1 : ins.bid_price1;
                        break;
                    case '对手价':
                        price = direction == 'SELL' ? ins.bid_price1 : ins.ask_price1;
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

            if ($scope.pos_id == 'new') {
                var req_id = WS.getReqid();
                DM.update_data({
                    state: {
                        'req_id': req_id
                    }
                });

                WS.send({
                    aid: "req_insert_order", // 下单请求
                    req_id: req_id,
                    instrument_id: $scope.ins_id,
                    direction: direction,
                    offset: offset, // OPEN | CLOSE | CLOSETODAY
                    volume: hands,
                    price_type: price_type, // 报单类型
                    price: price
                });

            } else {
                WS.send({
                    aid: "req_insert_order", // 下单请求
                    req_id: WS.getReqid(),
                    instrument_id: $scope.ins_id,
                    position_id: $scope.pos_id,
                    direction: direction,
                    offset: offset, // OPEN | CLOSE | CLOSETODAY
                    volume: hands,
                    price_type: price_type, // 报单类型
                    price: price
                });
            }
        }

        $scope.getterSetter = function(newSelected) {
            console.log(newSelected);
        }
    }
])