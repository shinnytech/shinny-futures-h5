(function(){
    function create_websocket (clear_key) {
        var isDebug = 0;

        var ws;
        var server_url = '';
        var queue = [];

        var req_id = 0;
        var req_login = null;
        var subscribe_quote = null;
        var _sessionid = Math.random().toString(36).substr(2);

        // 自动重连开关
        var reconnect = true;
        var reconnectTask;
        var reconnectInterval = SETTING.reconnect_interval ? SETTING.reconnect_interval : 2000;
        var reconnectMaxTimes = SETTING.reconnect_max_times ? SETTING.reconnect_max_times : 5;
        var reconnectTimes = 0;

        var CONNECTING = 0;
        var OPEN = 1;
        var CLOSING = 2;
        var CLOSED = 3;

        var _order_id_list_to_show = [];

        function showNotifications(notifications) {
            for(var k in notifications){
                var noty = notifications[k];
                if(noty.level === 'INFO' && noty.type === 'MESSAGE'){
                    Toast.message(noty.content);
                } else if(noty.level === 'WARNING' || noty.level === 'ERROR'){
                    Toast.alert(noty.content);
                }
            }
        }

        function showOrders(orders){
            for(var k in orders){
                var order = orders[k];
                if(_order_id_list_to_show.indexOf(order.order_id) > -1 && order.last_msg != '未成交'){
                    var msg = order.instrument_id;
                    msg += order.direction === "BUY" ? " 买" : " 卖";
                    msg += order.offset === "OPEN" ? "开 " : "平 ";
                    msg += order.volume_orign + "手 价格" + order.limit_price + " ";
                    msg += '\n' + order.last_msg;
                    Toast.message(msg);
                }
            }
        }

        function reinit(url) {
            reconnect = true;
            if (typeof ws === 'undefined') {
                init(url);
            } else {
                server_url = url;
                ws.close();
            }
        }

        function init(url) {
            reconnect = true;
            if (typeof url == 'string' && url != server_url) {
                server_url = url;
            }
            _order_id_list_to_show = [];
            ws = new WebSocket(server_url);
            ws.onmessage = function (message) {
                var decoded = eval('(' + message.data + ')');
                // update datamanager
                if (decoded.aid == "rtn_data") {
                    for (var i = 0; i < decoded.data.length; i++) {
                        var temp = decoded.data[i];
                        if (temp.notify) showNotifications(temp.notify)
                        DM.update_data(temp, "");
                        if(DM.datas.account_id && temp.trade && temp.trade[DM.datas.account_id]
                            && temp.trade[DM.datas.account_id].orders){
                            var orders = temp.trade[DM.datas.account_id].orders;
                            showOrders(orders)
                        }
                    }
                } else if (decoded.aid == "rtn_brokers"){
                    DM.update_data({
                        brokers: decoded.brokers
                    }, "");
                } else if (decoded.aid == "rsp_login") {
                    DM.update_data({
                        account_id: decoded.account_id,
                        session_id: decoded.session_id
                    }, "");
                }
                ws.send('{"aid":"peek_message"}');
            };
            ws.onclose = function (event) {
                // 清空 datamanager
                Toast.alert('服务器连接已断开！')
                DM.clear_data(clear_key);
                if(reconnectTimes >= reconnectMaxTimes){
                    Toast.alert('服务器已经重连 ' + reconnectTimes + ' 次，到达最大重连次数，请检查网络后重新打开。');
                    clearInterval(reconnectTask);
                    reconnectTask = null;
                    return;
                } else {
                    // 自动重连
                    if (reconnect && !reconnectTask) {
                        reconnectTimes += 1;
                        reconnectTask = setInterval(function () {
                            if (ws.readyState === CLOSED){
                                Toast.message('服务器正在重连！');
                                clearInterval(reconnectTask);
                                reconnectTask = null;
                                init();
                            }
                        }, reconnectInterval);
                    }
                }

            };
            ws.onerror = function (error) {
                console.error(JSON.stringify(error, ["message", "arguments", "type", "name"]));
                ws.close();
            };
            ws.onopen = function () {
                reconnectTimes = 0;
                req_id = 0;
                if(subscribe_quote) {ws.send(JSON.stringify(subscribe_quote))};
                if(req_login) {ws.send(JSON.stringify(req_login))};
                if (reconnectTask) {
                    clearInterval(reconnectTask);
                    reconnectTask = null;
                }
                if (queue.length > 0) {
                    while (queue.length > 0) {
                        if (isReady()) send(queue.shift());
                        else break;
                    }
                }
            };
        }

        function isReady() {
            if (typeof ws === 'undefined') return false;
            else return ws.readyState === OPEN;
        }

        function send(message) {
            if(message.aid === 'req_login'){
                req_login = message;
            } else if (message.aid === 'subscribe_quote'){
                subscribe_quote = message;
            }

            if(message.aid === 'insert_order'){
                _order_id_list_to_show.push(message.order_id)
            }
            if (isReady()) {
                ws.send(JSON.stringify(message));
                if (isDebug) console.log("send ", message);
            } else queue.push(message);
        }

        return {
            init: init,
            send: send,
            reinit: reinit,
            getReqid: function () {
                return _sessionid + '@' + (req_id++).toString(36);
            },
            peekMessage: function peekMessage() {
                if (isReady()) ws.send('{"aid":"peek_message"}');
            }
        }
    }

    this.WS = create_websocket('all');
    this.TR_WS = create_websocket('trade');
}());

