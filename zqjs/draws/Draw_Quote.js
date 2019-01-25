/**
 * [draw_page_quote description]
 * @return {[type]} [description]
 */

/**
 *  DIVISIONS = {
 *      tbody: {
 *          dom: [node];
 *          childs: {
 *              'SHFE.cu1701': {
 *                  odd: [node];
 *                  even: [node];
 *              },...
 *          }
 *      },
 *      insType: '',
 *      insList: [],
 *      showList: []
 *  }
 */
// {id: 'main', name: '主力合约'},
// {id: 'custom', name: '自选合约'},
// {id: 'SHFE', name: '上期所'},
// {id: 'CZCE', name: '郑商所'},
// {id: 'INE', name: '上期能源'},
// {id: 'DCE', name: '大商所'},
// {id: 'CFFEX', name: '中金所'},

var DIVISIONS = {
    tbody: undefined,
    products: undefined,
    insType: '',
    insList: [],
    productIndexList: [], // 全部合约的指数列表
    showList: [],
    stopScroll: null,
    innerHeight: window.innerHeight
}

function _init_tbody() {
    if (!DIVISIONS["tbody"]){
        var tbody = document.querySelector('.qt_container table.qt tbody');
        window.onresize = function(){
            DIVISIONS.innerHeight = window.innerHeight;
            if (DIVISIONS.productIndexList.length > 0 || DIVISIONS.insType === 'custom') {
                DIVISIONS["tbody"].dom.style.height = (DIVISIONS.innerHeight - 44 - 42 - 33) + 'px';
            } else {
                DIVISIONS["tbody"].dom.style.height = (DIVISIONS.innerHeight - 44 - 42) + 'px';
            }
        }
        if (DIVISIONS.productIndexList.length > 0 || DIVISIONS.insType === 'custom') {
            tbody.style.height = (DIVISIONS.innerHeight - 44 - 42 - 33) + 'px';
        } else {
            tbody.style.height = (DIVISIONS.innerHeight - 44 - 42) + 'px';
        }
        
        tbody.onscroll = function(){
            if (!tqsdk.get_by_path('state/is_scrolling'))
                tqsdk.update_data({
                    'state': { is_scrolling: true }
                });
            if(!DIVISIONS.stopScroll) DIVISIONS.stopScroll = setTimeout(function(){
                DIVISIONS.stopScroll = null;
                tqsdk.update_data({
                    'state': { is_scrolling: false }
                });
            }, 150);
        }
        DIVISIONS["tbody"] = {
            dom: tbody,
            childs: {}
        }
        DIVISIONS["products"] = {
            dom: document.querySelector('.qt_container div.products'),
            childs: {}
        };
    }
}

function draw_page_quote(state) {
    if (state.page !== 'quotes' ) return 
    _init_tbody();
    if (DIVISIONS.insType === 'custom' || DIVISIONS.insType !== state.ins_type) {
        DIVISIONS.insType = state.ins_type;
        if (DIVISIONS.insType == 'custom') {
            DIVISIONS.insList = state.custom_ins_list == '' ? [] : state.custom_ins_list.split(','); //window.InstrumentManager.getCustomInsList();
        } else {
            DIVISIONS.insList = InstrumentManager.getInsListByType(DIVISIONS.insType);
            tqsdk.subscribe_quote(DIVISIONS.insList.concat(InstrumentManager.getCustomInsList()));
        }
    
        DIVISIONS.tbody.dom.scrollTo(0, 0);
        DIVISIONS.products.dom.scrollTo(0, 0);

        // 2 删除不需要显示的合约 增加新的合约
        draw_page_quote_tbody(state);
        draw_page_quote_produces(state);
        setImmediate(draw_page_quote_detail)
    } 
    // 3 更新数据
    setImmediate(draw_page_quote_detail);
}

function draw_page_quote_tbody(state) {
    if (DIVISIONS.insList) {
        // 1 删除旧的合约
        for (var i = 0; i < DIVISIONS.showList.length; i++) {
            if (DIVISIONS.insType === 'custom' && DIVISIONS.insList.length > 0 && DIVISIONS.insList.indexOf(DIVISIONS.showList[i]) > -1)
                continue;
            let ins_id = DIVISIONS.showList[i]
            if (DIVISIONS.tbody['childs'][ins_id]) {
                DIVISIONS.tbody['dom'].removeChild(DIVISIONS.tbody['childs'][ins_id]['odd']);
                DIVISIONS.tbody['dom'].removeChild(DIVISIONS.tbody['childs'][ins_id]['even']);
                // tqsdk.unsubscribe('quotes/' + ins_id, DIVISIONS.tbody.childs[ins_id]['cb'])
                delete DIVISIONS.tbody['childs'][DIVISIONS.showList[i]];
                DIVISIONS.showList.splice(i--, 1);
            }
        }
        // 2 增加新的合约
        for (var i = 0; i < DIVISIONS.insList.length; i++) {
            if (DIVISIONS.showList.indexOf(DIVISIONS.insList[i]) < 0) {
                draw_page_quote_addtr(DIVISIONS.insList[i]);
                DIVISIONS.showList.push(DIVISIONS.insList[i]);
            }
        }
    }
}

