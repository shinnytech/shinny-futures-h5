function draw_page_posdetail() {
    if (DM.get_data("state.page") == "posdetail") {
        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');
        var subpage = DM.get_data("state.subpage");
        DM.run(draw_page_posdetail_chart);
        DM.run(draw_page_posdetail_info);
        DM.run(draw_page_posdetail_discuss); 
        DM.run(draw_page_posdetail_plan);
        DM.run(draw_page_posdetail_tools);
    }
}

function get_panels_content(insid, fixed){
    /* content = [
    *     {
    *         id: 'positions',
    *         backgroundColor: "#f00",
    *         color: "#fff",
    *         datas:  {
    *             1234: ['3@1234','3@1234']
    *         }
    *     },{
    *         id: 'orders',
    *         backgroundColor: "#ff0",
    *         color: "#000",
    *         datas: {
    *           ‘2345’ ： [{
    *               text: '2@1234',
    *               backgroundColor: '',
    *               color: ''
    *           }, ... ]
    *       }
    *     },
    * ]
    * */
    var content = [{
        id: "positions",
        datas: {}
    }, {
        id: 'orders',
        datas: {}
    }];
    var posList = DM.get_data("instruments." + insid + ".pos_list");
    if (posList) {
        posList = posList.split(',');
        for (var i = 0; i < posList.length; i++) {
            var pos = DM.get_data("positions." + posList[i]);
            var pos_p = pos.open_price.toFixed(fixed)
            if (content[0].datas[pos_p] == undefined) {
                content[0].datas[pos_p] = [];
            }
            content[0].datas[pos_p].push({
                text: pos.volume + '@' + pos.open_price.toFixed(fixed),
                backgroundColor: pos.direction == 'BUY'? 'red' : 'green',
                color: '#fff'
            });
            if (pos.orders && pos.orders != null) {

                for (var order in pos.orders) {
                    if (pos.orders[order].order_id == null) continue;
                    var p = pos.orders[order].price.toFixed(fixed);
                    if (content[1].datas[p] == undefined) {
                        content[1].datas[p] = [];
                    }
                    content[1].datas[p].push({
                        text: pos.orders[order].volume_left + '@' + p,
                        backgroundColor: 'yellow',
                        color: '#fff'
                    });
                }
            }
        }
    }
    return content;
}

