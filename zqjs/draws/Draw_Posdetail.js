function draw_page_posdetail() {
    if (DM.get_data("state.page") == "posdetail") {
        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');
        var subpage = DM.get_data("state.subpage");
        DM.run(draw_page_posdetail_chart);
        setTimeout(function () {
            DM.run(draw_page_posdetail_info);
            DM.run(draw_page_posdetail_discuss);
            DM.run(draw_page_posdetail_plan);
            DM.run(draw_page_posdetail_plan_2);
            DM.run(draw_page_posdetail_tools);
        }, 100);
    }
}

function get_panels_content(insid, fixed) {
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
                backgroundColor: pos.direction == 'BUY' ? 'red' : 'green',
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


    if (chart_interval != interval || insid != DM.get_data('state.detail_ins_id') || right_id == -1 || right_id == undefined) return;

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
                    for (var i = left_id; i <= right_id; i++) {
                        if (DM.datas.klines[insid][interval].data[i]) {
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
                            }, {
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
                    if (chartset.interval != config.interval) {
                        chartset.change_interval(config);
                    }
                    if (chartset.ins_id != config.ins_id) {
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
                        margin: {
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
                    if (chartset.interval != config.interval) {
                        chartset.change_interval(config);
                    }
                    if (chartset.ins_id != config.ins_id) {
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

// function draw_page_posdetail_discuss() { // 委托
//     if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "discuss") {
//         var time = DM.get_data("state.lastestChatTime");
//         var msg = MessageQueue.shift();
//         var container = document.querySelector('.posdetail .panel-container.discuss .messages');
//         while (msg && msg.time <= time) {
//             // TODO 处理 & 显示消息
//             var div = document.createElement('div');
//             div.innerText = msg.from + ' : ' + msg.text;
//             container.appendChild(div);

//             msg = MessageQueue.shift();
//         }
//     }
// }

function draw_page_posdetail_discuss() { // 持仓
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "discuss") {
        var container = document.querySelector('.posdetail .panel-container.discuss table tbody');
        var positions = DM.get_data('trade.'+DM.datas.account_id+'.positions');
        if(!container) return;
        var trs = container.querySelectorAll('tr');
        var symbol_list = [];
        for (var i=0; i<trs.length; i++) {
            var tr = trs[i];
            var symbol = tr.dataset.symbol;
            symbol_list.push(symbol);
            if (positions[symbol]) {
                var volume_long = positions[symbol].volume_long_today + positions[symbol].volume_long_his;
                var volume_short = positions[symbol].volume_short_today + positions[symbol].volume_short_his;
                if (volume_long === 0 && volume_short === 0) {
                    container.deleteRow(tr);
                } else {
                    var last_price = DM.get_data('quotes.'+positions[symbol].instrument_id+'.last_price');
                    
                    var vm = InstrumentManager.getInstrumentById(positions[symbol].instrument_id).volume_multiple;
                    var b_spans = tr.querySelectorAll('th.b span');
                    var c_spans = tr.querySelectorAll('th.c span');
                    var d_spans = tr.querySelectorAll('th.d span');
                    var e_spans = tr.querySelectorAll('th.e span');
                    if (volume_long > 0) {
                        b_spans[0].innerText = '多';
                        c_spans[0].innerText = volume_long;
                        var open_avg_price = positions[symbol].open_cost_long / volume_long / vm;
                        d_spans[0].innerText = numberToFixed2(open_avg_price);
                        e_spans[0].innerText = numberToFixed2(last_price * volume_long * vm - positions[symbol].open_cost_long);
                    } else {
                        b_spans[0].innerText = ''
                        c_spans[0].innerText = ''
                        d_spans[0].innerText = ''
                        e_spans[0].innerText = ''
                    }

                    if (volume_long > 0 && volume_short > 0) {
                        b_spans[1].innerText = '/'
                        c_spans[1].innerText = '/'
                        d_spans[1].innerText = '/'
                        e_spans[1].innerText = '/'
                    }
                    if (volume_short > 0) {
                        b_spans[2].innerText = '空';
                        c_spans[2].innerText = volume_short;
                        var open_avg_price = positions[symbol].open_cost_short / volume_short / vm;
                        d_spans[2].innerText = numberToFixed2(open_avg_price);
                        e_spans[2].innerText = numberToFixed2(positions[symbol].open_cost_short - last_price * volume_short * vm);
                    } else {
                        b_spans[2].innerText = ''
                        c_spans[2].innerText = ''
                        d_spans[2].innerText = ''
                        e_spans[2].innerText = ''
                    }
                    console.log(e_spans[2])
                    console.log(positions[symbol].open_cost_short , last_price , volume_short , vm)
                }
            } else {
                container.deleteRow(tr);
            }
        }

        function genTr(symbol) {
            var tr = document.createElement('tr');
            tr.dataset.symbol = symbol;
            return tr;
        }
        function genTd(ins) {
            var td = document.createElement('th');
            td.innerText = ins;
            return td;
        }
        function genTdWithSpans(className, isShow, content) {
            var td = document.createElement('th');
            td.className = className;
            for(var i in isShow){
                var span = document.createElement('span');
                content[i] = typeof content[i] === 'number' && !Number.isInteger(content[i]) ? content[i].toFixed(2) : content[i];
                span.innerText = isShow[i] ? content[i] : '';
                td.appendChild(span);
            }
            return td;
        }

        for (var symbol in positions) {
            if (symbol_list.includes(symbol)) continue;
            var volume_long = positions[symbol].volume_long_today + positions[symbol].volume_long_his;
            var volume_short = positions[symbol].volume_short_today + positions[symbol].volume_short_his;
            if (volume_long === 0 && volume_short === 0) continue;
            var last_price = DM.get_data('quotes.'+positions[symbol].instrument_id+'.last_price');
            var vm = InstrumentManager.getInstrumentById(positions[symbol].instrument_id).volume_multiple;
            var tr = genTr(symbol);
            var td_a = genTd(positions[symbol].instrument_id);
            tr.appendChild(td_a);
            var isShow = [volume_long>0, volume_long>0&&volume_short>0, volume_short>0 ];
            var content = ['', '', ''];
            content[1] = volume_long>0&&volume_short>0 ? '/' : '';

            content[0] = volume_long>0 ? '多' : '';
            content[2] = volume_short>0 ? '空' : '';
            var td_b = genTdWithSpans('b', isShow, content);
            tr.appendChild(td_b);

            content[0] = volume_long>0 ? volume_long : '';
            content[2] = volume_short>0 ? volume_short : '';
            var td_c = genTdWithSpans('c', isShow, content);
            tr.appendChild(td_c);

            content[0] = volume_long>0 ? numberToFixed2(positions[symbol].open_cost_long / volume_long / vm) : '';
            content[2] = volume_short>0 ? numberToFixed2(positions[symbol].open_cost_short / volume_short / vm) : '';
            
            var td_d = genTdWithSpans('d', isShow, content);
            tr.appendChild(td_d);

            content[0] = volume_long>0 ? numberToFixed2(last_price * volume_long * vm - positions[symbol].open_cost_long) : '';
            content[2] = volume_short>0 ? numberToFixed2(positions[symbol].open_cost_short - last_price * volume_short * vm) : '';
            var td_e = genTdWithSpans('e', isShow, content);
            tr.appendChild(td_e);
            container.appendChild(tr);
        }
    }
}

function numberToFixed2(num){
    return (typeof num === 'number' && !Number.isInteger(num)) ? num.toFixed(2) : num;
}

function getFormatTime(date_neno){
    var d = new Date(date_neno / 1000000);
    var time = [d.getHours() + '', d.getMinutes() + '', d.getSeconds() + ''];
    time.forEach(function(val, ind, arr){
        arr[ind] = val.padStart(2, '0');
    });
    return time.join(':');
}

function draw_page_posdetail_plan() { // 委托
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "plan") {
        var container = document.querySelector('.posdetail .panel-container.plan table tbody');
        var orders = DM.get_data('trade.'+DM.datas.account_id+'.orders');
        if(!container) return;
        var trs = container.querySelectorAll('tr');
        var id_list = [];
        for (var i=0; i<trs.length; i++) {
            var tr = trs[i];
            var id = tr.dataset.id;
            id_list.push(id);
            var tds = tr[i].querySelectorAll('td');
            if (orders[id]) {
                tds[0].innerText = orders[id].instrument_id;
                tds[1].innerText = orders[id].last_msg;
                tds[2].innerText = orders[id].offset === 'OPEN' ? '开仓' : '平仓';
                tds[3].innerText = orders[id].limit_price;
                tds[4].innerText = orders[id].volume_left + '/' + orders[id].volume_orign;
                tds[5].innerText = getFormatTime(orders[id].insert_date_time);
            }
        }

        function genTr(id) {
            var tr = document.createElement('tr');
            tr.dataset.id = id;
            return tr;
        }
        function genTd(ins) {
            var td = document.createElement('th');
            td.innerText = ins;
            return td;
        }

        for (var id in orders) {
            if (id_list.includes(id)) continue;
            var tr = genTr(id);
            tr.appendChild(genTd(orders[id].instrument_id));
            tr.appendChild(genTd(orders[id].last_msg));
            var offset = orders[id].offset === 'OPEN' ? '开仓' : '平仓';
            tr.appendChild(genTd(offset));
            tr.appendChild(genTd(orders[id].limit_price));
            tr.appendChild(genTd(orders[id].volume_left + '/' + orders[id].volume_orign));
            tr.appendChild(genTd(getFormatTime(orders[id].insert_date_time)));
            container.appendChild(tr);
        }
    }
}


function draw_page_posdetail_plan_2() { // 未成交
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "plan_2") {
        var container = document.querySelector('.posdetail .panel-container.plan_2 table tbody');
        var orders = DM.get_data('trade.'+DM.datas.account_id+'.orders');
        if(!container) return;
        var trs = container.querySelectorAll('tr');
        var id_list = [];
        for (var i=0; i<trs.length; i++) {
            var tr = trs[i];
            var id = tr.dataset.id;
            id_list.push(id);
            if (orders[id] && orders[id].status === 'ALIVE') {
                var tds = tr[i].querySelectorAll('td');
                tds[0].innerText = orders[id].instrument_id;
                tds[1].innerText = orders[id].last_msg;
                tds[2].innerText = orders[id].offset === 'OPEN' ? '开仓' : '平仓';
                tds[3].innerText = orders[id].limit_price;
                tds[4].innerText = orders[id].volume_left + '/' + orders[id].volume_orign;
                tds[5].innerText = getFormatTime(orders[id].insert_date_time);
            } else {
                container.deleteRow(tr);
            }
        }

        function genTr(id) {
            var tr = document.createElement('tr');
            tr.dataset.id = id;
            return tr;
        }
        function genTd(ins) {
            var td = document.createElement('th');
            td.innerText = ins;
            return td;
        }

        function cancel_order (id){
            return function(){
                navigator.notification.confirm(
                    '确认删除挂单?', // message
                    function (buttonIndex) {
                        if (buttonIndex == 1) {
                            TR_WS.send({
                                aid: "cancel_order", // 撤单请求
                                order_id: id,
                            });
                        } else {
                            return;
                        }
                    }, // callback to invoke with index of button pressed
                    '删除挂单', // title
                    ['删除', '取消'] // buttonLabels
                );
            }
        }

        for (var id in orders) {
            if (id_list.includes(id)) continue;
            if (orders[id].status === 'FINISHED') continue;
            var tr = genTr(id);
            tr.onclick = cancel_order(id);
            tr.appendChild(genTd(orders[id].instrument_id));
            tr.appendChild(genTd(orders[id].last_msg));
            var offset = orders[id].offset === 'OPEN' ? '开仓' : '平仓';
            tr.appendChild(genTd(offset));
            tr.appendChild(genTd(orders[id].limit_price));
            tr.appendChild(genTd(orders[id].volume_left + '/' + orders[id].volume_orign));
            tr.appendChild(genTd(getFormatTime(orders[id].insert_date_time)));
            container.appendChild(tr);
        }
    }
}

function draw_page_posdetail_tools() { // 交易
    if (DM.get_data("state.page") == "posdetail" && DM.get_data("state.subpage") == "tools") {
        var insid = DM.get_data('state.detail_ins_id');
        var quote = DM.get_data("quotes." + insid);
        for (var i = 0; i < CONST.pos_detail_quote_tools.length; i++) {
            var param = CONST.pos_detail_quote_tools[i];
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
                    div.innerText = val;
                }
            }
        }
    }
}