(function () {
    var isDebug = 0;

    var ws;
    var server_url = '';
    var queue = [];

    var req_id = 0;

    // 自动重连开关
    var reconnect = true;
    var reconnectTask;
    var reconnectInterval = 2000;

    var CONNECTING = 0;
    var OPEN = 1;
    var CLOSING = 2;
    var CLOSED = 3;

    var notification_index = 0;

    function showNotifications(notifications) {
        for(var i in notifications){
            var notify = notifications[i];
            DM.update_data({
                notifications: notify.content
            });
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
        ws = new WebSocket(server_url);
        ws.onmessage = function (message) {
            var decoded = JSON.parse(message.data);
            // update datamanager
            if (decoded.aid == "rtn_data") {
                for (var i = 0; i < decoded.data.length; i++) {
                    var temp = decoded.data[i];
                    // if (temp.notify) {
                        // console.log(JSON.stringify(temp.notify));
                        // showNotifications(temp.notify);
                    // }
                    if( i == decoded.data.length - 1){
                        DM.update_data(temp, "peekMessage");
                    }else{
                        DM.update_data(temp, "");
                    }
                }
            } else if (decoded.aid == "rsp_login") {
                DM.update_data({
                    account_id: decoded.account_id,
                    session_id: decoded.session_id
                }, "peekMessage");
            }
        };
        ws.onclose = function (event) {
            console.info(JSON.stringify(event));
            // 清空 datamanager
            DM.clear_data();
            // 自动重连
            if (reconnect) {
                reconnectTask = setInterval(function () {
                    if (ws.readyState === CLOSED) init();
                }, reconnectInterval);
            }
        };
        ws.onerror = function (error) {
            console.error(JSON.stringify(error));
            ws.close();
        };
        ws.onopen = function () {
            req_id = 0;
            if (reconnectTask) {
                clearInterval(reconnectTask);
            }

            var ins_list = [];
            if(DM.datas.positions){
                for(var key in DM.datas.positions){
                    var ins_id = DM.datas.positions[key].instrument_id;
                    ins_list.push(ins_id);
                }
            }

            var cus_ins_list = InstrumentManager.getCustomInsList();
            var main_ins_list = InstrumentManager.getMainInsList();

            ins_list = ins_list.concat(cus_ins_list);
            ins_list = ins_list.concat(main_ins_list);

            WS.send({
                aid: "subscribe_quote",
                ins_list: ins_list.join(',')
            });

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
        if (isReady()) {
            ws.send(JSON.stringify(message));
            if (isDebug) console.log("send ", message);
        } else queue.push(message);
    }

    this.TR_WS = {
        init: init,
        send: send,
        reinit: reinit,
        getReqid: function () {
            return (req_id++).toString(36);
        },
        peekMessage: function peekMessage() {
            if (isReady()) ws.send('{"aid":"peek_message"}');
        }
    }
}());