function draw_page_posdetail_chart() {
    var chart_container = document.querySelector('div.chart.container');
    var width = chart_container.clientWidth;
    var height = chart_container.clientHeight;

    var chart_id = DM.get_data('state.chart_id');
    var chart_interval = DM.get_data('state.chart_interval');
    var insid = DM.get_data('charts.' + chart_id + '.state.ins_list');
    var interval = DM.get_data('charts.' + chart_id + '.state.duration'); // X 轴每个点之间的时间间隔

    // 日内图 当前交易日数据全部显示
    var start_id = DM.get_data('klines.' + insid + '.' + interval + '.trading_day_start_id');  // 全部数据最左端 id
    var end_id = DM.get_data('klines.' + insid + '.' + interval + '.trading_day_end_id');  // 全部数据最右端 id
    
    var left_id = DM.get_data('charts.' + chart_id + '.left_id');  // 屏幕最左端应该显示的元素 id
    var right_id = DM.get_data('charts.' + chart_id + '.right_id'); // 屏幕最右端应该显示的元素 id


    if (chart_interval!= interval || insid != DM.get_data('state.detail_ins_id') || right_id == -1 || right_id == undefined) return;

    if (DM.get_data('charts.' + chart_id)) {
        switch (chart_id) {
            case 'chart_day':
                var insObj = InstrumentManager.getInstrumentById(insid);
                var priceTick = insObj.price_tick; // 价格间隔
                var fixed = insObj.price_fixed; // 价格保留小数位数

                // 日内图 当前交易日数据全部显示 不可左右拖拽
                var sigma = 0, sigma_weighting = 0;
                // 计算出日内图均价
                if (DM.datas.klines && DM.datas.klines[insid] && DM.datas.klines[insid][interval]) {
                    for(var i = left_id; i <= right_id; i++){
                        if(DM.datas.klines[insid][interval].data[i]){
                            var d = DM.datas.klines[insid][interval].data[i];
                            sigma += d.close * d.volume;
                            sigma_weighting += d.volume;
                            DM.datas.klines[insid][interval].data[i].weighting_average = (sigma / sigma_weighting);
                        }
                    }
                }
                
                var config = {
                    id: chart_id,
                    ins_id: insid,
                    draggable: false, // 不可左右拖拽
                    interval: interval, // X 轴每个点之间的时间间隔
                    start_id: start_id, // 全部数据最左端 id
                    end_id: end_id, // 全部数据最右端 id
                    left_id: left_id, // 最左边数据 id
                    right_id: right_id, // 最右边数据 id
                    charts: [
                    {
                        height_proportion: 0.6,
                        margin: {
                            top: 5,
                            bottom: 0
                        },
                        priceTick: priceTick,
                        fixed: fixed,
                        showMostValue: false,
                        showPanels: false,
                        list: [{
                            name: 'line_close',
                            type: CHART_TYPE.lineChart,
                            field: 'close',
                            color: 'white',
                        },{
                            name: 'line_weighting_average',
                            type: CHART_TYPE.lineChart,
                            field: 'weighting_average',
                            color: 'yellow'
                        }]
                    
                    },
                    {
                        height_proportion: 0.4,
                        margin: {
                            top: 5,
                            bottom: 0
                        },
                        priceTick: 1,
                        fixed: 0,
                        showMostValue: false,
                        showPanels: false,
                        list: [{
                            name: 'bar_volume',
                            type: CHART_TYPE.barChart,
                            field: 'volume'
                        }]
                    }
                    ]
                };

                var last_data_close = DM.get_data('klines.' + insid + '.' + interval + '.data' + '.' + right_id + '.close'); 

                chartset = ChartSet.create(chart_container, width, height, config);
                
                if (DM.datas.klines && DM.datas.klines[insid] && DM.datas.klines[insid][interval]) {
                    if(chartset.interval != config.interval){
                        chartset.change_interval(config);
                    }
                    if(chartset.ins_id != config.ins_id){
                        chartset.change_ins_id(config);
                    }
                    chartset.update(DM.datas.klines[insid][interval].data, config);
                }
                break;
            case 'chart_kline':
                var insObj = InstrumentManager.getInstrumentById(insid);
                var priceTick = insObj.price_tick; // 价格间隔
                var fixed = insObj.price_fixed; // 价格保留小数位数
                var config = {
                    id: chart_id,
                    ins_id: insid,
                    draggable: true, // 不可左右拖拽
                    interval: interval, // X 轴每个点之间的时间间隔
                    start_id: start_id, // 全部数据最左端 id
                    end_id: end_id, // 全部数据最右端 id
                    left_id: left_id, // 最左边数据 id
                    right_id: right_id, // 最右边数据 id
                    charts: [{
                        height_proportion: 0.4,
                        margin:{
                            top: 5,
                            bottom: 5
                        },
                        priceTick: priceTick,
                        fixed: fixed,
                        showMostValue: false,
                        showPanels: true,
                        panels: get_panels_content(insid, fixed),
                        list: [{
                            name: 'kline',
                            type: CHART_TYPE.kChart
                        }]
                    },
                    {
                        height_proportion: 0.3,
                        margin: {
                            top: 5,
                            bottom: 0
                        },
                        priceTick: 1,
                        fixed: 0,
                        showMostValue: false,
                        showPanels: false,
                        list: [{
                            name: 'bar_vol',
                            type: CHART_TYPE.barChart,
                            field: 'volume'
                        }]
                    },
                    {
                        height_proportion: 0.3,
                        margin: {
                            top: 5,
                            bottom: 0
                        },
                        priceTick: '100',
                        fixed: 0,
                        showMostValue: false,
                        showPanels: false,
                        list: [{
                            name: 'line_oi',
                            type: CHART_TYPE.lineChart,
                            field: 'close_oi',
                            color: 'yellow'
                        }]
                    }]
                };

                var last_data_close = DM.get_data('klines.' + insid + '.' + interval + '.data' + '.' + right_id + '.close'); 

                chartset = ChartSet.create(chart_container, width, height, config);

                if (DM.datas.klines && DM.datas.klines[insid] && DM.datas.klines[insid][interval]) {
                    if(chartset.interval != config.interval){
                        chartset.change_interval(config);
                    }
                    if(chartset.ins_id != config.ins_id){
                        chartset.change_ins_id(config);
                    }
                    chartset.update(DM.datas.klines[insid][interval].data, config);
                }
                break;
        }

        // 是否显示挂单或者持仓
        var showPositions = DM.get_data("state.showPositions");
        var showOrders = DM.get_data("state.showOrders");

        if (showPositions) {
            chartset.showPanel('positions');
        } else {
            chartset.hidePanel('positions');
        }
        if (showOrders) {
            chartset.showPanel('orders');
        } else {
            chartset.hidePanel('orders');
        }   
    }
}

function draw_page_posdetail_info() {
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "info") {
        var insid = DM.get_data('state.detail_ins_id');
        var quote = DM.get_data("quotes." + insid);
        var instrument = DM.get_data("instruments." + insid);
        for (var k in instrument) {
            quote[k] = instrument[k];
        }
        for (var i = 0; i < CONST.pos_detail_quote.length; i++) {
            var param = CONST.pos_detail_quote[i];
            var divs = document.querySelectorAll('.posdetail .panel-container .frame .' + param);
            for (var j = 0; j < divs.length; j++) {
                var div = divs[j];
                if (div && quote) {
                    var val = quote[param] == undefined ? '' : quote[param];
                    if (param == 'last_price') {
                        if (quote.last_price - quote.pre_close >= 0) {
                            div.className = addClassName(div.className, 'R');
                        } else {
                            div.className = addClassName(div.className, 'G');
                        }
                    }
                    if (param == 'status') {
                        // [PREOPEN | MATCHINGORDER | MATCHING | TRADING | CLOSED]
                        switch (val) {
                            case 'PREOPEN':
                                val = '开盘前';
                                break;
                            case 'MATCHINGORDER':
                                val = '集合竞价';
                                break;
                            case 'MATCHING':
                                val = '集合竞价';
                                break;
                            case 'TRADING':
                                val = '连续交易';
                                break;
                            case 'CLOSED':
                                val = '已收盘';
                                break;
                            default:
                                break;
                        }
                    }
                    div.innerText = val;
                }
            }
        }
    }
}

function draw_page_posdetail_discuss() {
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "discuss") {
        var time = DM.get_data("state.lastestChatTime");
        var msg = MessageQueue.shift();
        var container = document.querySelector('.posdetail .panel-container.discuss .messages');
        while (msg && msg.time <= time) {
            // TODO 处理 & 显示消息
            var div = document.createElement('div');
            div.innerText = msg.from + ' : ' + msg.text;
            container.appendChild(div);
            
            msg = MessageQueue.shift();
        }
    }
}

function draw_page_posdetail_plan() {
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "plan") {
        console.log('plan')
    }
}

function draw_page_posdetail_tools() {
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "tools") {
        console.log('tools')
    }
}