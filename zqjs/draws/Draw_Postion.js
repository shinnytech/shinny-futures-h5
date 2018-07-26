function draw_page_position() {
    if (DM.get_data("state.page") == "positions") {

        for (var i = 0; i < CONST.positions_account.length; i++) {
            DM.run(function(p) {
                return function() {
                    draw_page_position_account(p)
                };
            }(CONST.positions_account[i]));
        }

        DM.run(draw_page_position_list);
        DM.run(draw_page_order_list);
    }
}

function draw_page_position_account(param) {
    var div = document.querySelector('.pos_container .account_info .' + param);
    var val = DM.get_data(param);
    if (param == 'status') {
        //"ACTIVE"|"NOTICE"|"CLOSEONLY"|"DISABLED"
        if (val == 'NOTICE') {
            div.className = 'col status';
            div.innerText = '账户状态异常，有系统未处理报单';
        } else if (val == 'CLOSEONLY') {
            div.className = 'col status';
            div.innerText = '账户状态异常，只能平仓操作';
        } else if (val == 'DISABLED') {
            div.className = 'col status';
            div.innerText = '账户状态异常，不能进行操作';
        } else {
            div.className = 'col status hidden';
        }
    } else {
        if (val && div) {
            val = val.toFixed(0);
            if (param == 'float_profit') {
                if (val < 0) {
                    div.className = addClassName(div.className, 'G');
                } else {
                    div.className = addClassName(div.className, 'R');
                }
            }
            div.innerText = val;
        }
    }
}

function page_to_posdetail(insid, posid) {
    DM.update_data({
        state: {
            detail_ins_id: insid,
            detail_pos_id: posid
        }
    });
    location.href = "#/app/posdetail";
}

function draw_page_position_list() {
    if (DM.get_data("state.page") == "positions" && DM.get_data("state.subpage") == 'positions') {
        var poslist = DM.get_data("positions");
        var container = document.querySelector('.pos_container');
        if (container.querySelector('.panel.positions_list')) {
            container = container.querySelector('.panel.positions_list');
            var tbody = container.querySelector('tbody');
            var posArr = [];
            if (poslist) {
                posArr = Object.getOwnPropertyNames(poslist);
            } else {
                tbody.innerHTML = "";
                return;
            }

            for (var i = 0; i < posArr.length; i++) {
                if (DM.get_data("positions." + posArr[i] + ".position_id") == null) {
                    if (document.querySelectorAll('.pos_container .pos_list .pos_' + posArr[i]).length > 0) {
                        var pos_parent = document.querySelector('.pos_container .panel.positions_list');
                        var pos = document.querySelector('.pos_container .panel.positions_list .pos_' + posArr[i]);
                        pos_parent.removeChild(pos);
                    }
                    continue;
                }
                var p = poslist[posArr[i]];
                // 持仓没有了
                if (p.position_id == null) {
                    continue;
                }
                if (document.querySelectorAll('.pos_container .panel.positions_list .pos_' + posArr[i]).length == 0) {
                    var tr_odd = document.createElement('tr');
                    var tr_even = document.createElement('tr');
                    tr_odd.className = 'pos_' + p.position_id;
                    tr_even.className = 'pos_' + p.position_id;

                    var click_handler = function(insid, posid) {
                        return function() { page_to_posdetail(insid, posid) };
                    }(p.instrument_id, p.position_id);

                    tr_odd.addEventListener('click', click_handler);
                    tr_even.addEventListener('click', click_handler);

                    var temp = "<td>" + p.instrument_id + "</td><td class='direction'></td><td class='float_profit'></td><td class='open_price'></td>";
                    tr_odd.innerHTML = temp;
                    var insid_name = insid_name = window.InstrumentManager.getInsNameById(p.instrument_id);
                    // DM.get_data('quotes.' + p.instrument_id + '.instrument_name');
                    temp = "<td>" + insid_name + "</td><td class='volume'></td><td class='float_profit_percent'></td><td class='margin'></td>";
                    tr_even.innerHTML = temp;
                    tbody.appendChild(tr_odd);
                    tbody.appendChild(tr_even);
                }

                DM.run(function(pos_id) {
                    return function() {
                        draw_page_position_content(pos_id)
                    };
                }(posArr[i]));
            }
        }
    }
}


