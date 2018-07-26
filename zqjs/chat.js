var data = {};

var MessageQueue = [];

// 注意这里, 引入的 SDK 文件不一样的话, 你可能需要使用 SDK.NIM.getInstance 来调用接口
var nim = SDK.NIM.getInstance({
    debug: false,
    appKey: '45c6af3c98409b18a84451215d0bdd6e',
    account: 'mayanqiong',
    token: '73ee076b78f3c4e40124adbd23586062',
    onconnect: onConnect,
    onwillreconnect: onWillReconnect,
    ondisconnect: onDisconnect,
    onerror: onError,
    onsyncdone: onSyncDone,
    //消息
    onmsg: onMsg,
    onroamingmsgs: saveMsgs,
    onofflinemsgs: saveMsgs,
});

function onConnect(success) {
    console.log('[NIM] 连接成功');
    console.log(success);
}

function onWillReconnect(obj) {
    // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
    console.log('[NIM] 即将重连');
    console.log(obj.retryCount);
    console.log(obj.duration);
}

function onDisconnect(error) {
    // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
    console.log('[NIM] 丢失连接');
    console.log(error);
    if (error) {
        switch (error.code) {
            // 账号或者密码错误, 请跳转到登录页面并提示错误
        case 302:
            break;
            // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
        case 417:
            break;
            // 被踢, 请提示错误后跳转到登录页面
        case 'kicked':
            break;
        default:
            break;
        }
    }
}

function onError(error) {
    console.log(error);
}

function onSyncDone() {
    console.log('[NIM] 同步完成');
}

function onMsg(msg) {
    console.log('[NIM] 接受消息 ------ ' + msg.text);
    // console.log(msg);
    MessageQueue.push(msg);
    DM.update_data({
        state: {
            lastestChatTime: msg.time
        }
    });

}

function saveMsgs(msgs) {
    console.log(msgs);
    // msgs = msgs.msgs;
    // this.cache.addMsgs(msgs);
    // for (var i = 0; i < msgs.length; i++) {
    //     if (msgs[i].scene === "p2p") {
    //         this.person[msgs[i].from !== userUID ? msgs[i].from : msgs[i].to] = true;
    //     }
    // }

};

