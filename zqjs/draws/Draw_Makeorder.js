function draw_page_makeorder() {
    if (DM.get_data("state.page") == "makeorder") {

        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');

        DM.run(draw_page_makeorder_posgroup);
        DM.run(draw_page_makeorder_pricelabel);
        DM.run(draw_page_makeorder_priceinput);
        DM.run(draw_page_makeorder_pricebutton);
        DM.run(draw_page_makeorder_orderlist);
    }
}

function draw_page_makeorder_posgroup() {
    var posgroup_container = document.querySelector('.makeorder .pos-group');

    var insid = DM.get_data('state.detail_ins_id');
    var posid = DM.get_data('state.detail_pos_id');
    console.log(insid, posid);

    if (posid == 'new') {
        // 如果新建持仓成交， 默认选中新持仓
        var mapping = DM.get_data('mapping');

        if (DM.get_data('session_id') && DM.get_data('state.req_id')) {
            var new_order_id = DM.get_data('session_id') + '!' + DM.get_data('state.req_id');
            if (mapping && mapping[new_order_id]) {
                var new_pos_id = mapping[new_order_id];
                console.log("有了新持仓" + new_pos_id);
                delete mapping[new_order_id];
                DM.update_data({
                        state: {
                            'detail_pos_id': new_pos_id
                        }
                });
            }
        }
    }

    // 新持仓
    var pos_div_new = posgroup_container.querySelector('.pos-block[data-id=\'new\']');
    if (pos_div_new == null) {
        pos_div_new = document.createElement('div');
        pos_div_new.className = 'pos-block';
        pos_div_new.setAttribute('data-id', 'new');
        pos_div_new.innerHTML = '新开仓';
        pos_div_new.addEventListener('click', function (pos_id) {
            return function () { set_position_id(pos_id) };
        }('new'));
        posgroup_container.appendChild(pos_div_new);
    }
    // 整个宽度
    var width = 100;
    // 该合约全部持仓
    var poslist = DM.get_data('instruments.' + insid + '.pos_list');
    poslist = poslist == null ? [] : poslist.split(',');
    console.log(poslist)
    // 显示的全部持仓
    var pos_divs = posgroup_container.querySelectorAll('.pos-block');
    // 删除已经没有的持仓
    for (var i = 0; i < pos_divs.length; i++) {
        var old_posid = pos_divs[i].getAttribute('data-id');
        if (poslist.indexOf(old_posid) < 0 && old_posid != 'new') {
            posgroup_container.removeChild(pos_divs[i]);
        }
    }
    // 添加没有的 并更新
    var flag_select_new = true; // 什么都不选就选新持仓
    for (var i = 0; i < poslist.length; i++) {
        var pos = DM.get_data('positions.' + poslist[i]);
        if (pos == undefined || pos.position_id == null) {
            continue;
        }
        var pos_div = posgroup_container.querySelector('.pos-block[data-id="' + pos.position_id + '"]');
        if (pos_div == null) {
            pos_div = document.createElement('div');
            pos_div.className = 'pos-block';
            pos_div.setAttribute('data-id', pos.position_id);
            pos_div.addEventListener('click', function (pos_id) {
                return function () { set_position_id(pos_id) };
            }(poslist[i]));
            posgroup_container.appendChild(pos_div);
        }
        var contentStr = '';
        if (pos.direction == 'BUY') {
            contentStr += '看涨';
        } else {
            contentStr += '看跌';
        }
        var fixedNum = DM.get_data('quotes.' + insid + '.price_decs');
        contentStr += pos.volume + '手<br/> @' + pos.open_price.toFixed(fixedNum);
        pos_div.innerHTML = contentStr;

        if (posid == pos.position_id) {
            flag_select_new = false;
            pos_div.className = 'pos-block selected';
        } else {
            pos_div.className = 'pos-block';
        }
        width += 100;
    }
    // 选中新持仓
    if (posid == 'new' || flag_select_new) {
        pos_div_new.className = 'pos-block selected';
        if (flag_select_new) {
            DM.datas.state.detail_pos_id = 'new';
        }
    } else {
        pos_div_new.className = 'pos-block';
    }
    posgroup_container.style.width = width + 'px';
}

