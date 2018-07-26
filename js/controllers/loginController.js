define(['views/loginView', 'GS', 'services/openTypeService'], function (View, GS, OTS) {
    var APP_login = {};
    APP_login.openType = "9"; //开户类型
    APP_login.next = "/agreement"; //下一步
    APP_login.pre = "/guide";
    APP_login.flowKind = "";

    var bindings = [{
        element: '.login-submit',
        event: 'click',
        handler: loginSubmit
    }, {
        element: '.login-getcode',
        event: 'click',
        handler: getValidateCode
    }, {
        element: '.login-getimgcode',
        event: 'click',
        handler: refreshCode
    }, {
        element: '.icon-back',
        event: 'click',
        handler: returnPre
    }];

    function refreshCode() {
        $$("#codeImg").attr("src", "/validateCode.img?d=" + new Date().getTime());
    }

    function returnPre() {
        //window.location.href ='indexnew';
        khApp.showIndicator();
        $$.ajax({
            timeout: 15000,
            url: '/checkBrokerId.do?rnd=' + new Date().getTime(),
            method: "POST",
            data: {},
            success: function (data) {
                khApp.hideIndicator();
                var data = JSON.parse(data);
                var brokerId = data.brokerId;
                if (brokerId != "noBroker") {
                    window.location.href = 'indexnew?registerWay=' + registerWay;
                } else {
                    var type = "1";
                    mainView.loadPage('/' + templateName + '/broker.html?type=' + type);
                }
            },
            ontimeout: function () {
                khApp.hideIndicator();
                khApp.closeModal();
                khApp.hidePreloader();
                khApp.alert(MESSAGE_TIMEOUT);
            },
            error: function (xhr) {
                if (xhr.status == '0') {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert(MESSAGE_TIMEOUT);
                } else {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert('出现错误，请稍后再试');
                }
            }
        });
    }

    //如果有手机号
    function init(query) {
        //刷新图片验证码
        refreshCode();

        var type = query.type;
        APP_login.openType = type;
        if (typeof (mobileNo) == 'string' && mobileNo != "") {
            khApp.showPreloader('正在校验登录状态,请稍后....');
            $$.ajax({
                url: '/register.do?rnd=' + new Date().getTime(),
                type: 'POST',
                timeout: 15000, //超时时间设置，单位毫秒
                data: {
                    "mobile": mobileNo,
                    "validateCode": "2222",
                    "openType": APP_login.openType
                },
                success: function (data) {
                    khApp.hidePreloader();
                    mainView.showNavbar();

                    //显示头部导航（防止进来时设置不成功，再设置一次）
                    var data = JSON.parse(data);
                    if (data.errorNo == '0') {
                        setTimeout(findSn, 500);
                    } else {
                        resetBtn();
                        khApp.alert(MESSAGE_LOGIN_ERROR);
                    }
                },
                error: function (xhr) {
                    if (xhr.status == '0') {
                        khApp.hidePreloader();
                        khApp.alert(MESSAGE_TIMEOUT);
                    } else {
                        khApp.hidePreloader();
                        khApp.alert('出现错误，请稍后再试');
                    }
                },
                ontimeout: function () {
                    khApp.hidePreloader();
                    khApp.alert(MESSAGE_TIMEOUT);
                }
            });
        } else {
            $$("#guid_nav_left").html("");
        }
        //setType(type);

        View.init({
            bindings: bindings
        });
        //输入框加焦点
        setTimeout(function () {
            $$('.mobile')[0].disabled = true;
            $$('.verifycode').focus();
        }, 500);

        //默认手机号
        if (mobile.length > 0) {
            $$('.mobile').val(mobile);

        }


        //是否需要切换期货公司
        if (checkBrokerIdFlag == "true") {
            alertDialog({
                title: "温馨提示",
                text: "是否切换期货公司",
                btnText1: "是",
                action1: function () {
                    $$.ajax({
                        url: '/clearBrokerIdCookie.do?rnd=' + new Date().getTime(),
                        type: 'POST',
                        timeout: 15000, //超时时间设置，单位毫秒
                        data: {
                            "brokerId": brokerId,
                        },
                        success: function (data) {

                            var data = JSON.parse(data);
                            if (data.errorNo == '0') {
                                window.location.href = 'indexnew?registerWay=' + registerWay;
                            } else {
                                khApp.hidePreloader();
                                khApp.alert('出现错误，请稍后再试');
                            }
                        },
                        error: function (xhr) {
                            khApp.hidePreloader();
                            khApp.alert('出现错误，请稍后再试');
                        },
                        ontimeout: function () {
                            khApp.hidePreloader();
                            khApp.alert(MESSAGE_TIMEOUT);
                        }
                    });


                },
                btnText2: "否",
                action2: function () {}
            });
        }
    }

    function setType(type) {
        var typeData = OTS.getTypeData(type);
        if (typeData) {
            View.changeType(typeData.title, typeData.explain);
        }
    }

    function isMobile(str) {
        var reg = /^[1][34578]\d{9}$/;
        return reg.test(str);
    }

    function isVaildCode(str) {
        var reg = /^\d{6}$/;
        return reg.test(str);
    }

    function isverifyCode(str) {
        var reg = /^[A-Za-z0-9]{4}$/;
        return reg.test(str);
    }

    function resetBtn() {
        $$('.login-getcode').html('重新获取验证码');
        $$('.login-getcode').removeClass('disabled');

        if (timer) {
            clearTimeout(timer);
        }
    }

    function getValidateCode() {
        var valMobile = $$('.mobile').val();
        //校验图片验证码
        var verifycode = $$('.verifycode').val();

        if (!isMobile(valMobile)) {
            khApp.alert('手机号码有误，请重新输入！');

        } else if (!isverifyCode(verifycode)) {
            khApp.alert('请正确输入图片验证码！');

        } else {
            goVerify.call(this, valMobile);
        }
    }

    var timer = null;
    //获得验证码
    function goVerify(val) {
        var btn = this;
        if (!$$(btn).hasClass('disabled')) {
            $$(btn).addClass('disabled');
        }
        var verifycode = $$('.verifycode').val();

        var setTime = 60;
        var curTime = 0;
        var leftTime;
        $$.ajax({
            url: '/sendVerification.do?rnd=' + new Date().getTime(),
            method: 'POST',
            timeout: 15000,
            data: {
                "mphone": val,
                "verifycode": verifycode
            },
            success: function (data) {
                var data = JSON.parse(data);
                if (data.errorNo == '0') {
                    function countDown(setTime) {
                        if (timer) {
                            clearTimeout(timer);
                        }
                        curTime++
                        leftTime = setTime - curTime;
                        $$(btn).html(leftTime + '秒后重新获取');
                        if (leftTime > 0) {
                            timer = setTimeout(function () {
                                countDown(setTime);
                            }, 1000);
                        } else {
                            resetBtn();
                        }
                    }
                    countDown(setTime);
                } else {
                    khApp.alert(data.errorInfo);
                    curTime = 0;
                    resetBtn();
                }
            },
            error: function (xhr) {
                if (xhr.status == '0') {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert(MESSAGE_TIMEOUT);
                    curTime = 0;
                    resetBtn();
                } else {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert('出现错误，请稍后再试');
                    curTime = 0;
                    resetBtn();
                }
            },
            ontimeout: function () {
                curTime = 0;
                khApp.alert(MESSAGE_TIMEOUT);
                resetBtn();
            }
        });
    }

    //登陆
    function loginSubmit() {
        var valMobile = $$('.mobile').val();
        var valPassword = $$('.password').val();
        var verifycode = $$('.verifycode').val();
        var channel_cf = channel_cfmmc;
        if (!isMobile(valMobile)) {
            khApp.alert('手机号码为空或有误，请重新输入');
        } else if (!isverifyCode(verifycode)) {
            khApp.alert('请正确输入图片验证码！');
        } else if (!timer) {
            khApp.alert('请先获取短信验证码');
        } else if (!isVaildCode(valPassword)) {
            khApp.alert('输入6位数字短信验证码');
        } else {
            khApp.showIndicator();
            $$.ajax({
                url: '/register.do?rnd=' + new Date().getTime(),
                type: 'POST',
                timeout: 15000, //超时时间设置，单位毫秒
                data: {
                    "mobile": valMobile,
                    "validateCode": valPassword,
                    "openType": APP_login.openType,
                    "channel_cfmmc": channel_cf,
                    "phoneType": phoneType,
                    "phoneVersion": phoneVersion,
                    "verifycode": verifycode,
                    "registerWay": registerWay
                },
                success: function (data) {
                    mainView.showNavbar(); //显示头部导航（防止进来时设置不成功，再设置一次）
                    var data = JSON.parse(data);
                    if (data.errorNo == '0') {
                        CRHloadPage(APP_login.next);
                        //findSn();
                    } else {
                        khApp.hideIndicator();
                        //resetBtn();
                        //						khApp.alert(MESSAGE_LOGIN_ERROR);;
                        khApp.alert(data.errorInfo);
                    }
                },
                error: function (xhr) {
                    if (xhr.status == '0') {
                        khApp.hideIndicator();
                        khApp.closeModal();
                        khApp.hidePreloader();
                        khApp.alert(MESSAGE_TIMEOUT);
                    } else {
                        khApp.hideIndicator();
                        khApp.closeModal();
                        khApp.hidePreloader();
                        khApp.alert('出现错误，请稍后再试');
                    }
                },
                ontimeout: function (error) {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                }
            });
        }
    }

    //查sn
    function findSn() {
        khApp.showIndicator();
        $$.ajax({
            timeout: 15000,
            url: "/findSn.do?rnd=" + new Date().getTime(),
            type: "POST",
            data: null,
            success: function (data) {
                khApp.hideIndicator();
                var data = JSON.parse(data);
                APP_login.flowKind = data.flowKind;

                if (APP_login.flowKind == "3") {
                    CRHloadPage(APP_login.next);
                } else {
                    if (data.errorNo == "1") {
                        //无证书
                        CRHloadPage(APP_login.next);
                        return;
                    } else if (data.errorNo == "0") {
                        //有证书
                        CERT.verifyLocalSn(data.sn);
                        return;
                    }
                }

            },
            error: function (xhr) {
                if (xhr.status == '0') {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert(MESSAGE_TIMEOUT);
                } else {
                    khApp.hideIndicator();
                    khApp.closeModal();
                    khApp.hidePreloader();
                    khApp.alert('出现错误，请稍后再试');
                }
            },
            ontimeout: function () {
                khApp.hideIndicator();
                khApp.alert(MESSAGE_TIMEOUT);
            }
        });
    }

    /****
     * 检测本地SN码回调方法
     * @param {Object} sn; sn=-10 不存在sn文件；-1 异常；-2 异常；
     */
    CERT.checkLocalSnCallBack = function (sn) {
        //如果本地没有SN则跳转到验证用户信息页面
        if (sn == -10 || sn == -2) {
            CRHloadPage("/identity");
        } else {
            CRHloadPage(APP_login.next);
        }
    }

    return {
        init: init
    }
});
