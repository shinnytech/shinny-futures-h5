/**
 * [draw_page_quote description]
 * @return {[type]} [description]
 */

/**
 *  DIVISIONS = {
 *      tbody: {
 *          dom: [node];
 *          childs: {
 *              'cu1701': {
 *                  domOdd: [node];
 *                  domEven: [node];
 *              },...
 *          }
 *      },
 *      c_tbody: {
 *          dom: [node];
 *          childs: {
 *              'cu1701': {
 *                  domOdd: [node];
 *                  domEven: [node];
 *              },...
 *          }
 *      },
 *      insType: '',
 *      insList: [],
 *      showList: []
 *  }
 */
var DIVISIONS = {
    tbody: undefined,
    c_tbody: undefined,
    insType: '',
    insList: [],
    showList: []
}

function draw_page_quote() {
    if (DM.get_data("state"+SEPERATOR+"page") == "quotes") {

        DIVISIONS.insType = DM.get_data('state'+SEPERATOR+'ins_type');

        if (DIVISIONS.insType == 'main') {
            DIVISIONS.insList = window.InstrumentManager.getMainInsList();
        } else {
            DIVISIONS.insList = DM.get_data('state'+SEPERATOR+'custom_ins_list') == '' ? [] : DM.get_data('state'+SEPERATOR+'custom_ins_list').split(','); //window.InstrumentManager.getCustomInsList();
        }

        if (!DIVISIONS["tbody"]) {
            initDIVISIONS();
        }

        // 1 删除不需要显示的合约 // 2 增加新的合约
        DM.run(draw_page_quote_tr);

        // 3 更新数据
        for (var i = 0; i < DIVISIONS.showList.length; i++) {
            DM.run(function (insid) {
                return function () {
                    draw_page_quote_detail(insid)
                };
            }(DIVISIONS.showList[i]));
        }
    }
}

function initDIVISIONS() {
    if (!DIVISIONS["tbody"]) {
        DIVISIONS["tbody"] = {
            dom: document.querySelector('.qt_container table.qt tbody'),
            childs: {}
        };
        DIVISIONS["c_tbody"] = {
            dom: document.querySelector('.qt_container .qt_cwrapper tbody'),
            childs: {}
        };
    }
}

function draw_page_quote_tr() {
    if (DIVISIONS.insList) {
        // 1 删除不需要显示的合约
        for (var i = 0; i < DIVISIONS.showList.length; i++) {
            if (DIVISIONS.insList.length == 0 || DIVISIONS.insList.indexOf(DIVISIONS.showList[i]) < 0) {
                if (DIVISIONS.tbody['childs'][DIVISIONS.showList[i]]) {
                    DIVISIONS.tbody['dom'].removeChild(DIVISIONS.tbody['childs'][DIVISIONS.showList[i]]['domOdd']);
                    DIVISIONS.tbody['dom'].removeChild(DIVISIONS.tbody['childs'][DIVISIONS.showList[i]]['domEven']);

                    DIVISIONS.c_tbody['dom'].removeChild(DIVISIONS.c_tbody['childs'][DIVISIONS.showList[i]]['domOdd']);
                    DIVISIONS.c_tbody['dom'].removeChild(DIVISIONS.c_tbody['childs'][DIVISIONS.showList[i]]['domEven']);

                    delete DIVISIONS.tbody['childs'][DIVISIONS.showList[i]];
                    delete DIVISIONS.c_tbody['childs'][DIVISIONS.showList[i]];

                    DIVISIONS.showList.splice(i--, 1);
                }
            }
        }

        // 2 增加新的合约
        for (var i = 0; i < DIVISIONS.insList.length; i++) {
            if (DIVISIONS.showList.indexOf(DIVISIONS.insList[i]) < 0) {
                DM.run(function (insid) {
                    return function () {
                        draw_page_quote_addtr(insid)
                    };
                }(DIVISIONS.insList[i]));
                DIVISIONS.showList.push(DIVISIONS.insList[i]);
            }
        }
    }
}

