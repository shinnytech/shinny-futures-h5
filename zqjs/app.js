angular.module('starter', ['ionic', 'starter.controllers', 'numericKeyboard'])
    .factory("$exceptionHandler",  function() {
        return function (exception, cause) {
            location.href = location.origin;
        };
    })
    .run(['$rootScope', '$state', '$ionicPlatform', '$http',
            function($rootScope, $state, $ionicPlatform, $http) {
                // 1. init http headers
                $http.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
                $http.defaults.headers.common['Accept'] = 'application/json';
                if (localStorage.getItem('Shinny-Session')) {
                    $http.defaults.headers.common['Shinny-Session'] = localStorage.getItem('Shinny-Session');
                }

                // 2. init datamanager - InstrumentManager 已经初始化
                DM.init(draw_app);

                // 全局设置 angularui-router . state
                $rootScope.$state = $state;

                $rootScope.ins_list_types = [
                    {id: 'main', name: '主力合约'},
                    {id: 'custom', name: '自选合约'},
                    {id: 'SHFE', name: '上期所'},
                    {id: 'CZCE', name: '郑商所'},
                    {id: 'INE', name: '上期能源'},
                    {id: 'DCE', name: '大商所'},
                    {id: 'CFFEX', name: '中金所'},
                ];

                $rootScope.insList = {
                    id: 'main',
                    title: '主力合约'
                };

                /**
                 * 登录参数
                 * $rootScope.login_data.bid
                 * $rootScope.login_data.user_name
                 * $rootScope.login_data.password
                 * $rootScope.login_error - 登录是否出错
                 * $rootScope.login_error_msg - 登录错误提示
                 */
                $rootScope.login_data = {
                    state: 'none', //登录状态
                    bid: 'S上期技术',
                    user_name: '022631'
                };
                $rootScope.login_data.user_name = localStorage.getItem('user_name') ? localStorage.getItem('user_name') : '';
                $rootScope.login_data.bid = localStorage.getItem('bid') ? localStorage.getItem('bid') : 'S上期技术';

                $ionicPlatform.ready(function() {
                    if (window.StatusBar) {
                        // org.apache.cordova.statusbar required
                        StatusBar.styleDefault();
                    }
                    WS.init(SETTING.sim_server_url); // 行情websocket
                    TR_WS.init(SETTING.tr_server_url); // 交易websocket
                    document.addEventListener("offline", function() {
                        window.plugins.toast.showWithOptions({
                            message: "请检查网络连接",
                            duration: "long",
                            position: "bottom",
                            addPixelsY: -40
                        });
                    }, false);
                });
            }
        ])

        .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$ionicConfigProvider',
                function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

                    $urlRouterProvider.otherwise('/app/quote');

                    $stateProvider
                        .state('app', {
                            url: '/app',
                            abstract: true,
                            templateUrl: 'menus.html',
                        })
                        // 报价
                        .state('app.quote', {
                            url: '/quote',
                            templateUrl: 'templates/quote.html',
                            controller: 'QuoteCtrl'
                        })
                        /***************************/
                        // 持仓详情
                        .state('app.posdetail', {
                            url: '/posdetail',
                            templateUrl: 'templates/posdetail.html',
                            controller: 'PosdetailCtrl'
                        })
                        // 银期转账
                        .state('app.banktransfer', {
                            url: '/banktransfer',
                            templateUrl: 'templates/banktransfer.html',
                            controller: 'BanktransferCtrl'
                        })
                        .state('app.transaction', {
                            url: '/transaction',
                            templateUrl: 'templates/transaction.html',
                            controller: 'TransactionCtrl'
                        })
                        // 个人信息-登录状态
                        .state('app.userinfo', {
                            url: '/userinfo',
                            templateUrl: 'templates/userinfo.html',
                            controller: 'UserinfoCtrl'
                        });

                    $ionicConfigProvider.views.swipeBackEnabled(false);
                    $ionicConfigProvider.views.transition('none');
                    $ionicConfigProvider.views.forwardCache(true);
                    $ionicConfigProvider.views.maxCache(10);
                    $ionicConfigProvider.navBar.alignTitle('center');

                    // note that you can also chain configs
                    $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-thin-left').previousTitleText(false)

                    $ionicConfigProvider.tabs.style('standard');
                    $ionicConfigProvider.tabs.position('bottom');

                    $httpProvider.interceptors.push(function() {
                        return {
                            'request': function(config) {
                                if (config.url.indexOf("api.shinnytech.com/") > 0 && navigator && navigator.connection && Connection) {
                                    var networkState = navigator.connection.type;
                                    switch (networkState) {
                                        case Connection.UNKNOWN:
                                        case Connection.NONE:
                                            navigator.notification.alert(
                                                '未连接网络',
                                                function() {
                                                    return;
                                                },
                                                '提示',
                                                '确定'
                                            );
                                            break;
                                        case Connection.ETHERNET:
                                        case Connection.WIFI:
                                        case Connection.CELL_2G:
                                        case Connection.CELL_3G:
                                        case Connection.CELL_4G:
                                        case Connection.CELL:
                                        default:
                                    }
                                }
                                return config;
                            }
                        };
                    });
                }
            ])
            .constant('regObj', {
                inout: {
                    reg: /[入|出]金/,
                    rule: true
                },
                close: {
                    reg: /平仓/,
                    rule: true
                },
                others: {
                    reg: /[平仓|金]/,
                    rule: false
                },
            })
            .filter('toShow', ['regObj', function(regObj) {
                return filter = function(array, para) {
                    var arr = angular.copy(array);
                    var reg = regObj[para].reg;
                    for (var i = 0; i < arr.length; i++) {
                        var s = JSON.stringify(arr[i].actions);
                        if (regObj[para].rule) {
                            if (!reg.test(s)) {
                                arr.splice(i--, 1);
                            }
                        } else {
                            if (reg.test(s)) {
                                arr.splice(i--, 1);
                            }
                        }
                    }
                    return arr;
                };
            }]);

        angular.module('starter.controllers', []);

