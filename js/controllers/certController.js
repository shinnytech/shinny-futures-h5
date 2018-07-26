define(['views/certView', 'GS', 'forge.min'], function (View, GS, forge) {
	APP_cert.next		= "/openaccount";
	APP_cert.pre		= "/video";
	APP_cert.csr		= "";
	APP_cert.sn			= "";
	APP_cert.cn			= "";
	APP_cert.dn			= "";
	APP_cert.p7			= "";
	APP_cert.needWait	= true;
	APP_cert.flowKind   = "";
	
	var bindings = [{
		element: '.cert-request-button',
		event: 'click',
		handler: setCertPass
	}];
	
	//弹出框按钮事件
	var afterBindings = [{
		element: '.cert-download-button',
		event: 'click',
		handler: success
	}, {
		element: '.cert-retry-button',
		event: 'click',
		handler: fail
	}];

	function init() {
		View.render({
			bindings: bindings,
			model: {'isDownloading': true}
		});
		APP_cert.needWait = true;
		tryCount = 0;
		checkCertTaskType();
	}
	
	//查询中登证书颁发状态
	var tryCount = 0;
	var timer;
	function checkCertTaskType(){
		if(!APP_cert.needWait){
			return;
		}
		if(tryCount >=20){
			clearTimeout(timer);
			khApp.alert("证书申请暂未通过请稍后再登陆查看！");
			return;
		}
		khApp.showIndicator();
		$$.ajax({
			timeout:15000,
			url: "/certFindCertTaskStatus.do?rnd=" + new Date().getTime(),
	      	method: "POST",
	      	data: null,
      		success: function(res){
      			khApp.hideIndicator();
			 	var data = JSON.parse(res);
			 	APP_cert.flowKind = data.flowKind;
			 	if (data.errorNo == "-1"){		//未申请证书
					tryCount = 0;
					if(data.openType != "1"){
						View.changeExplainTxt("<p>请设置数字证书密码</p>");
					}
					//显示密码页面
					View.showAuditAfter();		
				}else if(data.errorNo == "2"){	//审核通过
					tryCount = 0;
					if(data.openType != "1"){
						View.changeExplainTxt("<p>请设置数字证书密码</p>");
					}
					//显示密码页面
					View.showAuditAfter();	
				}else{
					timer = setTimeout(checkCertTaskType,10000);//轮询10S
					tryCount += 1;
				}
			 	
			 	
//			 	else if (data.errorNo == 0){			//颁发通过设置密码，显示密码输入页面
//					tryCount = 0;
//					if(data.openType != "1"){
//						View.changeExplainTxt("<p>请设置数字证书密码</p>");
//					}
//					View.showAuditAfter();		//显示密码页面
//				} else if (data.errorNo == 2) {	//颁发不通过
//					tryCount = 0;
//					View.renderPopup({
//						model:{"fail": true, "failText": "证书申请不通过，请重新进行视频验证"},
//						bindings: afterBindings
//					});
//					khApp.popup('.popup');
//				} 
	      	},
	      	error: function(xhr){
	      		if(xhr.status == '0'){
					khApp.hideIndicator();
					khApp.closeModal();
					khApp.hidePreloader();
					khApp.alert(MESSAGE_TIMEOUT);
				}else{
					khApp.hideIndicator();
					khApp.closeModal();
					khApp.hidePreloader();
					khApp.alert('出现错误，请稍后再试');
				}
	   		},
	   		ontimeout: function(){
	   			khApp.hideIndicator();
	   			khApp.alert(MESSAGE_TIMEOUT);
	   		}
		});
	}
	
	//设置证书密码
	function setCertPass(){
		var p1 = $$("#certcode").val();
		var p2 = $$("#certcodeRepeat").val();
			var reg = /^\d{6}$/;
		if(!reg.test(p1)){
			khApp.alert("请输入6位数字的密码！");
			return;
		}
		if(p1=="" || p1 != p2){
			khApp.alert("两次密码不一致，请重新输入");
			return;
		}
		khApp.showIndicator();
		
		if(APP_cert.flowKind =="3"){
			saveCert(p1);
		}else{
			View.showDownloading();	//显示等待页面
			View.setProgress(30);	//设置进度为30%
			//保存密码
            if (browser.versions.ios) {
                APP_cert.setPassCallBack(0, APP_cert.getCsr());
            }else if (browser.versions.android) {
                CERT.savePass(p1);
            }
			// CERT.savePass(p1);		//保存密码
			// APP_cert.setPassCallBack(0, APP_cert.getCsr());
		}
	}

	APP_cert.getCsr = function () {
		View.showDownloading();
	    console.log("===== getCsr start =====");
	    // 生成 privateKey & publicKey
	    var rsa = forge.pki.rsa;
	    var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
	    var pemPrivateKey = forge.pki.privateKeyToPem(keypair.privateKey);
	    localStorage.pemPrivateKey = pemPrivateKey;
	    
	    var csr = forge.pki.createCertificationRequest();
	    csr.publicKey = keypair.publicKey;
	    csr.sign(keypair.privateKey);
	    var pem = forge.pki.certificationRequestToPem(csr);
	    var rMessage = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g;
	    var match = rMessage.exec(pem);
	    return match[3];
	}
	
	//【回调方法】设置证书密码
	APP_cert.setPassCallBack = function(flag,csr){
		khApp.hideIndicator();
		if(flag == 0){
			View.setProgress(50);//设置进度为50%
			requestCert(csr);//申请证书
		}else{
			khApp.alert("设置密码不成功，请重新设置");
			return;
		}
	}
	
	//申请证书
	function requestCert(csr){
		var csr_ = encodeURIComponent(csr);
    	$$.ajax({
    		timeout:15000,
			url: "/certApplyCert.do?rnd=" + new Date().getTime(),
	      	method: "POST",
	      	data: {"csr":csr_,"encode":"1"},
      		success: function(data){
	      		var data = JSON.parse(data);
		        if(!data){
		        	khApp.modal({
						title: '系统消息',
						text: "【"+data["errorNo"]+"】申请证书服务异常，请稍后再试",
						buttons: [{
							text: '确定',
							onClick: function () {
								View.reSetPassword();
							}
						}]
					});
		        	return;
		        }
		        if(data["errorNo"]==0){
		        	APP_cert.sn = data["sn"];
		        	APP_cert.p7 = data["p7cert"];
		        	View.setProgress(80);	//设置进度为80%
		        	CERT.saveCert(data["sn"],data["p7cert"]);	//保存证书
	        	}else{
	        		khApp.modal({
						title: '系统消息',
						text: "【"+data["errorNo"]+"】申请证书不成功，请重新申请",
						buttons: [{
							text: '确定',
							onClick: function () {
								View.reSetPassword();
							}
						}]
					});
	        	}
	      	},
			error: function(xhr) {
				if(xhr.status == '0'){
					khApp.hideIndicator();
					khApp.modal({
						title: '系统消息',
						text: "网络或服务异常，请检查手机网络情况后重试！",
						buttons: [{
							text: '确定',
							onClick: function () {
								View.reSetPassword();
							}
						}]
					});
				}else{
					khApp.hideIndicator();
					khApp.modal({
						title: '系统消息',
						text: "申请证书不成功，请重新申请",
						buttons: [{
							text: '确定',
							onClick: function () {
								View.reSetPassword();
							}
						}]
					});
				}
			},
			ontimeout: function() {
				khApp.hideIndicator();
				khApp.modal({
					title: '系统消息',
					text: "申请证书不成功，请重新申请",
					buttons: [{
						text: '确定',
						onClick: function () {
							View.reSetPassword();
						}
					}]
				});
			}
		});
	}
	
	//【回调方法】保存证书回调
	APP_cert.downInstalCertCallBack = function(flag){
		View.setProgress(100);//设置进度为100%
		if(flag ==0){
			$$("#download").hide();//隐藏进度页面
			View.renderPopup({
				model:{"success": true, "successText": "数字证书安装成功"},
				bindings: afterBindings
			});
			khApp.popup('.popup');
		}else{
			View.showDownloading();	//显示等待页面
			View.setProgress(80);	//设置进度为80%
        	CERT.saveCert(APP_cert.sn,APP_cert.p7);	//保存证书
		}
	}

	
	
	function saveCert(password){
		khApp.showIndicator();
    	$$.ajax({
    		timeout:15000,
			url: "/saveCert.do?rnd=" + new Date().getTime(),
	      	method: "POST",
	      	data: {"password":password},
      		success: function(data){
      			khApp.hideIndicator();
	      		var data = JSON.parse(data);
	      		 if (data.errorNo == 0){
	      			CRHloadPage('/openaccount');
	      		 }else{
	      			khApp.alert(data.errorInfo);
	      		 }
	      	},
	      	ontimeout:function(){
				khApp.hideIndicator();
				khApp.closeModal();
				khApp.hidePreloader();
				khApp.alert(MESSAGE_TIMEOUT);
			},
			error : function(xhr) {
				if(xhr.status == '0'){
					khApp.hideIndicator();
					khApp.alert(MESSAGE_TIMEOUT);
				}else{
					khApp.hideIndicator();
					khApp.alert('出现错误，请稍后再试');
				}
			}
		});
    	
	}
	
	function success(){
		gotoNextPage(APP_cert.next);
//		khApp.closeModal();
//		CRHloadPage(APP_cert.next);	//下一步
	}
	
	function fail(){
		gotoNextPage(APP_cert.pre);
//		khApp.closeModal();
//		CRHloadPage(APP_cert.pre);	//上一步
	}
	
	function gotoNextPage(url){
		khApp.showIndicator();
		$$.ajax({
			timeout: 15000,
			type : "POST",
			data : null,
			async : true,
			url : url + "?rnd=" + new Date().getTime(),
			ontimeout:function(){
				khApp.hideIndicator();
				khApp.alert(MESSAGE_TIMEOUT);
			},
			success : function(data) {
				khApp.hideIndicator();
				khApp.closeModal();
				khApp.hidePreloader();
				mainView.loadContent(data);
			},
			error : function(xhr) {
				if(xhr.status == '0'){
					khApp.hideIndicator();
					khApp.alert(MESSAGE_TIMEOUT);
				}else{
					khApp.hideIndicator();
					khApp.alert('出现错误，请稍后再试');
				}
				
			},
		});
	}
	return {
		init: init,
		requestCert:requestCert
	};
});