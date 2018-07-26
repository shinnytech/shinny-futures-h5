define([], function () {
	var typeData = [
		{type: '1', name: 'kh', title: '新开户', explain: '我是新入市投资者，还没有股东账户'},
		{type: '3', name: 'zh', title: '转户', explain: '我已有股东账户，已撤销指定交易和完成转托管'},
		{type: '5', name: 'lch', title: '理财户', explain: '无论有没有在其他券商开立股东账户，都可开立理财户'}

	];
//	//MadeByHJL  期货公司名称
//	var broker_name = window.brokerName;
	if(securityFlowKind=="2"){
		typeData = [
		    		{type: '9', name: 'kh', title: '期货开户', explain: '我是新入市投资者，还没有期货账户'},//original title:'期货开户'
		    	];
	}
	//End 
	var typeArray = window.appParams.openType;
	var currentTypeData = [];

	for (var i = 0; i < typeArray.length; i++) {
		for (var j = 0; j < typeData.length; j++) {
			if (typeArray[i] === typeData[j].type) {
				currentTypeData.push(typeData[j]);
			}
		}
	}

	function getCurrentTypeData() {
		return currentTypeData;
	}

	function getTypeData(type) {
		for (var i = 0; i < typeData.length; i++) {
			if (type === typeData[i].type) {
				return typeData[i];
			}
		}
	}

	function setStartPage() {
		if(!brokerId  || brokerId  == "noBroker") {
			return '/'+templateName+'/broker.html?type=9';
		}
		if( typeData.length==1){
			 return '/register?type=' +typeData[0].type;
		}else {
				return '/register?type=1';
		}
		
	}

	return {
		getCurrentTypeData: getCurrentTypeData,
		getTypeData: getTypeData,
		setStartPage: setStartPage
	};
});
