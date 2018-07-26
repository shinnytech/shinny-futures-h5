define(['views/videoView', 'GS'], function (View, GS) {
    APP_video.next = "/returnCert.do";
    APP_video.pre = "/returnSetBank.do";
    APP_video.orderPage = "/" + templateName + "/appoint.html";
    APP_video.photoPage = "/photo";
    APP_video.bankPage = "/editBind";
    APP_video.examPage = "/exam";
    APP_video.videoBeforeCa = "";
    APP_video.initFlag = false;
    APP_video.empId = "";
    APP_video.userId = "";
    APP_video.orgCode = "";
    APP_video.videoType = "1";
    APP_video.time = "09:00-12:00"; //预约时间
    APP_video.test = 0; //测试次数
    APP_video.needWait = true;
    APP_video.mediaIp = "";
    APP_video.mediaPort = "";
    APP_video.workTime = 0;
    APP_video.pickerdsq = ""; //定时
    APP_video.dsqr = 0;

    var bindings = [{
            element: '.video-start-button',
            event: 'click',
            handler: addVideoUser
        }, {
            element: '.timeShow',
            event: 'click',
            handler: showTimeList
        }, {
            element: '.video-wait-button',
            event: 'click',
            handler: waitVideo
        }, {
            element: '.video-retry-button',
            event: 'click',
            handler: retry
        }, {
            element: '.video-rebind-button',
            event: 'click',
            handler: rebind
        }, {
            element: '.video-reexam-button',
            event: 'click',
            handler: reexam
        }, {
            element: '.close-picker',
            event: 'click',
            handler: pickerModalQR
        },
        /* {
        		element: '#waitLeft',
        		event: 'click',
        		handler: toVideoMain
        	},*/
        {
            element: '.appoint-button',
            event: 'click',
            handler: showOrder
        }
        /*,{ element: '#readyLeft',
        		event: 'click',
        		handler: returnPre
        	}*/
    ];

    //下部弹出框按钮事件
    var afterBindings = [{
        element: '#video_pop .video-next-button',
        event: 'click',
        handler: videoSuccess
    }, {
        element: '#video_pop .video-retry-button',
        event: 'click',
        handler: videoFail
    }, {
        element: '#video_pop .video-rebind-button',
        event: 'click',
        handler: bankFail
    }, {
        element: '#video_pop .video-reexam-button',
        event: 'click',
        handler: examFail
    }];

    var timer;

    function init() {
        View.render({
            bindings: bindings
        });
        initData();
    }

    function returnPre() {
        khApp.showIndicator();
        CRHloadPage(APP_video.pre); //上一步
    }

    //注销
    //	function logout(){
    //		APP_video.needWait 		= false;	//不在查询
    //		quitVideo();				//退出视频
    //		GS.logout();
    //	}

    //等待时返回视频首页
    function toVideoMain() {
        APP_video.needWait = false; //不在查询
        quitVideo(); //退出视频
        View.showReady();
    }

    //继续等待
    function waitVideo() {
        View.toggleDialog('hide');
        addVideoUser();
    }

    //初始化信息
    function initData() {
        APP_video.videoBeforeCa = $$("#videoBeforeCa").val(); //ca之前先视频
        APP_video.initFlag = true;
        APP_video.userId = $$("#clientId").val(); //用户ID
        APP_video.orgCode = $$("#branchNo").val(); //营业部号
        APP_video.anychatUrl = $$("#anychatUrl").val(); //地址
        APP_video.anychatPort = $$("#anychatPort").val(); //port
        APP_video.workTime = $$("#workTime").val(); //workTime
    }

    //添加视频队列
    function addVideoUser() {
        //判断是否是工作时间
        if (APP_video.workTime == 0) {
            //非工作时间
            View.showWorkTime();
        } else {
            APP_video.test = 0;
            View.showWait();
            $$.ajax({
                timeout: 15000,
                method: "POST",
                data: { userId: APP_video.userId, orgCode: APP_video.orgCode, type: APP_video.videoType },
                url: "/videoQueueUp.do?rnd=" + new Date().getTime(),
                success: function (data) {
                    var data = JSON.parse(data);
                    if (data.errorNo == 0) {
                        APP_video.needWait = true;
                        queryUserWaitInfo();
                    }
                    if (data.errorNo == 3) { //视频已经通过
                        //						CRHloadPage(APP_video.next);//下一步
                        APP_video.needWait = true;
                        queryUserWaitInfo();
                    }
                },
                error: function () {
                    khApp.alert(MESSAGE_TIMEOUT,
                        function () {
                            toVideoMain();
                        });
                },
                ontimeout: function () {
                    khApp.alert(MESSAGE_TIMEOUT,
                        function () {
                            toVideoMain();
                        });
                }
            });
        }

    }
    //显示工作日时间
    function showTimeList() {
        View.showTimeList();
    }

    /**
     * 展示坐席信息
     */
    function pickerModal(data) {
        View.pickerModalv(data);
        var pm = $$('div[class~="picker-modal"]');
        pm.show();
        //setTimeout(function() {
        //	pm.hide();
        //	startVideo();
        //}, 5000);
        //        $$('div[class~="picker-modal"] a[class="close-picker"]').click(function() {
        //            pm.hide();
        //            startVideo();
        //        });
        APP_video.pickerdsq = setInterval(function () {
            var time = $$('#times').html() - 1;
            $$('#times').html(time);
            if (time == -1 && APP_video.dsqr == 0) {
                pm.hide();
                startVideo();
                clearInterval(APP_video.pickerdsq);
            }
        }, 1000);
    }

    function pickerModalQR() {
        APP_video.dsqr = 1;
        clearInterval(APP_video.pickerdsq);
        var pm = $$('div[class~="picker-modal"]');
        pm.hide();
        startVideo();
        APP_video.dsqr = 0;
    }

    //查询用户信息
    var netTest = 0;

    function queryUserWaitInfo() {
        if (!APP_video.initFlag) {
            khApp.alert(MESSAGE_INITUN);
            return;
        }
        if (!APP_video.needWait) {
            return;
        }
        //测试10次后显示 预约
        if (APP_video.test >= 100000) {
            APP_video.needWait = false;
            APP_video.test = 0;
            View.toggleDialog('show');
            clearTimeout(timer);
            quitVideo(); //退出队列
            return;
        }

        var queryFlag = 1; //第一次queryFlag=0,第一次请求实时返回
        if (APP_video.test == 0) {
            queryFlag = 0;
        }
        $$.ajax({
            method: "POST",
            data: { userId: APP_video.userId, orgCode: APP_video.orgCode, queryFlag: queryFlag },
            url: "/videoQueryQueue.do?rnd=" + new Date().getTime(),
            success: function (data) {
                netTest = 0;
                var data = JSON.parse(data);
                if (!APP_video.needWait) {
                    return;
                }
                if (data.errorNo == 0) {
                    //MadeByHJL

                    var waitN = data["wait_position_int"];
                    var videoStatus = data.wait_status;
                    console.log("js android", "===查询排队信息,videoStatus=" + videoStatus);
                    if (videoStatus == 1) { //0:进入排队;1:可以连接视频
                        console.log("js android", "===连接视频");
                        APP_video.needWait = false;
                        View.showWait(waitN);
                        APP_video.mediaUserId = data["client_channel_id"] + ""; //用户id
                        APP_video.mediaEmpId = data["agent_channel_id"] + ""; //坐席id
                        APP_video.mediaIp = data["mediaserver_ip"] + ""; //地址
                        APP_video.mediaPort = data["mediaserver_port"] + ""; //port
                        APP_video.mediaPass = data["client_channel_pass"] + "";
                        pickerModal(data); //开始视频
                    } else if (videoStatus == 0) {
                        APP_video.needWait = true;
                        APP_video.test++;
                        $$(".wait-num").html(waitN);
                        queryUserWaitInfo();
                    }
                } else {
                    $$(".wait-num").html("<img class='loading-img' src='" + templateName + "/img/loading.gif' alt='loading'>");
                    APP_video.needWait = false;
                    APP_video.test++;
                    khApp.alert('由于应用长时间处于后台或其他原因，您已经退出视频队列，请您重新排队！',
                        function () {
                            //退出视频
                            toVideoMain();
                        });
                }
            },
            error: function () {
                netTest++;
                if (netTest >= 5) {
                    APP_video.needWait = false;
                    khApp.alert(MESSAGE_TIMEOUT,
                        function () {
                            toVideoMain();
                        });
                } else {
                    setTimeout(queryUserWaitInfo, 2000);
                }
            },
            ontimeout: function () {
                netTest++;
                if (netTest >= 5) {
                    APP_video.needWait = false;
                    khApp.alert(MESSAGE_TIMEOUT,
                        function () {
                            toVideoMain();
                        });
                } else {
                    setTimeout(queryUserWaitInfo, 2000);
                }
            }
        });
    }

    //开始视频
    function startVideo() {
        //		if (browser.versions.Chrome) {
        //			console.log("开始视频连接..."+APP_video.mediaIp+","+APP_video.mediaPort);
        //			return;
        //		}
        if (browser.versions.ios) { //iphone
            window.location.href = "objc://startVideo/?" + APP_video.mediaUserId + "?" + APP_video.mediaEmpId + "?" + APP_video.mediaIp + "?" + APP_video.mediaPort + "?" + APP_video.mediaUserId + "?" + APP_video.mediaPass;
        } else if (browser.versions.android) {
            //			jtoJHandle.callFunctionHJL(3, APP_video.mediaUserId, APP_video.mediaEmpId, APP_video.mediaIp, APP_video.mediaPort, APP_video.mediaUserId);
            // jtoJHandle.callFunctionWithP(3, APP_video.mediaUserId, APP_video.mediaEmpId, APP_video.mediaIp, APP_video.mediaPort, APP_video.mediaUserId, APP_video.mediaPass);
            var onSucess = function (s) {
                console.log('success result: ' + s.resultCode);
                CRHloadPage("/agreement");
            };
            var onFail = function (msg) {
                console.log('error' + msg);
                alert("视频通话时发生错误，请重试！");
                APP_video.finishVideo(2);
            };
            var userid = APP_video.mediaEmpId;
            var roomId = APP_video.mediaUserId;
            var options = {
                serverIp: APP_video.mediaIp,
                userName: "client_" + roomId,
                serverPort: APP_video.mediaPort,
                roomId: roomId,
                remoteUserid: userid,
                loginPassword: "123456",
                enterroomPassword: APP_video.mediaPass || "123456"
            }
            navigator.AnyChat.startChat(onSucess, onFail, options);
        }

    }
    //退出队列
    function quitVideo() {
        APP_video.test = 0;
        APP_video.needWait = false; //不在查询
        $$.ajax({
            method: "POST",
            data: {},
            url: "/videoQuitQueue.do?rnd=" + new Date().getTime(),
            success: function (data) {
                    var data = JSON.parse(data);
                }
                //			,                                         //MadeByHJL 发退出请求提示是否失败。网络异常情况下，视频验证页面，点击开始视频，弹出两个网络异常提示
                //			error: function(){
                //	   			khApp.alert(MESSAGE_TIMEOUT);
                //	   		},
                //	   		timeout: function(){
                //				khApp.alert(MESSAGE_TIMEOUT);
                //	   		}
        });
    }

    //【完成视频回调】 flag 1:成功,2:异常，3:不通过
    APP_video.finishVideo = function (flag) {
        if (flag == 1) {
            View.renderPopup({ //通过
                model: { "success": true, "successText": "视频验证通过，请进行下一步" },
                bindings: afterBindings
            });
            khApp.popup('.popup');
        } else if (flag == 2) { //视频意外中断请重新开始
            View.showReVideo();
        } else if (flag == 3) { //视频不通过
            $$.ajax({
                method: "POST",
                data: {},
                url: "/videoStatusQuery.do?rnd=" + new Date().getTime(),
                success: function (data) {
                    var data = JSON.parse(data);
                    var videoStatus = data.videoStatus;
                    var photoStatus = data.photoStatus;
                    var deposityStatus = data.deposityStatus;
                    var riskStatus = data.riskStatus;
                    if ("0" == photoStatus) {
                        View.renderPopup({
                            model: { "fail": true, "failText": "视频验证不通过，请重新验证身份证" },
                            bindings: afterBindings
                        });
                        khApp.popup('.popup');
                    } else if ("0" == deposityStatus) {
                        View.renderPopup({
                            model: { "bindfail": true, "failText": "视频验证不通过，请重新绑定银期信息" },
                            bindings: afterBindings
                        });
                        khApp.popup('.popup');
                    } else if ("0" == riskStatus) {
                        View.renderPopup({
                            model: { "riskfail": true, "failText": "视频验证不通过，请重新测试风险评估" },
                            bindings: afterBindings
                        });
                        khApp.popup('.popup');
                    } else if ("3" == videoStatus) {
                        khApp.hideIndicator();
                        View.showReVideo();
                    }
                },
                error: function () {
                    khApp.alert(MESSAGE_TIMEOUT);
                },
                ontimeout: function () {
                    khApp.alert(MESSAGE_TIMEOUT);
                }
            });
        } else if (flag == 4) { //link failed
            View.showReVideo();
        }
    }

    //通过后下一步
    function videoSuccess() {
        if (APP_video.videoBeforeCa == 1) { //ca之前进行视频
            khApp.showIndicator();
            $$.ajax({
                url: '/setVideoStatus.do?rnd=' + new Date().getTime(),
                method: "POST",
                timeout: 15000,
                data: { "videoStatus": "1" },
                success: function (data) {
                    var data = JSON.parse(data);
                    khApp.hideIndicator();
                    if (data.errorNo == 0) {
                        khApp.closeModal();
                        khApp.showIndicator();
                        CRHloadPage(APP_video.next);
                    } else {
                        khApp.hideIndicator();
                        khApp.alert(data.errorInfo);
                    }
                },
                error: function () {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                },
                ontimeout: function () {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                }
            });

        } else {
            //gotoNextPage(APP_video.next);
            //begin lixy
            khApp.showIndicator();
            $$.ajax({
                url: '/updateVideoStatus.do?rnd=' + new Date().getTime(),
                method: "POST",
                timeout: 15000,
                data: {},
                success: function (data) {
                    var data = JSON.parse(data);
                    khApp.hideIndicator();
                    if (data.errorNo == 0) {
                        khApp.closeModal();
                        khApp.showIndicator();
                        CRHloadPage("/goCert.do");
                    } else {
                        khApp.hideIndicator();
                        khApp.alert(data.errorInfo);
                    }
                },
                error: function () {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                },
                ontimeout: function () {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                }
            });
            //finish
            //			khApp.closeModal();
            //			khApp.showIndicator();
            //			CRHloadPage(APP_video.next);
        }
    }

    //视频不通过查看视频状态和照片状态
    function videoFail() {
        gotoNextPage(APP_video.photoPage);
        //		khApp.closeModal();
        //		khApp.showIndicator();
        //		CRHloadPage(APP_video.photoPage);
    }

    function bankFail() {
        gotoNextPage(APP_video.bankPage);
    }

    function examFail() {
        gotoNextPage(APP_video.examPage);
    }

    function retry() {
        //视频重新发起
        addVideoUser();
    }

    function rebind() {
        //视频重新发起
        addVideoUser();
    }

    function reexam() {
        //视频重新发起
        addVideoUser();
    }

    //显示预约
    function showOrder() {
        mainView.loadPage(APP_video.orderPage);
    }

    function gotoNextPage(url) {
        khApp.showIndicator();
        $$.ajax({
            timeout: 15000,
            type: "POST",
            data: null,
            async: true,
            url: url + "?rnd=" + new Date().getTime(),
            ontimeout: function () {
                khApp.hideIndicator();
                khApp.alert(MESSAGE_TIMEOUT);
            },
            success: function (data) {
                khApp.hideIndicator();
                khApp.closeModal();
                khApp.hidePreloader();
                mainView.loadContent(data);
            },
            error: function (xhr) {
                if (xhr.status == '0') {
                    khApp.hideIndicator();
                    khApp.alert(MESSAGE_TIMEOUT);
                } else {
                    khApp.hideIndicator();
                    khApp.alert('出现错误，请稍后再试');
                }

            },
        });
    }
    return {
        init: init
    };
});
