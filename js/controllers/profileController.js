define(['views/profileView', 'GS'], function (View, GS) {
	
	var APP_profile           = {};
	APP_profile.pre 		  = "/branch";
	APP_profile.next 		  = "/returnAccount.do";
	APP_profile.name          = "";
	APP_profile.code          = "";
	APP_profile.ceraddr       = ""; 
	APP_profile.commaddr      = "";
	APP_profile.postCode      = "";
	APP_profile.careerCode    = "";
	APP_profile.industryCode  = "";
	APP_profile.educationCode = "";
	APP_profile.branchNo      = "";
	APP_profile.branchName      = "";
	APP_profile.recphone      = "";
	APP_profile.recName       = "";
	APP_profile.customerChannelCode   = "";
	APP_profile.brokerIdcard     = "";
	APP_profile.carName       = {};
	APP_profile.induName      = {};
	APP_profile.eduName       = {};
	APP_profile.flowKind      = "";
	APP_profile.qqRequired      = "";
	APP_profile.qq			  = "";
	APP_profile.isQqOrder     = "";
	APP_profile.telphone      = "";
	APP_profile.eMail         = "";
	APP_profile.hyshow         = true;
	APP_profile.openTimes         = 1;
	APP_profile.link_city     = "";
	
	var bindings = [{
		element: '#profile_nav .left',
		event: 'click',
		handler: returnPre
	}];
	
	var afterBindings = [{
		element: '.profile-next-button',
		event: 'click',
		handler: checkSubmitStatus
	},{
		element: '[name=career]',
		event: 'change',
		handler: selectedName
	}, {
		element: 'select[name=link_city]',
		event: 'change',
		handler: selectedCityName
	},{
		element: '[name=industry]',
		event: 'change',
		handler: selectedName
	},{
		element: '[name=education]',
		event: 'change',
		handler: selectedName
	}];
	
	function returnPre(){
		mainView.loadPage("/returnBranch.do?branchNo="+APP_profile.branchNo+"&branchName="+APP_profile.branchName);
		//mainView.hideNavbar();	//隐藏头部导航
	}
	
	function init(v){
		APP_profile.branchNo = v.branchNo?v.branchNo:"";
		APP_profile.branchName = v.branchName? v.branchName:"";
		APP_profile.recphone = v.recphone? v.recphone:"";
		APP_profile.recName = v.recName? v.recName:"";
		APP_profile.customerChannelCode = v.customerChannelCode? v.customerChannelCode:"";
		APP_profile.brokerIdcard = v.brokerIdcard? v.brokerIdcard:"";
		View.init({
			bindings: bindings
		});
		//获取行业职业学历
		 getUserInfo();
		 //是否显示QQ号
		 //View.show(APP_profile.isQqOrder);
	}

	var selectFalg = false;
	function selectedName(){
		selectFalg = false;
	var	options= new Object();
		options.url="#";
		setTimeout(function() {
			if(!selectFalg){
				 $$("body").blur();
				khApp.goBack(khApp.mainView.activePage.view,options);
				selectFalg=true;
			}
		}, 500);
		
	}
	function selectedCityName(){
		selectFalg = false;
		var disp_option_value = "";
		var options = $$("select[name=link_city]").find("option");
		for(var i=0;i<options.length;i++){
			if(options[i].selected) {
				var optgroup  = $$(options[i]).parent("optgroup");
				if(optgroup){
					disp_option_value = optgroup[0].label + options[i].text;
				}
			}
		}
		setTimeout(function() {
			if(!selectFalg){
				khApp.goBack(khApp.mainView.activePage.view,options);
				$$("#cityText").html(disp_option_value);
				selectFalg=true;
			}
		}, 500);
	}

	//获取职业行业学历
	function getUserInfo(){
		khApp.showIndicator();
		$$.ajax({
			url: '/userProfile.do?rnd=' + new Date().getTime(),
			method: 'GET',
			timeout:15000,
			async:true,
			success: function (data) {
				khApp.hideIndicator();
				var data = JSON.parse(data);
				if (data.errorNo == 0) {
					if(data.openTimes ) {
						APP_profile.openTimes = data.openTimes;
					}
					View.render({
						bindings: afterBindings,
						model: data
					});
					//显示扩展字段
					// 全部隐藏
					// $$("#user_ext_val1").hide();
					// $$("#user_ext_val1").remove();
					// $$("#user_ext_val2").hide();
					// $$("#user_ext_val2").remove();
					// $$("#user_ext_val3").hide();
					// $$("#user_ext_val3").remove();

					if(data.hyshow=='invisible'){
						$$("#hy").hide();
						APP_profile.hyshow = false;
					}
					if(data.referralInformationShow=='invisible'){//推荐人信息不显示相关字段默认为空
						APP_profile.recphone      = "";
						APP_profile.recName       = "";
						APP_profile.customerChannelCode   = "";
						APP_profile.brokerIdcard     = "";
					}
					khApp.hideIndicator();

					APP_profile.value = $$("#userprofile").val();
					var strs = new Array();
					strs = APP_profile.value.split(";");
					APP_profile.carName = strs[0];
					APP_profile.careerCode = strs[1];
					APP_profile.eduName = strs[2];
					APP_profile.educationCode = strs[3];
					APP_profile.induName = strs[4];
					APP_profile.industryCode = strs[5];
					if(!APP_profile.branchNo){
						if(strs[6]){
							APP_profile.branchNo = strs[6];
						}else if(APP_profile.branchNo != ""){
							
						}else{
							APP_profile.branchNo = "";
						}
					}
					if(!APP_profile.recphone){
						if(!strs[7]){
							APP_profile.recphone = strs[7];
						}else if(APP_profile.recphone != ""){
							APP_profile.recphone=strs[7];
						}else{
							APP_profile.recphone = "";
						}
					}
					if(!APP_profile.recName){
						if(!strs[8]){
							APP_profile.recName = strs[8];
						}else if(APP_profile.recName != ""){
							APP_profile.recName = strs[8];
						}else{
							APP_profile.recName = "";
						}
					}

					APP_profile.link_city = strs[9];
					$$("#cityText").html(strs[10]);
					$$("#city_no").val(APP_profile.link_city);

					APP_profile.flowKind = data.flowKind;
					APP_profile.qqRequired = data.qqRequired;
					APP_profile.isQqOrder = data.isQqOrder;
					$$("#carText").html(APP_profile.carName);
					$$("#induText").html(APP_profile.induName);
					$$("#eduText").html(APP_profile.eduName);
					//二次开户,身份证与名称不能修改
					if(APP_profile.openTimes == 2) {
						$$("#profile_cid").addClass("disabled");
						$$("#profile_name").addClass("disabled");
					} else {
						$$("#profile_cid").removeClass("disabled");
						$$("#profile_name").removeClass("disabled");
					}
				}else{
				    khApp.alert(data.errorInfo);
				}
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
	
	function nextSubmit(){
		if(isBlank(APP_profile.branchNo)) {
			khApp.alert("您还没有选择营业部，请返回到营业部选择再继续");
			return;
		}
		if (!checkForm()) {
		} else {
			$$(".profile-next-button").addClass('disabled');
			khApp.showIndicator();
			if (typeof(APP_profile.customerChannelCode) == 'undefined') {
				APP_profile.customerChannelCode = "";
			}
			if (typeof(APP_profile.brokerIdcard) == 'undefined') {
				APP_profile.brokerIdcard = "";
			}

			khApp.confirm('请确认提交个人信息', "个人信息确认", function () {
				khApp.showIndicator();
				$$.ajax({
					url: '/validateAllInfo.do?rnd=' + new Date().getTime(),
					method: 'POST',
					timeout: 15000, //超时时间设置，单位毫秒
					data: {
						"name": encodeURI(encodeURI(APP_profile.name)),
						"code": APP_profile.code,
						"ceraddr": encodeURI(encodeURI(APP_profile.ceraddr)),
						"commaddr": encodeURI(encodeURI((APP_profile.commaddr).replace(/[\r\n]/g,""))),
						"postCode": APP_profile.postCode,
						"career": APP_profile.careerCode,
						"education": APP_profile.educationCode,
						"industryCode": APP_profile.industryCode,
						"branchNo": APP_profile.branchNo,
						"refereesMobile": APP_profile.recphone,
						"customerChannelCode": APP_profile.customerChannelCode,
						"link_city" 	: APP_profile.link_city,
						"brokerIdcard": APP_profile.brokerIdcard,
						"refeName": encodeURI(encodeURI(APP_profile.recName)),
						"qq": APP_profile.qq,
						"telphone": APP_profile.telphone,
						"email": APP_profile.eMail,
						// "val1": $$("input[name=val1]").val(),
						// "val2": $$("input[name=val2]").val(),
						// "val3": $$("input[name=val3]").val()
						// 修改 val1 众期货 val2 居间人
						"val1": "众期货",
						"val2": "",
						"val3": ""
					},
					success: function (data) {
						khApp.hideIndicator();
						var data = JSON.parse(data);
						if (data.errorNo === 0) {
							if (APP_profile.flowKind == "3") {
								CRHloadPage('/onlineBank');
							} else {
								CRHloadPage(APP_profile.next);
							}
						} else {
							khApp.hideIndicator();
							$$(".profile-next-button").removeClass('disabled');
							khApp.alert(data.errorInfo);
						}
					},
					error: function (xhr) {
						if(xhr.status == '0'){
							khApp.hideIndicator();
							khApp.closeModal();
							khApp.hidePreloader();
							$$(".profile-next-button").removeClass('disabled');
							khApp.alert(MESSAGE_TIMEOUT);
						}else{
							khApp.hideIndicator();
							khApp.closeModal();
							khApp.hidePreloader();
							$$(".profile-next-button").removeClass('disabled');
							khApp.alert('出现错误，请稍后再试');
						}
					},
					ontimeout: function () {
						khApp.hideIndicator();
						$$(".profile-next-button").removeClass('disabled');
						khApp.alert(MESSAGE_TIMEOUT);
					}
				});
			}, function() {
					$$(".profile-next-button").removeClass('disabled');
					khApp.hideIndicator();
			});
			}
		}
	
	function checkSubmitStatus(){
		
		//验证姓名 
		APP_profile.name = $$("input[name=name]").val();
		if(isBlank(APP_profile.name)){
			$$("input[name=name]").attr("placeholder","姓名不能为空");
			khApp.alert("姓名不能为空");
			return;
		}
		//验证身份证
		APP_profile.code = $$("input[name=cid]").val();
		if(isBlank(APP_profile.code)){
			$$("input[name=cid]").attr("placeholder","身份证号码不能为空");
			khApp.alert("身份证号码不能为空");
			return;
		 }
		khApp.showIndicator();
		$$.ajax({
			url: '/checkSubmitStatus.do?rnd=' + new Date().getTime(),
			method: "POST",
			timeout:15000,
			data:  {
				"name"         : encodeURI(APP_profile.name),
				"code"         : encodeURI(APP_profile.code)
			}, 
			success: function(data){
				var data = JSON.parse(data);
				khApp.hideIndicator();
	   			if(data.errorNo == 0){
	   				if(data.status == "1"){
	   					nextSubmit();
	   				}else if(data.status == "2"){
	   					nextAudit();
	   				}
				}else{
					khApp.alert(data.errorInfo);
				}
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
	
	function nextAudit(){
		if(checkForm()){
		$$(".profile-next-button").addClass('disabled');
		khApp.showIndicator();
		$$.ajax({
			url: '/validateAllInfo.do?rnd=' + new Date().getTime(),
			method: 'POST',
			timeout: 15000, //超时时间设置，单位毫秒
			data: {
				"name"         : encodeURI(encodeURI(APP_profile.name)),
				"code"         : APP_profile.code,
				"ceraddr"      : encodeURI(encodeURI(APP_profile.ceraddr)), 
				"commaddr"     : encodeURI(encodeURI((APP_profile.commaddr).replace(/[\r\n]/g,""))), 
				"postCode"     : APP_profile.postCode,
				"career"       : APP_profile.careerCode,
				"education"    : APP_profile.educationCode,
				"industryCode" : APP_profile.industryCode,
				"branchNo"     : APP_profile.branchNo,
				"refereesMobile" : APP_profile.recphone,
				"customerChannelCode"  : APP_profile.customerChannelCode,
				"brokerIdcard"    : APP_profile.brokerIdcard,
				"link_city" 	: APP_profile.link_city,
				"refeName" : encodeURI(encodeURI(APP_profile.recName)),
				"qq"           : APP_profile.qq,
				"telphone"           : APP_profile.telphone,
				"email"           : APP_profile.eMail
			},
			success: function (data) {
				khApp.hideIndicator();
				var data = JSON.parse(data);
				if (data.errorNo === 0) {
					if(APP_profile.flowKind == "3"){
						CRHloadPage('/audit');
					}else{
						CRHloadPage('/video');
					}
				} else {
					khApp.hideIndicator();
					$$(".profile-next-button").removeClass('disabled');
					khApp.alert(data.errorInfo);
				}
			},
			error: function(){
				if(xhr.status == '0'){
					khApp.hideIndicator();
					khApp.closeModal();
					khApp.hidePreloader();
					$$(".profile-next-button").removeClass('disabled');
					khApp.alert(MESSAGE_TIMEOUT);
				}else{
					khApp.hideIndicator();
					khApp.closeModal();
					khApp.hidePreloader();
					$$(".profile-next-button").removeClass('disabled');
					khApp.alert('出现错误，请稍后再试');
				}
	   		},
	   		ontimeout: function(){
	   			khApp.hideIndicator();
	   			$$(".profile-next-button").removeClass('disabled');
	   			khApp.alert(MESSAGE_TIMEOUT);
	   		}
		});
		}
	}
	
	function checkForm (){
		//验证姓名
		APP_profile.name = $$("input[name=name]").val();
		if(isBlank(APP_profile.name)){
			khApp.alert("姓名不能为空");
			return false;
		} else if(!isUserName(APP_profile.name)){
				//khApp.alert("姓名不符合规范, 只能是中英文与数字");
			    khApp.alert("身份证姓名不符合规范");
				return false;
		}
		//验证身份证
		APP_profile.code = $$("input[name=cid]").val();
		if(isBlank(APP_profile.code)){
			khApp.alert("身份证号码不能为空");
			return false;
		 } else {
			if(!isCardNo(APP_profile.code)){
				khApp.alert("身份证号码格式不正确");
				return false;
			}
		}
		//验证身份证住址 
		/*APP_profile.ceraddr = $$("textarea[name=cidAddr]").val();
		if(isBlank(APP_profile.ceraddr)){
			khApp.alert("身份证住址不能为空");
			 return false;
		}*/
		//验证联系地址
		APP_profile.commaddr = $$("input[name=address]").val();
		if(isBlank(APP_profile.commaddr)){
			khApp.alert("联系地址不能为空");
			 return false;
		}
		//验证邮政编码
		APP_profile.postCode = $$("input[name=postCode]").val();
		if(isBlank(APP_profile.postCode)){
			khApp.alert("邮政编码不能为空");
			return false;
		} else {
			if(!isPostCode(APP_profile.postCode)){
				khApp.alert("邮政编码格式不正确");
				return false;
			}
		}
		
		//验证QQ
		//if(APP_profile.isQqOrder == 1){
		//	APP_profile.qq =$$.trim($$("input[name=qq]").val());
		//	if(APP_profile.qq != null && APP_profile.qq != ""){
		//		if(isNaN(APP_profile.qq)){
		//			$$("input[name=qq]").val("");
		//			khApp.alert("qq格式错误");
		//			return false;
		//		}
		//
		//	}else{//如果不填 在配置要求必填的情况下给出提示
		//		if(APP_profile.qqRequired =="visible"){
		//			khApp.alert("请输入qq号码");
		//			return false;
		//		}
		//
		//	}
		//}
		//验证联系电话
			APP_profile.telphone  = $$("input[name=telephone]").val();
			if(isBlank(APP_profile.telphone)){
				khApp.alert("联系电话不能为空");
				return false;
			}else{
				if(!isTelephone($$.trim(APP_profile.telphone))){
					//$$("input[name=telephone]").val("");
					khApp.alert("联系电话格式错误");
						return false;
					};
			}
		//验证邮箱
			APP_profile.eMail  = $$("input[name=eMail]").val();
			if(!isNull(APP_profile.eMail)){
				if(!isEmail($$.trim(APP_profile.eMail))){
				//$$("input[name=eMail]").val("");
				khApp.alert("邮箱格式错误");
					return false;
				};
			}
		//验证职业
		if(!$$("select[name=career]").val()){
			if(APP_profile.careerCode == null || APP_profile.careerCode + "" == ""){
				khApp.alert('您还没有选择职业');
				return  false;
			}
		}else{
			APP_profile.careerCode = $$("select[name=career]").val();
		}

		//验证行业
		if(APP_profile.hyshow){
		if(!$$("select[name=industry]").val()){
			if(APP_profile.industryCode == null || APP_profile.industryCode+ "" == ""){
				khApp.alert('您还没有选择行业');
				return false;
			}
		}else{
			APP_profile.industryCode = $$("select[name=industry]").val();
		}
		}
		//验证学历
		if(!$$("select[name=education]").val()){
			if(APP_profile.educationCode == null || APP_profile.educationCode+ "" == ""){
				khApp.alert('您还没有选择学历');
				return false;
			}
		}else{
			APP_profile.educationCode = $$("select[name=education]").val();
		}
		//验证城市
		if(!$$("select[name=link_city]").val()){
			if(APP_profile.link_city == null || APP_profile.link_city+ "" == ""){
				khApp.alert('您还没有选择联系省市');
				return;
			}
		}else{
			APP_profile.link_city = $$("select[name=link_city]").val();
		}

		return true;
	}
	

	return {
		init: init
	};
});

