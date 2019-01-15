function draw_page_posdetail() {
    if (DM.get_data("state" + SEPERATOR + "page") == "posdetail") {
        var insid = DM.get_data('state' + SEPERATOR + 'detail_ins_id');
        var subpage = DM.get_data("state" + SEPERATOR + "subpage");
        DM.run(draw_page_posdetail_chart);
        DM.run(draw_page_posdetail_info);
        DM.run(draw_page_posdetail_discuss);
        DM.run(draw_page_posdetail_plan);
        DM.run(draw_page_posdetail_tools);
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
    var positions = DM.get_data("trade" + SEPERATOR + DM.datas.account_id + SEPERATOR + "positions");
    var orders = DM.get_data("trade" + SEPERATOR + DM.datas.account_id + SEPERATOR + "orders");
    if (positions && positions[insid]){
        var pos = positions[insid];
        if(pos.volume_long > 0){
            var p = pos.open_price_long.toFixed(fixed);
            if(!content[0].datas[p]) content[0].datas[p] = [];
            content[0].datas[p].push({
                text: pos.volume_long + '@' + p,
                backgroundColor: 'yellow',
                color: '#9d0000'
            });
        }
        if(pos.volume_short > 0){
            var p = pos.open_price_short.toFixed(fixed);
            if(!content[0].datas[p]) content[0].datas[p] = [];
            content[0].datas[p].push({
                text: pos.volume_short + '@' + p,
                backgroundColor: 'yellow',
                color: '#005a00'
            });
        }
    }
    if (orders) {
        for(var id in orders){
            if(orders[id].exchange_id + '.' + orders[id].instrument_id === insid){
                var order = orders[id];
                if(order.price_type === 'LIMIT' && order.status === 'ALIVE'){
                    var p = order.limit_price.toFixed(fixed);
                    if (content[1].datas[p] == undefined) content[1].datas[p] = [];
                    content[1].datas[p].push({
                        text: order.volume_left + '@' + p,
                        backgroundColor: 'yellow',
                        color: '#606060'
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

    var chart_id = DM.get_data('state' + SEPERATOR + 'chart_id');
    var chart_interval = DM.get_data('state' + SEPERATOR + 'chart_interval');
    var insid = DM.get_data('charts' + SEPERATOR + chart_id + SEPERATOR + 'state' + SEPERATOR + 'ins_list');
    var interval = DM.get_data('charts' + SEPERATOR + chart_id + SEPERATOR + 'state' + SEPERATOR + 'duration'); // X 轴每个点之间的时间间隔

    // 日内图 当前交易日数据全部显示
    var start_id = DM.get_data('klines' + SEPERATOR + insid + SEPERATOR + interval + SEPERATOR + 'trading_day_start_id');  // 全部数据最左端 id
    var end_id = DM.get_data('klines' + SEPERATOR + insid + SEPERATOR + interval + SEPERATOR + 'trading_day_end_id');  // 全部数据最右端 id

    var left_id = DM.get_data('charts' + SEPERATOR + chart_id + SEPERATOR + 'left_id');  // 屏幕最左端应该显示的元素 id
    var right_id = DM.get_data('charts' + SEPERATOR + chart_id + SEPERATOR + 'right_id'); // 屏幕最右端应该显示的元素 id


    if (chart_interval != interval || insid != DM.get_data('state' + SEPERATOR + 'detail_ins_id') || right_id == -1 || right_id == undefined) return;

    if (DM.get_data('charts' + SEPERATOR + chart_id)) {
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

                var last_data_close = DM.get_data('klines' + SEPERATOR + insid + SEPERATOR + interval + SEPERATOR + 'data' + SEPERATOR + right_id + SEPERATOR + 'close');

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
                        height_proportion: 0.7,
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
                        // {
                        //     height_proportion: 0.3,
                        //     margin: {
                        //         top: 5,
                        //         bottom: 0
                        //     },
                        //     priceTick: '100',
                        //     fixed: 0,
                        //     showMostValue: false,
                        //     showPanels: false,
                        //     list: [{
                        //         name: 'line_oi',
                        //         type: CHART_TYPE.lineChart,
                        //         field: 'close_oi',
                        //         color: 'yellow'
                        //     }]
                        // }
                        ]
                };

                var last_data_close = DM.get_data('klines' + SEPERATOR + insid + SEPERATOR + interval + SEPERATOR + 'data' + SEPERATOR + right_id + SEPERATOR + 'close');

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
        var showPositions = DM.get_data("state" + SEPERATOR + "showPositions");
        var showOrders = DM.get_data("state" + SEPERATOR + "showOrders");

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
    if (DM.get_data("state" + SEPERATOR + "page") == "posdetail" && DM.get_data("state" + SEPERATOR + "subpage") == "info") {
        var insid = DM.get_data('state' + SEPERATOR + 'detail_ins_id');
        var quote = DM.get_data("quotes" + SEPERATOR + insid);
        var price_fixed = InstrumentManager.data[insid].price_decs;
        for (var i = 0; i < CONST.pos_detail_quote.length; i++) {
            var param = CONST.pos_detail_quote[i];
            var divs = document.querySelectorAll('.posdetail .panel-container.info .' + param);
            for (var j = 0; j < divs.length; j++) {
                var div = divs[j];
                if (div && quote) {
                    var val = quote[param] == undefined ? '' : quote[param];
                    if (param == 'change_percent') {
                        var changePercent = ((quote.last_price - quote.pre_settlement) / quote.pre_close * 100);
                        val = isNaN(changePercent) ? '-' : changePercent.toFixed(2) + '%';
                    } else if (param == 'change') {
                        val = quote.last_price - quote.pre_settlement;
                        var price_decs = InstrumentManager.data[insid].price_decs;
                        val = isNaN(val) ? '-' : val.toFixed(price_decs);
                    } else if (param == 'day_increase') {
                        val = quote.open_interest - quote.pre_open_interest;
                    }
                    if (param == 'last_price' || param == 'open' || param == 'change' || param == 'change_percent') {
                        if (quote.last_price - quote.pre_settlement >= 0) {
                            div.className = addClassName(div.className, 'R');
                        } else {
                            div.className = addClassName(div.className, 'G');
                        }
                    }
                    if (['ask_price1',
                        'bid_price1',
                        'last_price',
                        'highest',
                        'lowest',
                        'lower_limit',
                        'upper_limit',
                        'open',
                        'pre_close',
                        'pre_settlement'].indexOf(param) > -1) {
                        val = typeof val === 'number' ? val.toFixed(price_fixed) : val;
                    }
                    div.innerText = val;
                }
            }
        }
    }
}

function draw_page_posdetail_discuss() { // 持仓
    if (DM.get_data("state" + SEPERATOR + "page") == "posdetail" && DM.get_data("state" + SEPERATOR + "subpage") == "discuss") {
        var container = document.querySelector('.posdetail .panel-container.discuss table tbody');
        var positions = DM.get_data('trade' + SEPERATOR + DM.datas.account_id + SEPERATOR + 'positions');
        if (!container) return;
        var trs = container.querySelectorAll('tr');
        var symbol_list = [];
        // 先处理已经有的 trs，删除已经全部平仓的 / 更新持仓手数
        // symbol_list 记录这个循环里应处理过的合约
        for (var i = 0; i < trs.length; i++) {
            var tr = trs[i];
            var symbol = tr.dataset.symbol;
            symbol_list.push(symbol);
            var position = positions[symbol];
            if (!position) {
                // 删除持仓对象里已经没有的合约
                container.deleteRow(tr);
            }
            var volume_long = position.volume_long_today + position.volume_long_his;
            var volume_short = position.volume_short_today + position.volume_short_his;
            if (volume_long === 0 && volume_short === 0) {
                // 删除双向持仓都为 0 的合约
                container.deleteRow(tr);
            } else {
                var last_price = DM.get_data('quotes' + SEPERATOR + symbol + SEPERATOR + 'last_price');
                var vm = InstrumentManager.getInstrumentById(symbol).volume_multiple;
                setTextToTd(tr, position, last_price, vm); // 填写相应的内容
            }
        }

        function gen_close_pos(position, dir) {
            return function () {
                var exchange_id = position.exchange_id;
                var instrument_id = position.instrument_id;
                var quote = DM.datas.quotes[exchange_id+'.'+instrument_id];
                var price = dir === 'BUY' ? quote.upper_limit : quote.lower_limit;
                var close = 0;
                var close_today = 0;
                if(exchange_id === "SHFE"){
                    close = dir === 'BUY' ? position.volume_short_his : position.volume_long_his;
                    close_today = dir === 'BUY' ? position.volume_short_today : position.volume_long_today;
                } else {
                    close = dir === 'BUY' ? position.volume_short_today + position.volume_short_his : position.volume_long_today + position.volume_long_his;
                }
                var iclose = Number(prompt("请输入平仓手数(默认全平)", "" + close));
                if(isNumber(iclose)){
                    if(iclose > (close + close_today)) {
                        alert('手数大于全部可平仓手数！');
                        return;
                    } else {
                        if(exchange_id === "SHFE"){
                            var close_his_vol = iclose - close_today;
                            close_today = close_his_vol <= 0 ? iclose : close_today;
                            close = Math.max(0, close_his_vol);
                        } else {
                            close = iclose;
                        }
                    }
                } else {
                    alert('输入的不是数字！');
                    return;
                }

                var insert_order = {
                    aid: "insert_order", // 下单请求
                    user_id: DM.datas.account_id,
                    exchange_id: exchange_id,
                    instrument_id: instrument_id,
                    direction: dir,
                    price_type: "LIMIT", // 报单类型
                    limit_price: price,
                    volume_condition: "ANY",
                    time_condition: "GFD"
                }

                if(close > 0){
                    var req_id = WS.getReqid();
                    TR_WS.send(Object.assign(insert_order, {
                        order_id: req_id,
                        offset: 'CLOSE',
                        volume: close}
                    ));
                }
                if(close_today > 0){
                    var req_id = WS.getReqid();
                    TR_WS.send(Object.assign(insert_order, {
                        order_id: req_id,
                        offset: 'CLOSETODAY',
                        volume: close_today}
                    ));
                }
            }
        }

        function genTr(symbol, ins) {
            var tr = document.createElement('tr');
            tr.dataset.symbol = symbol;
            var th_ins = document.createElement('th');
            th_ins.innerText = ins;
            tr.appendChild(th_ins);
            var th_names = ['dir', 'vol', 'price', 'margin', 'close'];
            for(var i in th_names){
                var td = genTdWithSpans(th_names[i]);
                tr.appendChild(td);
            }
            return tr;
        }

        function genTdWithSpans(className) {
            var th = document.createElement('th');
            th.className = className;
            for (var i = 0; i < 3; i++) {
                var span = document.createElement('span');
                th.appendChild(span);
            }
            return th;
        }

        function calcContent(className, position, last_price, vm){
            var content = [];
            var volume_long = position.volume_long_today + position.volume_long_his;
            var volume_short = position.volume_short_today + position.volume_short_his;
            if(className === 'dir'){
                content[0] = volume_long > 0 ? '多' : '';
                content[1] = volume_long > 0 && volume_short > 0 ? '/' : '';
                content[2] = volume_short > 0 ? '空' : '';
            } else if(className === 'vol'){
                content[0] = volume_long > 0 ? volume_long : '';
                content[1] = volume_long > 0 && volume_short > 0 ? '/' : '';
                content[2] = volume_short > 0 ? volume_short : '';
            } else if(className === 'price'){
                var buy_avg_price = volume_long > 0 ? position.open_cost_long / volume_long / vm : 0;
                var sell_avg_price = volume_short > 0 ? position.open_cost_short / volume_short / vm : 0;
                content[0] = buy_avg_price > 0 ? numberToFixed2(buy_avg_price) : '';
                content[1] = buy_avg_price > 0 && sell_avg_price > 0 ? '/' : '';
                content[2] = sell_avg_price > 0 ? numberToFixed2(sell_avg_price) : '';
            } else if(className === 'margin'){
                var buy_margin = volume_long > 0 ? last_price * volume_long * vm - position.open_cost_long : 0;
                var sell_margin = volume_short > 0 ? position.open_cost_short - last_price * volume_short * vm : 0;
                content[0] = volume_long > 0 ? numberToFixed2(buy_margin) : '';
                content[1] = volume_long > 0 && volume_short > 0 ? '/' : '';
                content[2] = volume_short > 0 ? numberToFixed2(sell_margin) : '';
            } else if(className === 'close'){
                content[0] = volume_long > 0 ? 'a' : '';
                content[1] = volume_long > 0 && volume_short > 0 ? '/' : '';
                content[2] = volume_short > 0 ? 'a' : '';
            }
            return content;
        }

        function setTextToTd(tr, position, last_price, vm) {
            var th_names = ['dir', 'vol', 'price', 'margin', 'close'];
            for(var i in th_names){
                var content = calcContent(th_names[i], position, last_price, vm);
                var spans = tr.querySelectorAll('th.' + th_names[i] + ' span');
                if(th_names[i] === 'close'){
                    var a_sell_close = spans[0].querySelector('a');
                    var a_buy_close = spans[2].querySelector('a');
                    if(content[0] === 'a' && !a_sell_close){
                        a_sell_close = document.createElement('a');
                        a_sell_close.className = 'button button-small button-outline button-light';
                        a_sell_close.innerText = '平多';
                        a_sell_close.onclick = gen_close_pos(position, 'SELL');
                        spans[0].appendChild(a_sell_close)
                    } else if(content[0] !== 'a') {
                        spans[0].innerText = '';
                    }
                    spans[1].innerText = content[1];
                    if(content[2] === 'a' && !a_buy_close){
                        a_buy_close = document.createElement('a');
                        a_buy_close.className = 'button button-small button-outline button-light';
                        a_buy_close.innerText = '平空';
                        a_buy_close.onclick = gen_close_pos(position, 'BUY');
                        spans[2].appendChild(a_buy_close)
                    } else if(content[2] !== 'a') {
                        spans[2].innerText = '';
                    }
                } else {
                    spans[0].innerText = content[0];
                    spans[1].innerText = content[1];
                    spans[2].innerText = content[2];
                }
            }
        }


        var quotes = DM.get_data('quotes');
        var not_subscribe_quotes = []; // 记录没有订阅的合约列表，稍后订阅

        for (var symbol in positions) {
            var position = positions[symbol];
            var ins_id = position.instrument_id;
            if (DM.datas.ins_list.indexOf(symbol) == -1) not_subscribe_quotes.push(symbol);
            // 前面应处理过的合约
            if (symbol_list.indexOf(symbol) > -1) continue;
            var volume_long = position.volume_long_today + position.volume_long_his;
            var volume_short = position.volume_short_today + position.volume_short_his;
            // 不需要处理的合约
            if (volume_long === 0 && volume_short === 0) continue;
            var last_price = quotes[symbol] && quotes[symbol].last_price ? quotes[symbol].last_price : NaN;
            var insObj = InstrumentManager.getInstrumentById(symbol);
            var vm = insObj.volume_multiple;
            var tr = genTr(symbol, insObj.ins_id); // 生成相应的一行
            setTextToTd(tr, position, last_price, vm); // 填写相应的内容
            container.appendChild(tr);
        }

        if (not_subscribe_quotes.length > 0) {
            WS.send({
                aid: "subscribe_quote", // 撤单请求
                ins_list: DM.datas.ins_list + ',' + not_subscribe_quotes.join(',')
            });
        }
    }
}

function numberToFixed2(num) {
    return (typeof num === 'number' && !Number.isInteger(num)) ? num.toFixed(2) : num;
}

function getFormatTime(date_neno) {
    var d = new Date(date_neno / 1000000);
    var time = [d.getHours() + '', d.getMinutes() + '', d.getSeconds() + ''];
    time.forEach(function (val, ind, arr) {
        arr[ind] = val.padStart(2, '0');
    });
    return time.join(':');
}

function draw_page_posdetail_plan() { // 委托
    if (DM.get_data("state" + SEPERATOR + "page") == "posdetail" && DM.get_data("state" + SEPERATOR + "subpage") == "plan") {
        var container = document.querySelector('.posdetail .panel-container.plan table tbody');
        var orders = DM.get_data('trade' + SEPERATOR + DM.datas.account_id + SEPERATOR + 'orders');
        if (!container) return;
        var trs = container.querySelectorAll('tr');
        var id_list = [];
        for (var i = 0; i < trs.length; i++) {
            var tr = trs[i];
            var id = tr.dataset.id;
            id_list.push(id);
            var order = orders[id];
            if (order) {
                setContentToTr(tr, order);
            }
        }

        function genTr(id) {
            var tr = document.createElement('tr');
            tr.dataset.id = id;
            for(var i =0 ; i< 7; i++){
                var td = document.createElement('th');
                tr.appendChild(td);
            }
            return tr;
        }

        function setContentToTr(tr, order){
            var tds = tr.querySelectorAll('th');
            tds[0].innerText = order.instrument_id;
            tds[1].innerText = order.last_msg;
            if(order.last_msg === '未成交' || order.last_msg === '已撤单'){
                tds[1].innerText = order.last_msg;
            } else if(order.last_msg.indexOf('全部成交') > -1) {
                tds[1].innerText = '全部成交';
            } else if(order.status === 'FINISHED') {
                tds[1].innerText = '错单';
            } else {
                tds[1].innerText = order.last_msg;
            }

            var dir_offset = (order.direction === 'BUY' ? '买' : '卖' ) + (order.offset === 'OPEN' ? '开' : '平');
            tds[2].innerText = dir_offset;
            tds[3].innerText = order.price_type === 'ANY' ? '市价' : order.limit_price;
            tds[4].innerText = order.volume_left;
            tds[5].innerText = orders[id].volume_orign;
            tds[6].innerText = getFormatTime(orders[id].insert_date_time);

            if(order.status === 'ALIVE' && order.volume_left > 0){
                if(!tr.onclick) tr.onclick = gen_cancel_order(order);
                tr.style.fontWeight = 'bold';
                tr.style.color = '#FFFFFF';
            } else {
                if(tr.onclick) tr.onclick = null;
                tr.style.fontWeight = 'normal';
                tr.style.color = '#BBBBBB';
            }
        }

        function gen_cancel_order(order) {
            var id = order.order_id
            return function () {
                var msg = '确认删除挂单 ' + order.instrument_id + '@';
                msg += order.limit_price;
                msg += ' ';
                msg += order.volume_left;
                msg += ' 手?'
                navigator.notification.confirm(
                    msg,
                    function (buttonIndex) {
                        if (buttonIndex == 1) {
                            TR_WS.send({
                                aid: "cancel_order", // 撤单请求
                                order_id: id,
                                user_id: DM.datas.account_id
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
            if (id_list.indexOf(id)>-1) continue;
            var tr = genTr(id);
            var order = orders[id];
            setContentToTr(tr, order);
            container.appendChild(tr);
        }
    }
}

function draw_page_posdetail_tools() { // 交易
    if (DM.get_data("state" + SEPERATOR + "page") == "posdetail" && DM.get_data("state" + SEPERATOR + "subpage") == "tools") {
        var insid = DM.get_data('state' + SEPERATOR + 'detail_ins_id');
        var quote = DM.get_data("quotes" + SEPERATOR + insid);
        for (var i = 0; i < CONST.pos_detail_quote_tools.length; i++) {
            var param = CONST.pos_detail_quote_tools[i];
            var divs = document.querySelectorAll('.posdetail .panel-container .frame .' + param);
            for (var j = 0; j < divs.length; j++) {
                var div = divs[j];
                if (div && quote) {
                    var val = quote[param] == undefined ? '' : quote[param];
                    if (param == 'last_price') {
                        if (quote.last_price - quote.pre_settlement >= 0) {
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