function draw_page_order_list() {
    if (DM.get_data("state.page") == "positions" && DM.get_data("state.subpage") == 'orders') {
        var poslist = DM.get_data("positions");
        var container = document.querySelector('.pos_container');
        if (container.querySelector('.panel.orders_list')) {
            container = container.querySelector('.panel.orders_list');
            var tbody = container.querySelector('tbody');
            var posArr = [];
            if (poslist) {
                posArr = Object.getOwnPropertyNames(poslist);
            } else {
                tbody.innerHTML = "";
                return;
            }
            for (var i = 0; i < posArr.length; i++) {
                if (DM.get_data("positions." + posArr[i] + ".position_id") == null) {
                    if (document.querySelectorAll('.pos_container .pos_list .pos_' + posArr[i]).length > 0) {
                        var pos_parent = document.querySelector('.pos_container .panel.orders_list');
                        var pos = document.querySelectorAll('.pos_container .panel.orders_list .' + posArr[i]);
                        for (var i = 0; i < pos.length; i++) {
                            pos_parent.removeChild(pos[i]);
                        }
                    }
                    continue;
                }
                var p = poslist[posArr[i]];
                // 持仓没有了
                if (p.position_id == null) {
                    continue;
                }
                if (p.orders) {
                    var orderArr = Object.getOwnPropertyNames(p.orders);
                    for (var j = 0; j < orderArr.length; j++) {
                        if (p.orders[orderArr[j]].order_id == null) {
                            continue;
                        }
                        if (document.querySelectorAll('.pos_container .panel.orders_list .pos_' + posArr[i] + '[name="' + orderArr[j] + '"]').length == 0) {
                            var tr_odd = document.createElement('tr');
                            var tr_even = document.createElement('tr');
                            tr_odd.className = 'pos_' + posArr[i];
                            tr_even.className = 'pos_' + posArr[i];
                            tr_odd.setAttribute('name', orderArr[j]);
                            tr_even.setAttribute('name', orderArr[j]);

                            var click_handler = function(insid, posid) {
                                return function() { page_to_posdetail(insid, posid) };
                            }(p.instrument_id, p.position_id);

                            tr_odd.addEventListener('click', click_handler);
                            tr_even.addEventListener('click', click_handler);

                            var temp = "<td>" + p.instrument_id + "</td><td class='direction'></td><td class='price'></td><td class='frozen_margin'></td>";
                            tr_odd.innerHTML = temp;
                            var insid_name = insid_name = window.InstrumentManager.getInsNameById(p.instrument_id);
                            // DM.get_data('quotes.' + p.instrument_id + '.instrument_name');
                            temp = "<td>" + insid_name + "</td><td class='volume_left'></td><td class='order_datetime'></td><td class=''></td>";
                            tr_even.innerHTML = temp;
                            tbody.appendChild(tr_odd);
                            tbody.appendChild(tr_even);
                        }
                        DM.run(function(pos_id, order_id) {
                            return function() {
                                draw_page_order_content(pos_id, order_id)
                            };
                        }(posArr[i], orderArr[j]));
                    }
                }
            }
        }
    }
}


function draw_page_position_content(pos_id) {
    if (DM.get_data("state.page") == "positions" && DM.get_data("account_id")) {
        var classNameStr = '.pos_container .panel.positions_list .pos_' + pos_id;
        for (var i = 0; i < CONST.positions_attrs.length; i++) {
            var div = document.querySelector(classNameStr + ' .' + CONST.positions_attrs[i]);
            var val = DM.get_data("positions." + pos_id + '.' + CONST.positions_attrs[i]);
            if (div && val) {
                if (CONST.positions_attrs[i] == 'direction') {
                    if (val == 'BUY') {
                        val = '看涨';
                    } else {
                        val = '看跌';
                    }
                }
                if (CONST.positions_attrs[i] == 'float_profit' || CONST.positions_attrs[i] == 'open_price') {
                    var fixedNum = DM.get_data("positions." + pos_id + '.price_decs');
                    val = val.toFixed(fixedNum);
                }
                if (CONST.positions_attrs[i] == 'float_profit_percent') {
                    val = (val * 100).toFixed(2) + '%';
                }
                div.innerText = val;
            }
        }
    }
}

function draw_page_order_content(pos_id, order_id) {
    if (DM.get_data("state.page") == "positions" && DM.get_data("account_id")) {
        var classNameStr = '.pos_container .panel.orders_list .pos_' + pos_id + '[name="' + order_id + '"]';
        for (var i = 0; i < CONST.positions_order_attrs.length; i++) {
            var div = document.querySelector(classNameStr + ' .' + CONST.positions_order_attrs[i]);
            var val = DM.get_data("positions." + pos_id + '.orders.' + order_id + '.' + CONST.positions_order_attrs[i]);
            if (div && val) {
                if (CONST.positions_order_attrs[i] == 'direction') {
                    if (val == 'SELL') {
                        val = '看涨';
                    } else {
                        val = '看跌';
                    }
                }
                if (CONST.positions_order_attrs[i] == 'order_datetime') {
                    val = val.slice(11, 19);
                }
                div.innerText = val;
            }
        }
    }
}