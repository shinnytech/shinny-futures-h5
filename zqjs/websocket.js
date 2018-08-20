(function(){
    function create_websocket (clear_key) {
        var isDebug = 0;

        var ws;
        var server_url = '';
        var queue = [];

        var req_id = 0;
        var _sessionid = Math.random().toString(36).substr(2);

        // 自动重连开关
        var reconnect = true;
        var reconnectTask;
        var reconnectInterval = 20000;

        var CONNECTING = 0;
        var OPEN = 1;
        var CLOSING = 2;
        var CLOSED = 3;

        var _order_id_list_to_show = [];

        function showNotifications(notifications) {
            for(var k in notifications){
                var noty = notifications[k];
                if(noty.type === 'INFO'){
                    Toast.message(noty.content);
                } else if(noty.type === 'WARNING' || noty.type === 'ERROR'){
                    Toast.alert(noty.content);
                }
            }
        }

        function showOrders(orders){
            for(var k in orders){
                var order = orders[k];
                if(_order_id_list_to_show.includes(order.order_id) && order.last_msg != '未成交'){
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
                var decoded = JSON.parse(message.data.replace(/\bNaN\b/g, '"-"'));
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
                console.info(JSON.stringify(event));
                // 清空 datamanager
                Toast.alert('服务器连接已断开！')
                DM.clear_data(clear_key);
                // 自动重连
                if (reconnect) {
                    reconnectTask = setInterval(function () {
                        if (ws.readyState === CLOSED){
                            Toast.message('服务器正在重连！')
                            init();
                        }
                    }, reconnectInterval);
                }
            };
            ws.onerror = function (error) {
                console.error(JSON.stringify(error, ["message", "arguments", "type", "name"]));
                ws.close();
            };
            ws.onopen = function () {
                req_id = 0;
                if (reconnectTask) {
                    clearInterval(reconnectTask);
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

