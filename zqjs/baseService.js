var InstrumentManager = (function () {
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

    var content_data = null;
    var content = {
        map_product_id_future: {},
        map_py_future: {},
    };

    function send() {
        WS.send({
            aid: "subscribe_quote",
            ins_list: InstrumentManager.getMainInsList().concat(InstrumentManager.getCustomInsList()).join(',')
        });
    }

    // 非异步读取合约 JSON
    var getJsonDataAsync = function () {
        var response = null;
        $.ajax({
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            type: 'GET',
            url: SETTING.symbol_server_url,
            dataType: 'json',
            async: false,
            success: function (data) {
                response = data;
            },
            error: function () {
                alert('下载合约列表失败，请检查网络后重试。')
            }
        });
        return response;
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
        content_data = getJsonDataAsync();

        for (var symbol in content_data) {
            var item = content_data[symbol];

            if (item.expired || item.class === 'FUTURE_OPTION' || item.class === 'FUTURE_COMBINE') {
                delete content_data[symbol];
                continue;
            }
            if (typeof SymbolFilter === 'function' && !SymbolFilter(symbol, item)) {
                delete content_data[symbol];
                continue;
            }
            if (item.class === 'FUTURE' && ins_list[item.exchange_id]) {
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
            } else if (item.class === 'FUTURE_CONT' || item.class === 'FUTURE_INDEX') {
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
            } else if (item.class === 'INDEX' && ins_list[item.exchange_id]) {
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
                }
            }
        }
    }

    /**
     * [getInstrumentById description]
     * @param  {[type]} insid [description]
     * @return {Object}
     * {    exchange_id:
     *      class:
     *      ins_id:
     *      simple_name:
     *      volume_multiple: 合约乘数
     *      price_tick: 最小报价单位
     *      price_fixed: 保留小数位数
     *      expire_date: 到期日
     * }
     */
    function getInstrumentById(insid) {
        var insObj = {};
        insObj.exchange_id = content_data[insid].exchange_id;
        insObj.class = content_data[insid].class;
        insObj.volume_multiple = content_data[insid].volume_multiple;
        insObj.price_tick = content_data[insid].price_tick;
        insObj.price_fixed = content_data[insid].price_decs;
        insObj.ins_id = content_data[insid].ins_id;
        insObj.simple_name = content_data[insid].ins_name;
        if (content_data[insid].class === 'FUTURE') {
            insObj.ins_id = content_data[insid].ins_id;
            insObj.simple_name = content_data[insid].product_short_name;
            insObj.expire_date = formatDate(content_data[insid].expire_datetime * 1000);
            insObj.margin = content_data[insid].margin;
            insObj.commission = content_data[insid].commission;
            var trading_time_str = '';
            if (content_data[insid].trading_time && content_data[insid].trading_time.night) {
                var night = content_data[insid].trading_time.night[0];
                trading_time_str += night[0].slice(0, 5) + '-';
                var endtime = night[1].slice(0, 5);
                var hm = endtime.split(':');
                var h = hm[0];
                var m = hm[1];
                if (h > 24) {
                    endtime = ('' + (h - 24)).padStart(2, '0') + ':' + m;
                }
                trading_time_str += endtime;
                trading_time_str += ',';
            }
            if (content_data[insid].trading_time && content_data[insid].trading_time.day) {
                var day = content_data[insid].trading_time.day;
                for (var i = 0; i < day.length; i++) {
                    trading_time_str += day[i][0].slice(0, 5) + '-' + day[i][1].slice(0, 5);
                    trading_time_str += i < day.length - 1 ? ',' : '';
                }
            }
            insObj.trading_time = trading_time_str;
        } else if (content_data[insid].class === 'FUTURE_CONT' || content_data[insid].class === 'FUTURE_INDEX') {
            insObj.ins_id = content_data[insid].underlying_product;
            insObj.simple_name = content_data[insid].ins_name;
            insObj.expire_date = '';
            insObj.margin = '';
            insObj.commission = '';
            insObj.trading_time = '';
        }

        return insObj;
    }

    /**
     * 格式化日期
     */
    function formatDate(int) {
        var d = new Date(int);
        var str = '' + d.getFullYear();
        str += (1 + d.getMonth() + '').padStart(2, '0');
        str += (d.getDate() + '').padStart(2, '0');
        return str;
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

    function getInsListByInput(input) {
        // 优先匹配 合约 Id
        if (input == undefined || input == '') {
            return [];
        } else if (content.map_product_id_future[input]) {
            return content.map_product_id_future[input];
        }
        // 再匹配 拼音
        return getInsListByPY(input);
    }

    function getInsListByPY(input_py) {
        // TODO 数字 字母分开匹配
        for (var py in content.map_py_future) {
            if (py.indexOf(input_py) > -1) {
                return content.map_py_future[py]
            }
        }
        return [];
    }

    function getCustomInsList() {
        var s = localStorage.getItem('CustomList');
        return s == '' ? [] : s.split(',');
    }

    function setCustomInsList(str) {
        localStorage.setItem('CustomList', str);
        DM.update_data({
            state: {
                custom_ins_list: str
            }
        });
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
    return {
        data: content_data,
        getInstrumentById: getInstrumentById,
        getInsListByType: getInsListByType,
        getProductListByType: getProductListByType,
        getMainInsList: getMainInsList,
        getInsSNById: getInsSNById,
        getInsListByInput: getInsListByInput,
        getInsListByPY: getInsListByPY,
        getCustomInsList: getCustomInsList,
        addCustomInsList: addCustomInsList,
        addCustomIns: addCustomIns,
        delCustomIns: delCustomIns,
        isCustomIns: isCustomIns
    }
})();
