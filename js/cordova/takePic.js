var jtoJHandle = {
    takePictures: function (str, picType, cookie) {
        var cameraSuccess = function (imageData) {
            console.log('cameraSuccess result : ' + imageData);
            uploadPictures(imageData, picType);
        }

        var cameraError = function (message) {
            console.log('cameraError by : ' + message);
        }

        var cameraOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        }

        navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    },
    closeSJKH: function () {
        window.location.href = 'http://www.zhongqijiaoyi.com/mobile/';
    },
    checkAppVersion: function () {
        return true;
    }
};

var getInfo = function () {
    return true;
}

//file:///data/user/0/com.xinyi.hello/files/cordova-hot-code-push-plugin/2016.08.30-11.26.12/www/index.html#/app/tabs/quote

sdkFlag = 'true';

// param = takePictures("parsePicUrl_collect",picType,APP_collect.cookie);
