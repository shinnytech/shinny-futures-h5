function draw_page_posdetail() {
    let state = tqsdk.get_by_path('state');
    if (state.page === 'posdetail') {
        draw_page_posdetail_chart(state);
        if (state.subpage === 'info') {
            draw_page_posdetail_info(state);
        } else if (state.subpage === 'discuss') {
            draw_page_posdetail_discuss(state);
        } else if (state.subpage === 'plan') {
            draw_page_posdetail_plan(state);
        } else if (state.subpage === 'tools') {
            draw_page_posdetail_tools(state);
        }
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
    
    var positions = tqsdk.get_positions()
    var orders = tqsdk.get_orders()
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


function draw_page_posdetail_chart(state) {
    var detail_ins_id = state.detail_ins_id;
    var chart_id = state.chart_id;
    var chart_interval = state.chart_interval;

    var chart_container = document.querySelector('div.chart.container');
    var height = DIVISIONS.innerHeight - 280;
    chart_container.style.height = height + 'px';            
    var width = chart_container.clientWidth;

    var chart = tqsdk.get_by_path('charts/' + chart_id);
    if (!chart) return;

    var left_id = chart.left_id;  // 屏幕最左端应该显示的元素 id
    var right_id = chart.right_id; // 屏幕最右端应该显示的元素 id
    var insid = chart.state.ins_list;
    var interval = chart.state.duration; // X 轴每个点之间的时间间隔
    if (chart_interval != interval || insid != detail_ins_id || left_id === -1 ||right_id === -1 ) return 

    // 日内图 当前交易日数据全部显示
    var klines = tqsdk.dm.getKlines(insid, interval)
    var start_id = klines.trading_day_start_id;  // 全部数据最左端 id
    var end_id = klines.trading_day_end_id;  // 全部数据最右端 id
    
    switch (chart_id) {
        case 'chart_day':
            var insObj = tqsdk.get_quote(insid);
            var priceTick = insObj.price_tick; // 价格间隔
            var fixed = insObj.price_fixed; // 价格保留小数位数

            // 日内图 当前交易日数据全部显示 不可左右拖拽
            var sigma = 0, sigma_weighting = 0;
            // 计算出日内图均价
            for (var i = left_id; i <= right_id; i++) {
                if (klines.data && klines.data[i]) {
                    var d = klines.data[i];
                    sigma += d.close * d.volume;
                    sigma_weighting += d.volume;
                    klines.data[i].weighting_average = (sigma / sigma_weighting);
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

            chartset = ChartSet.create(chart_container, width, height, config);

            if (chartset.interval != config.interval) {
                chartset.change_interval(config);
            }
            if (chartset.ins_id != config.ins_id) {
                chartset.change_ins_id(config);
            }
            chartset.update(klines, config);
            break;
        case 'chart_kline':
            var insObj = tqsdk.get_quote(insid);
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
            chartset = ChartSet.create(chart_container, width, height, config);
            var klines = tqsdk.dm.getKlines(insid, interval)
            if (chartset.interval != config.interval) {
                chartset.change_interval(config);
            }
            if (chartset.ins_id != config.ins_id) {
                chartset.change_ins_id(config);
            }
            chartset.update(klines, config);
            break;
    }

    // 是否显示挂单或者持仓
    var showPositions = tqsdk.get_by_path("state/showPositions");
    var showOrders = tqsdk.get_by_path("state/showOrders");
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

function draw_page_posdetail_info() { 
    var state = tqsdk.get_by_path('state')
    if (state.page !== 'posdetail' || state.subpage !== "info") return
    var insid = state.detail_ins_id;
    var quote = tqsdk.get_quote(insid);
    var price_fixed = quote.price_decs;
    for (var i = 0; i < CONST.pos_detail_quote.length; i++) {
        var param = CONST.pos_detail_quote[i];
        var divs = document.querySelectorAll('.posdetail .panel-container.info .' + param);
        for (var j = 0; j < divs.length; j++) {
            var div = divs[j];
            if (div && quote) {
                var val = quote[param] == undefined ? '' : quote[param];
                if (param == 'day_increase') {
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
                    'pre_settlement',
                    'change'].indexOf(param) > -1) {
                    val = typeof val === 'number' ? val.toFixed(price_fixed) : val;
                } else if (param === 'change_percent') {
                    val = val.toFixed(2) + '%';
                } else if (param === 'trading_time') {
                    val = get_trading_time_str(val)
                } else if (param === 'expire_datetime') {
                    val = formatDate(val * 1000);
                }
                div.innerText = val;
            }
        }
    }
}

function draw_page_posdetail_discuss(state) { // 持仓
    var container = document.querySelector('.posdetail .panel-container.discuss table tbody');
    if (!container) return;
    var positions = tqsdk.get_positions();
    var trs = container.querySelectorAll('tr');
    var symbol_list = [];
        
    // 先处理已经有的 trs，删除已经全部平仓的 / 更新持仓手数
    // symbol_list 记录这个循环里应处理过的合约
    for (var i = 0; i < trs.length; i++) {
        var tr = trs[i];
        var symbol = tr.dataset.symbol;
        symbol_list.push(symbol);
        var position = positions[symbol];
        var quote = tqsdk.get_quote(symbol);
        if (position) {
            if (position.volume_long === 0 && position.volume_short === 0) {
                // 删除双向持仓都为 0 的合约
                container.deleteRow(i);
            } else {
                setTextToTd(tr, position, quote.last_price, quote.volume_multiple); // 填写相应的内容
            }
        } else {
            // 删除持仓对象里已经没有的合约 // 删除双向持仓都为 0 的合约
            container.deleteRow(i);
        }
    }

        function gen_close_pos(symbol, dir) {
            return function () {
                var position = tqsdk.get_position(symbol);
                var exchange_id = position.exchange_id;
                var instrument_id = position.instrument_id;
                var quote = tqsdk.get_quote(exchange_id+'.'+instrument_id);
                var price = dir === 'BUY' ? quote.upper_limit : quote.lower_limit;
                var close = 0;
                var close_today = 0;
                if(exchange_id === "SHFE"){
                    close = dir === 'BUY' ? position.volume_short_his : position.volume_long_his;
                    close_today = dir === 'BUY' ? position.volume_short_today : position.volume_long_today;
                } else {
                    close = dir === 'BUY' ? position.volume_short : position.volume_long;
                }
                var iclose = Number(prompt("请输入平仓手数(默认全平)", "" + (close + close_today)));
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

                if(close > 0){
                    tqsdk.insert_order({
                        exchange_id: exchange_id, 
                        ins_id: instrument_id, 
                        direction: dir, 
                        limit_price: Number(price), 
                        price_type: 'LIMIT',
                        offset: "CLOSE", 
                        volume: Number(close)
                    })
                }
                if(close_today > 0){
                    tqsdk.insert_order({
                        exchange_id: exchange_id, 
                        ins_id: instrument_id, 
                        direction: dir, 
                        limit_price: Number(price), 
                        price_type: 'LIMIT',
                        offset: "CLOSETODAY", 
                        volume: Number(close_today)
                    })
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
                var symbol = position.exchange_id + '.' + position.instrument_id;
                if(th_names[i] === 'close'){
                    var a_sell_close = spans[0].querySelector('a');
                    var a_buy_close = spans[2].querySelector('a');
                    if(content[0] === 'a' && !a_sell_close){
                        a_sell_close = document.createElement('a');
                        a_sell_close.className = 'button button-small button-outline button-light';
                        a_sell_close.innerText = '平多';
                        a_sell_close.onclick = gen_close_pos(symbol, 'SELL');
                        spans[0].appendChild(a_sell_close)
                    } else if(content[0] !== 'a') {
                        spans[0].innerText = '';
                    }
                    spans[1].innerText = content[1];
                    if(content[2] === 'a' && !a_buy_close){
                        a_buy_close = document.createElement('a');
                        a_buy_close.className = 'button button-small button-outline button-light';
                        a_buy_close.innerText = '平空';
                        a_buy_close.onclick = gen_close_pos(symbol, 'BUY');
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

        var not_subscribe_quotes = []; // 记录没有订阅的合约列表，稍后订阅
        var subscribed_quotes = tqsdk.get_by_path('ins_list')

        for (var symbol in positions) {
            var position = positions[symbol];
            if (subscribed_quotes.indexOf(symbol) == -1) not_subscribe_quotes.push(symbol);
            // 前面应处理过的合约
            if (symbol_list.indexOf(symbol) > -1) continue;
            // 不需要处理的合约
            if (position.volume_long === 0 && position.volume_short === 0) continue;
            var quote = tqsdk.get_quote(symbol);
            var tr = genTr(symbol, position.instrument_id); // 生成相应的一行
            setTextToTd(tr, position, quote.last_price, quote.volume_multiple); // 填写相应的内容
            container.appendChild(tr);
        }

        if (not_subscribe_quotes.length > 0) {
            tqsdk.subscribe_quote(subscribed_quotes + ',' + not_subscribe_quotes.join(','))
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
    var container = document.querySelector('.posdetail .panel-container.plan table tbody');
    var orders = tqsdk.get_orders();
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
        } else if(order.last_msg.indexOf('全部成交') > -1 || order.volume_left === 0) {
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
                        tqsdk.cancel_order({
                            order_id: id,
                        })
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

function draw_page_posdetail_tools(state) { // 交易
    var insid = state.detail_ins_id;
    var quote = tqsdk.get_quote(insid);
    var price_fixed = quote.price_decs;
    for (var i = 0; i < CONST.pos_detail_quote_tools.length; i++) {
        var param = CONST.pos_detail_quote_tools[i];
        var divs = document.querySelectorAll('.posdetail .panel-container .frame .' + param);
        for (var j = 0; j < divs.length; j++) {
            var div = divs[j];
            if (div && quote) {
                var val = quote[param] == undefined ? '' : quote[param];
                if (param == 'last_price') {
                    div.className = quote.change >= 0 ? addClassName(div.className, 'R') :addClassName(div.className, 'G');
                }
                if (['ask_price1',
                    'bid_price1',
                    'last_price'].indexOf(param) > -1) {
                    val = typeof val === 'number' ? val.toFixed(price_fixed) : val;
                }
                div.innerText = val;
            }
        }
    }
}