function draw_page_quote_produces(state){
    var productIndexList = InstrumentManager.getProductListByType(DIVISIONS.insType);
    
    // remove all children
    while (DIVISIONS.products.dom.firstChild) {
        DIVISIONS.products.dom.removeChild(DIVISIONS.products.dom.firstChild);
    }
    if (productIndexList.length > 0) {
        for(var i=0 ; i<productIndexList.length; i++){
            var name = InstrumentManager.data[productIndexList[i]].product_short_name;
            var span = document.createElement('span');
            span.innerText = name ? name : InstrumentManager.data[productIndexList[i]].ins_name;
            span.onclick = click_handler_scroll_to(productIndexList[i]);
            DIVISIONS.products.dom.appendChild(span);
        }
        DIVISIONS.tbody.dom.style.height = (DIVISIONS.innerHeight - 44 - 42 - 40) + 'px';;
        DIVISIONS.products.dom.style.width = (50 * productIndexList.length) + 'px';
        DIVISIONS.products.dom.style.height = '40px';
    } else {
        DIVISIONS.tbody.dom.style.height = 
            DIVISIONS.insType === 'custom' ? (DIVISIONS.innerHeight - 44 - 42 - 33) + 'px' : (DIVISIONS.innerHeight - 44 - 42) + 'px';;
        DIVISIONS.products.dom.style.width = '0px';
        DIVISIONS.products.dom.style.height = '0px';
    }
    DIVISIONS.tbody.dom.nextElementSibling.hidden = DIVISIONS.insType === 'custom' ? false : true;
}

function click_handler_scroll_to(symbol){
    return function(e){
        e.target.style.color = '#aaa';
        setTimeout(function(){e.target.style.color = '#fff';}, 200);
        var index = DIVISIONS.showList.indexOf(symbol);
        DIVISIONS.tbody.dom.scrollTo(0, index * 41);
    }
}


function draw_page_quote_addtr(symbol) {
    var instument = tqsdk.get_quote(symbol);
    
    if (!DIVISIONS.tbody['childs'][symbol]) {
        // need paint the tr - .insid = quotes_keys[i]
        var tr_odd = document.createElement('tr'),
            tr_even = document.createElement('tr');
        tr_odd.className = 'odd ' + symbol;
        tr_even.className = 'even ' + symbol;
        var click_handler = click_handler_posdetail(symbol);
        tr_odd.addEventListener('click', click_handler);
        tr_even.addEventListener('click', click_handler);

        var temp = "<td>" + instument.ins_id + "</td>";
        for (var i = 0; i < CONST.inslist_cols_odd.length; i++) {
            temp += "<td data-content='' name='" + symbol + "_" + CONST.inslist_cols_odd[i] + "'></td>"
        }
        tr_odd.innerHTML = temp;
        temp = "<td>" + instument.ins_name + "</td>";
        for (var i = 0; i < CONST.inslist_cols_even.length; i++) {
            temp += "<td data-content='' name='" + symbol + "_" + CONST.inslist_cols_even[i] + "'></td>"
        }
        tr_even.innerHTML = temp;
        DIVISIONS.tbody['childs'][symbol] = {
            odd: tr_odd,
            even: tr_even
        };
        DIVISIONS["tbody"]['dom'].appendChild(tr_odd);
        DIVISIONS["tbody"]['dom'].appendChild(tr_even);

    } // 画合约行
}

function click_handler_posdetail(insid) {
    return function(){
        tqsdk.update_data({
            state: {
                page: 'posdetail',
                detail_ins_id: insid
            }
        });
        location.href = "#/app/posdetail";
    }
}

function draw_page_quote_detail(state){
    var is_scrolling = tqsdk.get_by_path('state/is_scrolling');
    if (!is_scrolling) {
        var scrollTop = DIVISIONS.tbody.dom.scrollTop;
        var startIndex = Math.floor(scrollTop / 41);
        var length = Math.ceil(DIVISIONS.innerHeight / 41);
        for (var i = 0; i < length && i + startIndex < DIVISIONS.showList.length; i++) {
            // 只更新可见数据
            var ins_id = DIVISIONS.showList[i + startIndex];
            draw_page_quote_detail_symbol(ins_id);
        }
    }
}

var _cols_to_price_fixed_list = ['change', 'last_price', 'bid_price1', 'ask_price1', 'highest', 'close', 'pre_close', 'lowest', 'open', 'price_tick', 'average', 'lower_limit', 'upper_limit', 'pre_settlement', 'settlement'];

function draw_page_quote_detail_symbol(symbol) {
    var quote = tqsdk.get_quote(symbol);
    var price_fixed = InstrumentManager.data[symbol].price_decs;
    var row_types = ['odd', 'even'];
    for (var j in row_types) {
        var list = CONST['inslist_cols_' + row_types[j]]
        for (var i = 0; i < list.length; i++) {
            var k = list[i];
            var div = DIVISIONS['tbody']['childs'][symbol][row_types[j]].children[symbol + '_' + k];
            if (div && quote) {
                var val = quote[k] == undefined ? '' : quote[k];
                if (k == 'change_percent') {
                    var changePercent = ((quote.last_price - quote.pre_settlement) / quote.pre_close * 100);
                    val = isNaN(changePercent) ? '-' : changePercent.toFixed(2) + '%';
                } else if (k == 'change') {
                    val = quote.last_price - quote.pre_settlement;
                    val = isNaN(val) ? '-' : val;
                } else if (k == 'volume_multiple'){
                    val = InstrumentManager.data[symbol].volume_multiple;
                } else if (k == 'price_tick'){
                    val = InstrumentManager.data[symbol].price_tick;
                }
                if (isNumber(val) && _cols_to_price_fixed_list.indexOf(k)>-1) {
                    val = val.toFixed(price_fixed);
                }
                div.setAttribute('data-content', val);
                if (k == 'last_price' || k == 'change_percent' || k == 'change') {
                    if (quote.last_price - quote.pre_settlement >= 0) {
                        div.className = addClassName(div.className, 'R');
                    } else {
                        div.className = addClassName(div.className, 'G');
                    }
                }
            }
        }
    }
}

