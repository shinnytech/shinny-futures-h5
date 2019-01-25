var tqsdk = new TQSDK({
    symbolsServerUrl: SETTING.symbol_server_url,
    wsQuoteUrl: SETTING.sim_server_url,
    wsTradeUrl: SETTING.tr_server_url,
    reconnectInterval: SETTING.reconnect_interval,
    reconnectMaxTimes: SETTING.reconnect_max_times,
    prefix: 'h5'
})

tqsdk.on('error', function(e){
    Toast.alert('获取合约列表失败，请检查网络后刷新页面。')
})

var InstrumentManager = null

tqsdk.on('ready', function (){
    var content_data = tqsdk.quotesInfo;

    var ins_list = {
        'main': []
    };
    var product_list = {
        'main': []
    };
    for (var i = 0; i < CONST.inslist_types.length; i++) {
        var id = CONST.inslist_types[i].id
        ins_list[id] = [];
        product_list[id] = [];
    }
    
    var content = {
        map_product_id_future: {},
        map_py_future: {},
    };

    function send() {
        tqsdk.subscribe_quote(InstrumentManager.getMainInsList().concat(InstrumentManager.getCustomInsList()))
    }

    /**
     * init
     * localStorage.CustomList = ''
     * 请求 JSON -> content
     */

    var init = function () {
        if (localStorage.getItem('CustomList') === null) {
            localStorage.setItem('CustomList', '');
        }

        for (var symbol in content_data) {
            var item = content_data[symbol];

            if (item.class === 'FUTURE_OPTION' || item.class === 'FUTURE_COMBINE') {
                delete content_data[symbol];
                continue;
            }
            if (typeof SymbolFilter === 'function' && !SymbolFilter(symbol, item)) {
                delete content_data[symbol];
                continue;
            }
            if (!item.expired && item.class === 'FUTURE' && ins_list[item.exchange_id]) {
                ins_list[item.exchange_id].push(symbol);
                var product_id = content_data[symbol].product_id;
                if (!content.map_product_id_future[product_id]) content.map_product_id_future[product_id] = [];
                content.map_product_id_future[product_id].push(symbol);
                var pylist = content_data[symbol].py.split(',');
                for (var i in pylist) {
                    var py = pylist[i];
                    if (!content.map_py_future[py]) content.map_py_future[py] = [];
                    content.map_py_future[py].push(symbol);
                }
            } else if (!item.expired && item.class === 'FUTURE_CONT' || item.class === 'FUTURE_INDEX') {
                // 主力合约不显示 主力连续 和 指数
                // ins_list['main'].push(symbol);
                var match = symbol.match(/@(.*)\.(.*)/);
                var ex = match[1];
                var product_id = match[2];
                if (ins_list[ex]) {
                    ins_list[ex].push(symbol);
                    if (item.class === 'FUTURE_CONT') {
                        var s = content_data[symbol].underlying_symbol;
                        if (s && content_data[s]) ins_list['main'].push(content_data[s].instrument_id);
                    }
                    // 为主连和指数修改 ins_id, 用于quotes 显示
                    content_data[symbol].ins_id = product_id + (content_data[symbol].class === 'FUTURE_CONT' ? '主连' : '指数');
                }
            } else if ( !item.expired && item.class === 'INDEX' && ins_list[item.exchange_id]) {
                ins_list[item.exchange_id].push(symbol);
            } 
        }

        for (var symbol in content_data) {
            var item = content_data[symbol];
            // 为主连和指数补充  product_id, product_short_name
            if (item.class === 'FUTURE_CONT' || item.class === 'FUTURE_INDEX') {
                var product_id = symbol.match(/@(.*)\.(.*)/)[2];
                item.product_id = product_id;
                if (content.map_product_id_future[product_id] && content.map_product_id_future[product_id][0]){
                    var product_short_name = content_data[content.map_product_id_future[product_id][0]].product_short_name;
                    item.product_short_name = product_short_name;
                } else {
                    item.product_short_name = '';
                }
            }
        }
        for (var list_name in ins_list) {
            if (ins_list[list_name] instanceof Array) {
                ins_list[list_name].sort(function (a, b) {
                    var diff = content_data[a].sort_key - content_data[b].sort_key;
                    if (diff === 0) diff = a > b ? 1 : -1;
                    return diff;
                });
            }
        }
        for(var list_name in ins_list){
            for(var i =0 ; i<ins_list[list_name].length; i++){
                var symbol = ins_list[list_name][i];
                if(content_data[symbol].class === 'FUTURE_INDEX' && product_list[list_name].indexOf(symbol) < 0){
                    product_list[list_name].push(symbol);
                } else if(content_data[symbol].class === 'INDEX') {
                    var product_id = content_data[symbol].product_id;
                    var hasProductid = product_list[list_name].some(function(item){
                        return product_id === content_data[item].product_id
                    })
                    if (!hasProductid){
                        product_list[list_name].push(symbol);
                    }
                }
            }
        }
    }

    /**
     * [getInsListByType description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function getInsListByType(type) {
        return ins_list[type];
    }

    function getProductListByType(type) {
        if(type == 'custom') return [];
        return product_list[type];
    }

    function getMainInsList() {
        return getInsListByType('main');
    }

    /**
     * [getInsSNById description]
     * @param  {[type]} insid [description]
     * @return {[type]}       [description]
     */
    function getInsSNById(insid) {
        if (content_data[insid].class === 'FUTURE') {
            return content_data[insid] ? content_data[insid].product_short_name : '';
        } else if (content_data[insid].class === 'FUTURE_CONT' || content_data[insid].class === 'FUTURE_INDEX') {
            return content_data[insid] ? content_data[insid].ins_name : '';
        }
    }

    function getCustomInsList() {
        var s = localStorage.getItem('CustomList');
        return s == '' ? [] : s.split(',');
    }

    function setCustomInsList(str) {
        localStorage.setItem('CustomList', str);
        tqsdk.update_data({
            state: {
                custom_ins_list: str
            }
        })
        send();
    }

    function addCustomInsList(insList) {
        var list = getCustomInsList();
        for (var i = 0; i < insList.length; i++) {
            if (list.indexOf(insList[i]) < 0) {
                list.push(insList[i]);
            }
        }
        setCustomInsList(list.join(','));
        return list;
    }

    function addCustomIns(insid) {
        var list = getCustomInsList();
        if (list.indexOf(insid) < 0) {
            list.push(insid);
            setCustomInsList(list.join(','));
        }
        return list;
    }

    function delCustomIns(insid) {
        var list = getCustomInsList();
        var index = list.indexOf(insid);
        if (index > -1) {
            list.splice(index, 1);
            setCustomInsList(list.join(','));
        }
        return list;
    }

    function isCustomIns(insid) {
        return localStorage.getItem('CustomList').indexOf(insid) > -1;
    }

    init();
    InstrumentManager = {
        data: content_data,
        getInsListByType: getInsListByType,
        getProductListByType: getProductListByType,
        getMainInsList: getMainInsList,
        getInsSNById: getInsSNById,
        getCustomInsList: getCustomInsList,
        addCustomInsList: addCustomInsList,
        addCustomIns: addCustomIns,
        delCustomIns: delCustomIns,
        isCustomIns: isCustomIns
    }
})

