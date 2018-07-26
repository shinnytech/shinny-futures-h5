(function () {
    var config = {
        evn: 'test',
        url: 'http://ins.shinnytech.com/publicdata/latest.json'
    }

    // regex to instrument_id
    // 有且只有一组 /(1-n个字母)+(1-n个数字)/
    var reg_future = /^(\D+)(\d+)$/;

    var content = null;

    // main_ins_list - 主力合约列表
    // future_list - 期货合约代码
    // map_py_future - 拼音到 inside 对应 map

    function send() {
        WS.send({
            aid: "subscribe_quote",
            ins_list: InstrumentManager.getMainInsList().concat(InstrumentManager.getCustomInsList()).join(',')
        });

    }

    /**
     * initSubContent 
     *
     * 读取 content 属性:
     *  --> main_ins_list {Array} 主力合约列表
     *  --> future_list {Array} 期货合约代码
     *  --> map_py_future {Object} 拼音到 inside 对应 map
     * 
     * 每个属性只在第一次使用时初始化一次，以后直接读取
     *
     * TODO: 检查错误属性名称
     * 
     * @param  {String} sub [属性名称]
     * @return {Object} content[sub] [返回属性值]
     */
    function initSubContent(sub) {
        if (content[sub]) return content[sub];
        switch (sub) {
        case 'main_ins_list':
            var InsList = content.active.split(',');
            for (var i = 0; i < InsList.length; i++) {
                if (!reg_future.test(InsList[i])) {
                    // 若不匹配 instrument_id 从数组中删除
                    InsList.splice(i--, 1);
                }
            }
            content.main_ins_list = InsList;
            break;
        case 'future_list':
            content.future_list = Object.getOwnPropertyNames(content.data.future);
            break;
        case 'map_py_future':
            content.map_py_future = {};
            for (var ins in content.data.future) {
                var py = content.data.future[ins].n.py;
                if (py) {
                    content.map_py_future[py] = ins;
                }
            }
            break;
        default:
            break;
        }
        return content[sub];
    }

    /**
     * isFuture 
     * 判断 合约品种 是否存在
     * @param  { String }  ins 合约品种代码
     * @return {Boolean} 
     */
    function isFuture(ins) {
        if (!content.future_list) {
            initSubContent('future_list');
        }
        return content.future_list.indexOf(ins) < 0 ? false : true;
    }

    // 非异步读取合约 JSON
    var getJsonDataAsync = function () {
        var result;
        $.ajax({
            type: 'GET',
            url: config.url,
            dataType: 'json',
            async: false,
            success: function (data) {
                result = data;
            }
        });
        return result;
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
        content = getJsonDataAsync();
    }

    window.InstrumentManager = {
        init: init
    };

    window.InstrumentManager.init();
    window.InstrumentManager.getInstrumentById = getInstrumentById;
    window.InstrumentManager.getInsListByType = getInsListByType;
    window.InstrumentManager.getMainInsList = getMainInsList;
    window.InstrumentManager.getInsSNById = getInsSNById;
    window.InstrumentManager.getInsNameById = getInsNameById;
    window.InstrumentManager.getInsListByInput = getInsListByInput;
    window.InstrumentManager.getInsListByPY = getInsListByPY;

    window.InstrumentManager.getCustomInsList = getCustomInsList;
    window.InstrumentManager.addCustomInsList = addCustomInsList;
    window.InstrumentManager.addCustomIns = addCustomIns;
    window.InstrumentManager.delCustomIns = delCustomIns;
    window.InstrumentManager.isCustomIns = isCustomIns;


    /**
     * [getInstrumentById description]
     * @param  {[type]} insid [description]
     * @return {Object} 
     * {   simple_name: 
     *     volume_multiple: 合约乘数
     *     price_tick: 最小报价单位
     *     price_fixed: 保留小数位数
     *     expire_date: 到期日
     * }
     */
    function getInstrumentById(insid) {
        var insObj = {};
        var ins_name = insid.match(reg_future)[1];
        insObj.simple_name = content.data.future[ins_name].n.sn;
        insObj.volume_multiple = content.data.future[ins_name].n.vm;
        insObj.price_tick = content.data.future[ins_name].n.ptick;
        insObj.price_fixed = getFixedNumber(Number(insObj.price_tick));
        insObj.expire_date = content.data.future[ins_name].Ins[insid].d.slice(0, 8);
        return insObj;
    }

    /**
     * 获取小数位数
     * @param  {Number} num [description]
     * @return {Number} 小数位数
     */
    function getFixedNumber(num) {
        var index = 0;
        while (num < 1) {
            index++;
            num *= 10;
        }
        return index;
    }

    /**
     * [getInsListByType description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function getInsListByType(type) {
        if (type == 'main') {
            return initSubContent('main_ins_list');
        }
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
        var matchResult = insid.match(reg_future);
        return isFuture(matchResult[1]) ? content.data.future[matchResult[1]].n.sn : '';
    }


    function getInsNameById(insid) {
        var matchResult = insid.match(reg_future);
        return isFuture(matchResult[1]) ? content.data.future[matchResult[1]].n.sn + matchResult[2] : '';
    }

    function getInsListByInput(input) {
        // 优先匹配 合约 Id
        if (input == undefined || input == '') {
            return [];
        } else if (isFuture(input)) {
            return Object.getOwnPropertyNames(content.data.future[input].Ins);
        }
        // 再匹配 拼音
        return getInsListByPY(input);
    }

    function getInsListByPY(py) {
        // TODO 数字 字母分开匹配
        if (!content.map_py_future) {
            initSubContent('map_py_future');
        }
        var result = [];
        for (var map_py in content.map_py_future) {
            var map_py_list = map_py.split(',');
            for (var i = 0; i < map_py_list.length; i++) {
                if (map_py_list[i].indexOf(py) > -1) {
                    var list = content.data.future[content.map_py_future[map_py]].Ins;
                    for (var k in list) {
                        result.push(k);
                    }
                    break;
                }
            }
        }
        return result;
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
})();
