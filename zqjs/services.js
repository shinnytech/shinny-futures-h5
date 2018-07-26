if (!navigator.notification) {
    navigator.notification = {};
    navigator.notification.alert = function (message, fb, title, btnText) {
        alert(title + ' ' + message);
        fb();
    }
    navigator.notification.confirm = function (message, fb, title, btnText) {
        var r = confirm(title + ' ' + message);
        if (r == true) {
            fb(1);
        } else {
            return;
        }
    }
}

angular
    .module('starter.services', [])
    .service('QueryService', [
        '$http',
        function ($http) {
            var _baseUrl = SETTING.server_base_url;
            var queryService = {
                history: function (dstart, dend) {
                    var _baseUrl = SETTING.server_base_url;
                    // NOTE : 接口 page 从 0 开始 ; per_page 默认写个很大的数字 100000 var url =
                    // "http://api.shinnytech.com/t/sim/accounts/09885ec19f454951a34f0150ba466012/rep
                    // orts/account_change_log?page=0&per_page=100000&dstart="+dstart+"&dend="+dend;

                    var promise = $http({
                        method: 'GET',
                        url: _baseUrl + '/t/' + localStorage.getItem('broker_id') + '/accounts/' + DM.datas.account_id + '/reports/account_change_log?page=0&per_page=100000&dstart=' + dstart + '&dend=' + dend
                        })
                        .success(function (response) {
                            return response;
                        })
                        .error(function (response, status) {
                            console.log("response:" + response + ",status:" + status);
                            return status;
                        });
                    return promise;
                },
                bank_account: function () {
                    var _baseUrl = SETTING.server_base_url;
                    var promise = $http({
                        method: 'GET',
                        url: _baseUrl + '/t/' + localStorage.getItem('broker_id') + '/accounts/' + localStorage.getItem('account_id') + '/bank/list'
                        })
                        .success(function (response) {
                            return response;
                        })
                        .error(function (response, status) {
                            console.log("response:" + response + ",status:" + status);
                            return status;
                        });
                    return promise;
                },
                bank_balance: function (bank_id, bank_password) {
                    var _baseUrl = SETTING.server_base_url;
                    var promise = $http({
                        method: 'GET',
                        url: _baseUrl + '/t/' + localStorage.getItem('broker_id') + '/accounts/' + localStorage.getItem('account_id') + '/bank/account?bank_id=' + bank_id + '&bank_password=' + bank_password
                        })
                        .success(function (response) {
                            return response;
                        })
                        .error(function (response, status) {
                            console.log("response:" + response + ",status:" + status);
                            return status;
                        });
                    return promise;
                },
                future_balance: function (bank_id, bank_password) {
                    var _baseUrl = SETTING.server_base_url;
                    var promise = $http({
                        method: 'GET',
                        url: _baseUrl + '/t/' + localStorage.getItem('broker_id') + '/accounts/' + localStorage.getItem('account_id') + '/bank/future_account'
                        })
                        .success(function (response) {
                            return response;
                        })
                        .error(function (response, status) {
                            console.log("response:" + response + ",status:" + status);
                            return status;
                        });
                    return promise;
                }
            }
            return queryService;
        }
    ])
    .service('LoginService', [
        '$rootScope',
        '$http',
        function ($rootScope, $http) {
            var _baseUrl = SETTING.server_base_url;
            var loginService = {
                is_login_server: function () {
                    if (DM.datas.account_id) 
                        return true;
                    return false;
                },

                do_http_login: function (param) {
                    // 测试账户
                    // console.log(param);
                    // param = {"account_id": "41007684", "password": "1"} param = {"account_id":
                    // "13000001010", "password": "1"}
                    var promise = $http.post(_baseUrl + '/account_sessions', param, {withCredentials: true});
                    return promise;
                },
                do_http_register: function (param) {
                    var promise = $http.post(_baseUrl + '/sim_accounts', param);
                    return promise;
                },
                do_http_mobilestatus: function (mobile) {
                    var promise = $http.get(_baseUrl + '/mobiles/' + mobile);
                    return promise;
                },
                do_http_resetPassword: function (param) {
                    var promise = $http.post(_baseUrl + '/account_password', param);
                    return promise;
                },

                last_login_state: function () {
                    if (localStorage.getItem('broker_id') == null) {
                        return 'none';
                    } else {
                        return localStorage.getItem('broker_id');
                    }
                },
                get_login_state: function () {
                    if (localStorage.getItem('broker_id') == null) {
                        return 'none';
                    } else {
                        return localStorage.getItem('broker_id');
                    }
                }
            }
            return loginService;
        }
    ]);
