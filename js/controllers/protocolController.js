define(['views/protocolView', 'GS', 'forge.bundle'], function (View, GS, forge) {

	APP_protocol              = {};
	APP_protocol.pre 		  = "/returnKnowledge.do";
	APP_protocol.next 		  = "/returnCallback.do";
	APP_protocol.ProtocalId   = "";
	APP_protocol.controversy  = "";
	APP_protocol.signValue    = "";
	APP_protocol.securityKind = "";
	APP_protocol.flowKind     = "";
	APP_protocol.videoStatus  = "";
	APP_protocol.protocalElem =  {};
	APP_protocol.protocalElemLength = 0;
	APP_protocol.agreementReadNeed = "1" ;
	//已签署协议的个数
	APP_protocol.hasSignSize = 0;
	//证书序列号
	APP_protocol.sn = "";
	
	var bindings = [{
		element: '.account-next-button',
		event: 'click',
		handler: nextSubmit
	},{
		element: '.password-check-button',
		event: 'click',
		handler: submitCertPassword
	},{
		element: '#account',
		event: 'click',
		handler: clearCatch
	}, {
		element: '#agreement',
		event: 'click',
		handler: clickAgreement
	},{
		element: '.protocal-link',
		event: 'click',
		handler: displayProtocal
	}];
	
	//点击同意
	function clickAgreement(){
		var checbox = $$("input[name=agreement]")[0];
		if(!checbox.checked){
			
		}else{
			checkCertPassword();
		}
	}
	
	function clearCatch(){
		APP_protocol.signValue    = "";
		APP_protocol.hasSignSize = 0;
		if(APP_protocol.securityKind==2||APP_protocol.securityKind=="2"){
		}
	}
	
	var selectFalg = false;
	function selectedName(){
		selectFalg = false;
		var	options= new Object();
		options.url="#";
		setTimeout(function() {
			if(!selectFalg){
				khApp.goBack(khApp.mainView.activePage.view,options);
				selectFalg=true;
			}
		}, 500);
		
	}
	
	
	function init() {
		View.init({
			bindings: bindings
		});
		APP_protocol.videoStatus  =  $$("#videoStatus").val();//
		APP_protocol.signValue    = "";
		APP_protocol.hasSignSize = 0;
		findSn();
		//获取协议列表
		getProtocolList();
	}
	// 展示协议内容页
	function displayProtocal() {
		var econtract_id =  $$(this).parent().data("id");
		//设置已阅读
//		$$(this).parent().attr("data-read","1");
		mainView.loadPage('/' + templateName + '/protocal.html?econtract_id='+econtract_id);
//		CRHloadPage('/' + templateName + '/protocal.html?econtract_id='+econtract_id);
	}
	//查sn
	function findSn(){
		$$.ajax({
			url: "/findSn.do?rnd=" + new Date().getTime(),
			type: "POST",
			data:  null,
			success: function(data){
				var data = JSON.parse(data);
				if(data.errorNo =="1"){
					//无证书
					CRHloadPage('/returnCert.do');///returnVideo.do
					return;
				}else if(data.errorNo =="0"){
					//有证书
					CERT.sn = data.sn;
					CERT.verifyLocalSn(CERT.sn);
					return;
				}else{
					CRHloadPage('/returnCert.do');
				}
			}
		});
	}


	//获取协议列表
	function getProtocolList(){
		$$.ajax({
			url: '/getProtocolList.do?rnd=' + new Date().getTime(),
			method: 'GET',
			timeout:15000,
			success: function (data) {
				var data = JSON.parse(data);
				khApp.hideIndicator();
				if (data.errorNo === 0) {
					APP_protocol.sn = data.sn;
					APP_protocol.securityKind = data.securityKind;
					APP_protocol.flowKind = data.flowKind;
					View.render({
						bindings: bindings,
						model: data
					});
				}else{
				    khApp.alert(data.errorInfo);
				}
			},
			error: function(){
	   			khApp.alert(MESSAGE_TIMEOUT);
	   		},
	   		timeout: function(){
	   			khApp.alert(MESSAGE_TIMEOUT);
			}
		});
	}

	function nextSubmit() {
		khApp.showIndicator();

		var checbox = $$("input[name=agreement]")[0];
		if(!checbox.checked){
			khApp.alert("请仔细阅读并同意签署以上协议");
			return;
		}
		//检查是否已经强制阅读协议
		if(APP_protocol.agreementReadNeed == "1"){
			var agreementList = $$("#agreementList li");
			for(var i = 0; i < agreementList.length; i++) {
				var obj = $$(agreementList[i]);
				var read = obj.data("read");
				if(read == "0") {
					khApp.alert("请务必阅读【"+ obj.data("name")+"】");
					return;
				}
			}
		}

		$$(".account-next-button").addClass('disabled');
		//对协议进行签名
		APP_protocol.protocalElem = $$("#protocal li");
		APP_protocol.protocalElemLength = APP_protocol.protocalElem.length;//需要签名数量
		if(APP_protocol.protocalElemLength > 0){
			for(var i=0;i<APP_protocol.protocalElemLength;i++){
				var obj = $$(APP_protocol.protocalElem[i]);
				var agreementNo = obj.data("id");
				var value = obj.data("md5");
				//有值才签名
				if(agreementNo && value) {
					// CERT.sign(APP_protocol.sn,value,"APP_protocol.certSignCallBack");
					// APP_protocol.certSignCallBack(0, '', APP_protocol.signOneFile(value));
					if (browser.versions.ios) {
		                APP_protocol.certSignCallBack(0, '', APP_protocol.signOneFile(value));
		            }else if (browser.versions.android) {
		                CERT.sign(APP_protocol.sn,value,"APP_protocol.certSignCallBack");
		            }
					break;
				}
			}
		}
	}

	APP_protocol.signOneFile = function(src){
		khApp.showIndicator();
		
		var sn = localStorage.sn;
	    var p7cert = localStorage.cert;

	    // 获取 privateKey
	    var privateKey = forge.pki.privateKeyFromPem(localStorage.pemPrivateKey);
	    
	    // p7cert 获取证书
	    p7cert = "-----BEGIN PKCS7-----\n" + p7cert + "\n-----END PKCS7-----\n";
	    var p7 = forge.pkcs7.messageFromPem(p7cert);
//	    console.log(p7.certificates);
	    var certPublicKey; // 公钥证书
	    for(var i=0; i<p7.certificates.length; i++){
	        var cert = p7.certificates[i];
	        var attrs = cert.subject.attributes;
	        for(var j=0; j<attrs.length; j++){
	            if(attrs[j].name == "commonName" && attrs[j].value.substring(0,4) != "ROOT"){
	                certPublicKey = p7.certificates[i];
//	                console.log("commonName");
	                break;
	            }
	        }
	    }

	    // 生成 pkcs7SignedData
	    var pkcs7SignedData = forge.pkcs7.createSignedData();
	    pkcs7SignedData.content = forge.util.createBuffer(src, 'utf8');
	    pkcs7SignedData.addCertificate(certPublicKey);
	    pkcs7SignedData.addSigner({
	        key: privateKey,
	        certificate: certPublicKey,
	        digestAlgorithm: forge.pki.oids.sha1,
	        authenticatedAttributes: [{
	          type: forge.pki.oids.contentType,
	          value: forge.pki.oids.data
	        }, {
	          type: forge.pki.oids.signingTime,
              value: new Date()
	          // value will be auto-populated at signing time
	        }, {
	          type: forge.pki.oids.messageDigest
	          // value can also be auto-populated at signing time
	          
	        }]
	    });
	    pkcs7SignedData.sign();
	    var pem = forge.pkcs7.messageToPem(pkcs7SignedData);
	    var rMessage = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g;
	    var match = rMessage.exec(pem);
//        console.log(pem);
	    console.log(match[3]);
       var bytes = forge.util.decode64(match[3]);
       
       var byteBuffer = new forge.util.ByteBuffer();
       var outByteBuffer = new forge.util.ByteBuffer();
       byteBuffer.putBytes(bytes);
       var flag = 0;
       var eocPos = 56;
       for(var i=0; i<byteBuffer.data.length; i++){
       var x = byteBuffer.getByte();
           if(i == 1 || i == 16 || i == 20  || i == 40 || i == 53){
                x = 0x80;
           }else if(i == 2 || i == 3 || i == 17 || i == 18 || i == 21 || i == 22){
                continue;
           }else if(i == 54){
                eocPos += (x * 256);
                continue;
           }else if(i == 55){
                eocPos += x;
                flag = 1;
                continue;
           }else if(i == 51){
                outByteBuffer.putByte(x);
                x = 0x00;
                outByteBuffer.putByte(x);
           }else if(flag == 1 && i == (eocPos-1)){
                console.log(eocPos-1);
                outByteBuffer.putByte(x);
                x = 0x00;
                outByteBuffer.putByte(x);
                flag = 0;
           }
            outByteBuffer.putByte(x);
       }
       for(var j = 0; j < 6; j++){
            outByteBuffer.putByte(0x00);
       }
//       console.log(forge.util.encode64(outByteBuffer.data));
	    return forge.util.encode64(outByteBuffer.data);
	}

	//签名回调方法
	APP_protocol.certSignCallBack = function(errorNo, errorInfo, signValue){
       khApp.showIndicator();
		if(errorNo == 0) {
			var obj_temp = $$(APP_protocol.protocalElem[APP_protocol.hasSignSize]);
			if(APP_protocol.signValue == ""){
				APP_protocol.signValue += obj_temp.data("id") + ";" + obj_temp.data("md5") + ";" + signValue;
			}else{
				APP_protocol.signValue += "|" + obj_temp.data("id") + ";" + obj_temp.data("md5") + ";" + signValue;
			 }
			console.log("APP_protocol.sn="+ APP_protocol.sn + ",signValue=" + APP_protocol.signValue);
			APP_protocol.hasSignSize ++;
			//进行循环签名
			if(APP_protocol.hasSignSize != APP_protocol.protocalElemLength){
				if(APP_protocol.hasSignSize < APP_protocol.protocalElemLength){
					var obj = $$(APP_protocol.protocalElem[APP_protocol.hasSignSize]);
					var agreementNo = obj.data("id");
					var value = obj.data("md5");
					//签名
					if(agreementNo && value) {
						// CERT.sign(APP_protocol.sn,value,"APP_protocol.certSignCallBack");
						// APP_protocol.certSignCallBack(0, '', APP_protocol.signOneFile(value));
						if (browser.versions.ios) {
			                APP_protocol.certSignCallBack(0, '', APP_protocol.signOneFile(value));
			            }else if (browser.versions.android) {
			                CERT.sign(APP_protocol.sn,value,"APP_protocol.certSignCallBack");
			            }
					}
				}else{
					//出现提示框之后
					$$(".account-next-button").removeClass('disabled');
					khApp.hideIndicator();
					khApp.alert("提交失败，请重试",function(){
						CRHloadPage('/protocol');
						APP_protocol.agreementReadNeed='0';
					});
				}
			} else {
				//保存到数据
				signProtocol();
			}
		} else {
			/*if(errorNo == -3){
				khApp.alert("未找到数字证书，请重新下载数字证书");
			}
			if(errorNo == -2){
				khApp.alert("开户协议签名出错，请确认是否正确安装数字证书");
			}
			if(errorNo == -1){
				khApp.alert("数字证书出错，请确认是否正确输入数字证书密码");
			}*/
			$$(".account-next-button").removeClass('disabled');
			khApp.hideIndicator();
			khApp.confirm("未找到数字证书，请重新下载数字证书", function() {
//				CRHloadPage('/returnCert.do');
				CRHloadPageWithPar('/returnVideo.do','cert');
			});
		}
	 }
	
	//校验证书密码
	function checkCertPassword(){
		if(APP_protocol.flowKind == "3"){
			khApp.showIndicator();
			$$(".account-next-button").addClass('disabled');
			$$.ajax({
				url: '/checkCertPassword.do?rnd=' + new Date().getTime(),
				method: "POST",
				timeout:15000,
				data:  {}, 
				success: function(data){
					var data = JSON.parse(data);
					khApp.hideIndicator();
		   			if(data.errorNo == 0){
		   				$$(".account-next-button").removeClass('disabled');
					}else{
						//显示密码页面
						View.showCertPassword();
					}
		   		},
				error: function(){
		   			khApp.hideIndicator();
					$$(".account-next-button").removeClass('disabled');
		   			khApp.alert(MESSAGE_TIMEOUT);
		   		},
		   		timeout: function(){
		   			khApp.hideIndicator();
		   			$$(".account-next-button").removeClass('disabled');
		   			khApp.alert(MESSAGE_TIMEOUT);
				}
			});
		}else{
			
		}
	}
	//提交数字证书密码
	function submitCertPassword(){
		var password = $$("#certcode").val();
		if(password == ""){
			khApp.alert("密码为空，请确认输入");
			return false;
		}
		
		khApp.showIndicator();
		$$(".password-check-button").addClass('disabled');
		$$.ajax({
			url: '/checkCertPassword.do?rnd=' + new Date().getTime(),
			method: "POST",
			timeout:15000,
			data:  {"checkPassword":password}, 
			success: function(data){
				var data = JSON.parse(data);
				khApp.hideIndicator();
	   			if(data.errorNo == 0){
	   				View.showAccountList();
	   				$$(".account-next-button").removeClass('disabled');
				}else{
					khApp.hideIndicator();
					$$(".password-check-button").removeClass('disabled');
		   			khApp.alert(data.errorInfo);
				}
	   		},
			error: function(){
	   			khApp.hideIndicator();
				$$(".password-check-button").removeClass('disabled');
	   			khApp.alert(MESSAGE_TIMEOUT);
	   		},
	   		timeout: function(){
	   			khApp.hideIndicator();
	   			$$(".password-check-button").removeClass('disabled');
	   			khApp.alert(MESSAGE_TIMEOUT);
			}
		});
		
	}
	
	function signProtocol(){
		khApp.showIndicator();
		$$(".account-next-button").addClass('disabled');
		$$.ajax({
			url: '/signProtocol.do?rnd=' + new Date().getTime(),
			method: "POST",
			timeout:15000,
			data:  {
				"signValue"    : APP_protocol.signValue,
				"cert_sn"      : APP_protocol.sn
			},
			success: function(data){
				var data = JSON.parse(data);
				khApp.hideIndicator();
                console.log("success errorNo : " + data.errorNo);
	   			if(data.errorNo === 0){
	   				if(APP_protocol.securityKind==2){//期货
						mainView.loadPage(APP_protocol.next);
	   				}
				}else{
					$$(".account-next-button").removeClass('disabled');
				    khApp.alert(data.errorInfo);
				}
	   		},
			error: function(){
	   			khApp.hideIndicator();
                console.log("error ");
				$$(".account-next-button").removeClass('disabled');
	   			khApp.alert(MESSAGE_TIMEOUT);
	   		},
	   		timeout: function(){
	   			khApp.hideIndicator();
	   			$$(".account-next-button").removeClass('disabled');
	   			khApp.alert(MESSAGE_TIMEOUT);
			}
		});
	}
	
	function getSignValue(text){
		var signValue = "";
		$$.ajax({
			url: '/getSignValue.do?rnd=' + new Date().getTime(),
			method: "POST",
			timeout:15000,
			async:false, 
			data:  {
				"sn":APP_protocol.sn,
				"text":text
			}, 
			success: function(data){
				var data = JSON.parse(data);
	   			if(data.errorNo == 0){
	   				signValue = data.signValue;
				}
	   		}
		});
		return signValue;
	}


	/****
	 * 检测本地SN码回调方法
	 * @param {Object} sn; sn=-10 不存在sn文件；-1 异常；-2 异常；
	 */
	CERT.checkLocalSnCallBack = function(sn){
		//如果本地没有SN则跳转到验证用户信息页面
		if(sn==-10 || sn==-2){
			if(APP_protocol.videoStatus==1){
				CRHloadPage('/cert');
			}else{
				khApp.modal({
					title : "系统提示",
					text : "未找到数字证书，请先视频验证之后重新下载数字证书",
					buttons : [ {
						text :"确定",
						onClick : function() {
							CRHloadPageWithPar('/returnVideo.do','cert');
						}
					} ]
				});
				//CRHloadPageWithPar('/returnVideo.do','cert');
			}
//			CRHloadPage('/returnVideo.do');//MadeByHJL
		}
	}
	function setProtocalRead(index){
		var agreementList = $$("#agreementList li");
		if(index.econtract_id){
			for(var i = 0; i < agreementList.length; i++) {
				var obj = $$(agreementList[i]);
				var id = obj.data("id");
				if(index.econtract_id == id){
					obj.attr("data-read","1");
					break;
				}
			}
		}
		console.log(index+'--');
	}
	return {
		init: init,
		setProtocalRead:setProtocalRead
	};
});