function draw_page_quote_addtr(insid) {
    var ins_id = window.InstrumentManager.getInsIdById(insid);
    var insid_name = window.InstrumentManager.getInsNameById(insid);

    if (!DIVISIONS.tbody['childs'][insid]) {
        // need paint the tr - .insid = quotes_keys[i]
        var tr_odd = document.createElement('tr'),
            tr_even = document.createElement('tr');
        tr_odd.className = 'odd ' + insid;
        tr_even.className = 'even ' + insid;

        var click_handler = function (insid) {
            return function () { click_handler_posdetail(insid) };
        }(insid);

        tr_odd.addEventListener('click', click_handler);
        tr_even.addEventListener('click', click_handler);

        var temp = "<td>" + insid + "</td>";
        for (var i = 0; i < CONST.inslist_cols_odd.length; i++) {
            temp += "<td data-content='' name='" + insid + "_" + CONST.inslist_cols_odd[i] + "'></td>"
        }
        tr_odd.innerHTML = temp;
        temp = "<td>" + insid_name + "</td>";
        for (var i = 0; i < CONST.inslist_cols_even.length; i++) {
            temp += "<td data-content='' name='" + insid + "_" + CONST.inslist_cols_even[i] + "'></td>"
        }
        tr_even.innerHTML = temp;
        DIVISIONS.tbody['childs'][insid] = {
            domOdd: tr_odd,
            domEven: tr_even
        };
        DIVISIONS["tbody"]['dom'].appendChild(tr_odd);
        DIVISIONS["tbody"]['dom'].appendChild(tr_even);

        var qt_c_tr_odd = document.createElement('tr'),
            qt_c_tr_even = document.createElement('tr');
        qt_c_tr_odd.className = 'odd ' + insid;
        qt_c_tr_even.className = 'even ' + insid;

        qt_c_tr_odd.addEventListener('click', click_handler);
        qt_c_tr_even.addEventListener('click', click_handler);

        qt_c_tr_odd.innerHTML = "<td>" + ins_id + "</td>";
        qt_c_tr_even.innerHTML = "<td>" + insid_name + "</td>";

        DIVISIONS.c_tbody['childs'][insid] = {
            domOdd: qt_c_tr_odd,
            domEven: qt_c_tr_even
        };
        DIVISIONS["c_tbody"]['dom'].appendChild(qt_c_tr_odd);
        DIVISIONS["c_tbody"]['dom'].appendChild(qt_c_tr_even);
    } // 画合约行
}

function click_handler_posdetail(insid) {
    if (DM.get_data('account_id') == '') {
        DM.update_data({
            state: {
                detail_ins_id: insid,
                detail_pos_id: "new"
            }
        });
        location.href = "#/app/posdetail";
    } else {
        var pos_list = DM.get_data('quotes' + +SEPERATOR+ + insid + SEPERATOR+ 'pos_list');
        if (pos_list) {
            var pos_id = pos_list.split(',')[0];
            DM.update_data({
                state: {
                    detail_ins_id: insid,
                    detail_pos_id: pos_id
                }
            });
            location.href = "#/app/posdetail";
        } else {
            DM.update_data({
                state: {
                    detail_ins_id: insid,
                    detail_pos_id: "new"
                }
            });
            location.href = "#/app/posdetail";
        }
    }
};

function draw_page_quote_detail(insid) {
    var quote = DM.get_data("quotes" + SEPERATOR + insid);
    var keys = CONST.inslist_cols_odd.concat(CONST.inslist_cols_even);
    for (var i = 0; i < keys.length; i++) {
        var div = DIVISIONS["tbody"]['dom'].querySelector('[name="' + insid + '_' + keys[i] + '"]');
        if (div && quote) {
            var val = quote[keys[i]] == undefined ? '' : quote[keys[i]];
            if (keys[i] == 'change_percent') {
                var changePercent = ((quote.last_price - quote.pre_close) / quote.pre_close * 100);
                val = isNaN(changePercent) ? '-' : changePercent.toFixed(2) + '%';
            }
            div.setAttribute('data-content', val);
            if (keys[i] == 'last_price' ||  keys[i] == 'change_percent') {
                if (quote.last_price - quote.pre_close >= 0) {
                    div.className = addClassName(div.className, 'R');
                } else {
                    div.className = addClassName(div.className, 'G');
                }
            }
        }
    }
}