function set_position_id(pos_id) {
    DM.update_data({
        'state': {
            detail_pos_id: pos_id
        }
    });
}

function draw_page_makeorder_pricelabel() {
    if (DM.get_data('state.page') == 'makeorder') {
        var insid = DM.get_data('state.detail_ins_id');
        var arr = ['bid_price1', 'last_price', 'ask_price1'];
        for (var i = 0; i < arr.length; i++) {
            DM.run(function (insid, param) {
                return function () {
                    draw_label(insid, param);
                };
            }(insid, arr[i]));
        }
    }
}

function draw_label(insid, param) {
    var div = document.querySelector('.makeorder .price-label .' + param);
    var val = DM.get_data('quotes.' + insid + '.' + param);
    if (val && div) {
        div.innerText = val;
    }
}

function draw_page_makeorder_priceinput() {
    if (DM.get_data('state.page') == 'makeorder') {
        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');
    }
}

function draw_page_makeorder_pricebutton() {
    if (DM.get_data('state.page') == 'makeorder') {
        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');
    }
}

function draw_page_makeorder_orderlist() {
    if (DM.get_data('state.page') == 'makeorder') {
        var insid = DM.get_data('state.detail_ins_id');
        var posid = DM.get_data('state.detail_pos_id');
        var container = document.querySelector('.makeorder .order-list');
        var orders = DM.get_data("positions." + posid + ".orders");
        for (var order_id in orders) {
            if (orders[order_id].order_id == null) {
                delete orders.order_id;
            }
        }
        if (container) {
            container.innerHTML = '';
            var s = '';
            for (var order_id in orders) {
                var order = orders[order_id];
                if (order.order_id == null) {
                    continue;
                }
                var div = document.createElement('div');
                div.className = 'item row ' + order.direction;

                var div_cols = [];

                for (var i = 0; i < 4; i++) {
                    div_cols[i] = document.createElement('div');
                    div_cols[i].className = 'col';
                    div.appendChild(div_cols[i]);
                }

                s = '';
                if (order.direction == 'BUY') {
                    s += '买';
                } else if (order.direction == 'SELL') {
                    s += '卖';
                }
                if (order.offset == 'OPEN') {
                    s += '开仓';
                } else if (order.offset == 'CLOSE' || order.offset == 'CLOSETODAY') {
                    s += '平仓';
                }
                div_cols[0].innerHTML = s;

                s = order.volume_left + '手';
                div_cols[1].innerHTML = s;

                if (order.price_type == 'LIMIT') {
                    s = order.price + '';
                } else if (order.price_type == 'MARKET') {
                    s = '市价';
                }
                div_cols[2].innerHTML = s;

                var click_handler = function (session_id, order_id) {
                    return function () { cancel_order(session_id, order_id) };
                }(order.session_id, order.order_id);

                var btn = document.createElement('button');
                btn.className = "ion-ios-close-outline";
                btn.addEventListener('click', click_handler);
                div_cols[3].appendChild(btn);
                container.appendChild(div);
            }
        }
    }
}

var cancel_order = function (session_id, order_id) {
    navigator.notification.confirm(
        '确认删除挂单?', // message
        function (buttonIndex) {
            if (buttonIndex == 1) {
                WS.send({
                    aid: "req_cancel_order", // 撤单请求
                    req_id: WS.getReqid(),
                    order_session_id: session_id,
                    order_req_id: order_id
                });
            } else {
                return;
            }
        }, // callback to invoke with index of button pressed
        '删除挂单', // title
        ['删除', '取消'] // buttonLabels
    );
}
