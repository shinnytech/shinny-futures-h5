angular.module('starter', ['ionic', 'datetime', 'ionic-datepicker', 'starter.controllers', 'starter.services', 'numericKeyboard'])

        .run(['$rootScope', '$state', '$urlRouter', '$interval', '$timeout', '$location', '$ionicModal', '$ionicLoading', '$ionicHistory', '$ionicPlatform', 'LoginService', '$http',
            function($rootScope, $state, $urlRouter, $interval, $timeout, $location, $ionicModal, $ionicLoading, $ionicHistory, $ionicPlatform, LoginService, $http) {
                // init
                // 1. init http headers
                $http.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
                $http.defaults.headers.common['Accept'] = 'application/json';
                if (localStorage.getItem('Shinny-Session')) {
                    $http.defaults.headers.common['Shinny-Session'] = localStorage.getItem('Shinny-Session');
                }

                // 2. datamanager init
                DM.init(draw_app);
                // InstrumentManager.init();

                // 全局设置 angularui-router . state
                $rootScope.$state = $state;

                // 登录状态
                $rootScope.login_states = {
                    type: 'none',
                    broker_id: '',
                };

                // 登录参数 
                $rootScope.login_params = {
                    type: 'sim',
                    account_id: '022631'
                };

                if (localStorage.getItem('mobile')) {
                    $rootScope.login_states.mobile = localStorage.getItem('mobile') ? localStorage.getItem('mobile') : '';
                }

                // 初始化注册开户页面显示内容 [one, two.onlysim, two.all, two.no]
                $rootScope.register_step = 'one';

                // 初始化生成 $rootScope.registerModal $rootScope.changepwdModal
                $ionicModal.fromTemplateUrl('templates/modals/register.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up',
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $rootScope.registerModal = modal;
                });
                $ionicModal.fromTemplateUrl('templates/modals/changepwd.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up',
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $rootScope.changepwdModal = modal;
                });

                /**
                 * parameters
                 * $rootScope.login_states.mobile - 手机号码
                 * $rootScope.login_states.sim_password - 模拟密码
                 * $rootScope.login_states.account - 实盘账户
                 * $rootScope.login_states.act_password - 实盘密码
                 * $rootScope.login_error - 登录是否出错
                 * $rootScope.login_error_msg - 登录错误提示
                 */

                /**
                 * functions
                 * $rootScope.closeModal - 关闭 2 个 modal
                 * $rootScope.setParams - 根据登录状态设置登录参数
                 * $rootScope.switchParams - 切换登录参数 sim/act
                 * $rootScope.do_login - 登录
                 * $rootScope.do_register - 注册
                 * $rootScope.do_checkmobile - 检查手机号
                 * $rootScope.do_changepwd -  修改密码
                 */
                $rootScope.closeModal = function() {
                    if ($rootScope.registerModal.isShown()) {
                        $rootScope.registerModal.hide();
                    }
                    if ($rootScope.changepwdModal.isShown()) {
                        $rootScope.changepwdModal.hide();
                    }
                    return;
                };

                $rootScope.checkMobile = function() {
                    console.log($rootScope.login_states.mobile);
                    localStorage.setItem('mobile', $rootScope.login_states.mobile);
                    LoginService.do_http_mobilestatus($rootScope.login_states.mobile)
                        .then(function(response) {
                            if (response.status == 200) {
                                console.log(response.data)
                                if (response.data.sim_account == 0) {
                                    $rootScope.register_step = 'two.no';
                                    //无模拟无实盘
                                    LoginService.do_http_register({
                                            "mobile": $rootScope.login_states.mobile
                                        })
                                        .then(function(response) {
                                            if (response.status == 201) {
                                                $rootScope.register_step = 'two.no';
                                            } else {
                                                console.log('注册失败')
                                            }
                                        });
                                } else if (response.data.real_account == 0) {
                                    //有模拟无实盘
                                    $rootScope.register_step = 'two.onlysim';
                                } else {
                                    //有模拟有实盘
                                    $rootScope.register_step = 'two.all';
                                }
                                console.log($rootScope.register_step)
                            } else {
                                console.log(response.status)
                            }
                        });

                }

                $rootScope.openAccount = function() {
                    // 东方期货 0127  浏览器&registerWay=2
                    var m = $rootScope.login_states.mobile;
                    window.location.href = 'https://appficaos.cfmmc.com/indexnew?brokerId=0127&openType=9&checkBrokerIdFlag=false&mobile=' + m;
                }

                $rootScope.register = function() {
                    LoginService.do_register();
                }

                $rootScope.send_pwd = function() {
                    var broker_id = "";
                    if ($rootScope.login_params.type == 'sim') {
                        broker_id = $rootScope.login_params.type;
                    }
                    var d = {
                        "broker_id": broker_id,
                        "mobile": $rootScope.login_states.mobile
                    };

                    LoginService.do_http_resetPassword(d).then(function(response) {
                        if (response.status == 200) {
                            $rootScope.send_pwd_message_result = true;
                            $rootScope.send_pwd_message = "重置成功，密码发送到您手机。";
                            localStorage.setItem('mobile', $rootScope.login_states.mobile);
                        } else if (response.status == 403) {
                            $rootScope.send_pwd_message_result = true;
                            $rootScope.send_pwd_message = "该手机号未注册。";
                        } else {
                            $rootScope.send_pwd_message_result = true;
                            $rootScope.send_pwd_message = "服务器正忙,请稍后重试!";
                        }
                    }, function(response) {
                        if (response.status == 403) {
                            $rootScope.send_pwd_message_result = true;
                            $rootScope.send_pwd_message = "该手机号未注册。";
                        }
                    });
                }


                $ionicPlatform.ready(function() {
                    if (window.StatusBar) {
                        // org.apache.cordova.statusbar required
                        StatusBar.styleDefault();
                    }

                    InstrumentManager.init();

                    // init websocket
                    // WS.init(SETTING.sim_server_url);
                    if (LoginService.last_login_state() == "sim" || LoginService.last_login_state() == "none") {
                        WS.init(SETTING.sim_server_url);
                        TR_WS.init(SETTING.tr_server_url);
                    } else {
                        WS.init(SETTING.act_server_url);
                    }

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

        .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$ionicConfigProvider', 'ionicDatePickerProvider',
                function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, ionicDatePickerProvider) {

                    var datePickerObj = {
                        inputDate: new Date(),
                        titleLabel: '请选择日期',
                        setLabel: '选择',
                        todayLabel: '今天',
                        closeLabel: '关闭',
                        mondayFirst: false,
                        weeksList: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                        monthsList: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                        templateType: 'popup',
                        from: new Date(2010, 1, 1),
                        to: new Date(),
                        showTodayButton: true,
                        dateFormat: 'yyyy MM dd',
                        closeOnSelect: false,
                        disableWeekdays: [0, 6]
                    };

                    ionicDatePickerProvider.configDatePicker(datePickerObj);

                    $urlRouterProvider.otherwise('/app/tabs/quote');

                    $stateProvider
                        .state('app', {
                            url: '/app',
                            abstract: true,
                            templateUrl: 'menus.html',
                        })
                        .state('app.tabs', {
                            url: '/tabs',
                            abstract: true,
                            templateUrl: 'tabs.html',
                        })
                        //  主页
                        // .state('app.tabs.home', {
                        //     url: '/home',
                        //     views: {
                        //         'tab-home': {
                        //             templateUrl: 'templates/home.html',
                        //             controller: 'HomeCtrl'
                        //         }
                        //     }
                        // })
                        // 报价
                        .state('app.tabs.quote', {
                            url: '/quote',
                            views: {
                                'tab-quote': {
                                    templateUrl: 'templates/quote.html',
                                    controller: 'QuoteCtrl'
                                }
                            }
                        })
                        // 持仓
                        .state('app.tabs.position', {
                            url: '/position',
                            views: {
                                'tab-position': {
                                    templateUrl: 'templates/position.html',
                                    controller: 'PositionCtrl'
                                }
                            }
                        })
                        // 交易历史
                        .state('app.tabs.transaction', {
                            url: '/transaction',
                            views: {
                                'tab-transaction': {
                                    templateUrl: 'templates/transaction.html',
                                    controller: 'TransactionCtrl'
                                }
                            }
                        })
                        // 圈子
                        .state('app.tabs.community', {
                            url: '/community',
                            views: {
                                'tab-community': {
                                    templateUrl: 'templates/community.html',
                                    controller: 'CommunityCtrl'
                                }
                            }
                        })
                        /***************************/
                        // 持仓详情
                        .state('app.posdetail', {
                            url: '/posdetail',
                            templateUrl: 'templates/posdetail.html',
                            controller: 'PosdetailCtrl'
                        })
                        // 交易
                        .state('app.makeorder', {
                            url: '/makeorder',
                            templateUrl: 'templates/makeorder.html',
                            controller: 'MakeorderCtrl'
                        })
                        // 银期转账
                        .state('app.banktransfer', {
                            url: '/banktransfer',
                            templateUrl: 'templates/banktransfer.html',
                            controller: 'BanktransferCtrl'
                        })
                        // 个人信息-登录状态
                        .state('app.userinfo', {
                            url: '/userinfo',
                            templateUrl: 'templates/userinfo.html',
                            controller: 'UserinfoCtrl'
                        })
                        // 反馈
                        // .state('app.feedback', {
                        //     url: '/feedback',
                        //     templateUrl: 'templates/feedback.html',
                        //     controller: 'UserinfoCtrl'
                        // })
                        // 帮助
                        // .state('app.help', {
                        //     url: '/help',
                        //     templateUrl: 'templates/help.html',
                        //     controller: 'UserinfoCtrl'
                        // });

                    $ionicConfigProvider.views.swipeBackEnabled(false);
                    $ionicConfigProvider.views.transition('none');
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