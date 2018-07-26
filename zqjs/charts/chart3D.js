/** config 结构说明
 * 
    Chart3D_config_init = {
        numbersOfSpeace: 100,
        list: [{
            name: 'k',  
            type: 'kChart',
            layer: 1 ,
        },{
            name: 'bar',
            type: 'barChart',
            layer: 2 ,
        },{
            name: 'line',
            type: 'lineChart',
            color: 'red',
            layer: 3 ,
        }]
    }

    Chart3D_config_scale = {
        numbersOfSpeace
    }

    Chart3D_config_update = {
        max: 100,
        min: 0,
        axisY: [10, 20, 30],  // right value 值 介于 right.min & right.max
        axisX: [0, 10, 20, 30],  // 值 为显示的时间的 柱子位置
        list: [{
            name: 'k',
            datas: [
                {open: 0, close: 0, high: 0, low: 0},
                {open: 0, close: 0, high: 0, low: 0}
            ],
            colors: ['red', 'blue'], 
        },{
            name: 'bar',
            datas: [100, 200],
            colors: ['red', 'blue'], 
        },{
            name: 'line',
            datas: [100, 200]
        }]
    }
 */

var Chart3D = function(container, width, height) {
    // 不变部分
    this.container = container;
    this.width = width;
    this.height = height;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    // 右上角 3d 坐标
    var y = CAMERA_CONF.z * Math.tan(THREE.Math.degToRad(CAMERA_CONF.fov / 2)) * 2;
    var x = y / height * width;
    this.rightTop = { x: x, y: y };
    // 参数修改会导致变化的参数
    this.numberOfSpace = 0;
    this.lengthOfSpace = 0;
    this.chart_config = {
        rectXLen : 0,
        rectYLen : 0,
        lineWidth : 0,
        lineLength : 0
    };
    // 显示的数据
    this.max = 0;
    this.min = 0;
    this.axisY = [];
    this.axisX = [];
    // 3D 对象参数
    this.list_params = {};
    // 所有 3D 对象
    this.group = new THREE.Group(); // add // getObjectById getObjectByName
}
CAMERA_CONF = {
    'z': 1000,
    'fov': 60,
    'near': 100,
    'far': 1100,
}
CHART_COLOR = {
    'BACKGROUND': new THREE.Color(0x222222)
}
CHART_TYPE = {
    'kChart': 'KCHART',
    'barChart': 'BARCHART',
    'lineChart': 'LINECHART'
}
Chart3D.Utils = {
    'webglAvailable': function() {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },
    'getRectGeometry': function(x, y) {
        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, y);
        shape.lineTo(x, y);
        shape.lineTo(x, 0);
        shape.lineTo(0, 0);
        var geometry = new THREE.ShapeGeometry(shape);
        return geometry;
    },
    'getLineGeometry': function(pointA, pointB) {
        var geometry = new THREE.Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.computeLineDistances();
        geometry.vertices.push(
            new THREE.Vector3(pointA.x, pointA.y, pointA.z),
            new THREE.Vector3(pointB.x, pointB.y, pointB.z)
        );
        return geometry;
    },
    'getRectMesh': function(geometry, x, y, z) {
        var material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xffffff),
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        return mesh;
    },
    'getLine': function(geometry, lineWidth, x, y, z) {
        var material = new THREE.LineBasicMaterial({
            color: new THREE.Color(0xffffff),
            linewidth: lineWidth,
        });
        var line = new THREE.Line(geometry, material);
        line.position.set(x, y, z);
        line.rotation.set(0, 0, 0);
        line.scale.set(1, 1, 1);
        return line;
    }
}
Chart3D.prototype.init = function(config) {
    this.init3DScene(); // do only once
    this.initConfig(config.numberOfSpace);
    this.initListParams(config); // do only once
    this.initObject();
    // 初始化 X / Y 轴
    this.initYAxis(); // do only once
    this.initXAxis(); // do only once
}
Chart3D.prototype.scale = function(numberOfSpace){
    this.initConfig(numberOfSpace);
    this.reinitObject();
}
Chart3D.prototype.initConfig = function(numberOfSpace) {
    // 间隔个数 间隔宽度(3d)
    this.numberOfSpace = numberOfSpace;
    this.lengthOfSpace = this.rightTop.x / numberOfSpace;
    // 柱子默认宽高、线条默认粗细长度
    this.chart_config.rectXLen = this.rightTop.x / numberOfSpace * 0.8;
    this.chart_config.rectYLen = 100;
    this.chart_config.lineWidth = this.rightTop.y / this.height * 0.1; // .5px
    this.chart_config.lineLength = 100;
}
Chart3D.prototype.init3DScene = function() {
    // init 3d component
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.camera = new THREE.PerspectiveCamera(CAMERA_CONF.fov, this.width / this.height, CAMERA_CONF.near, CAMERA_CONF.far);
    this.camera.position.set(this.rightTop.x / 2, this.rightTop.y / 2, CAMERA_CONF.z);
    this.scene.add(this.camera);
    this.scene.add(this.group);
    if (Chart3D.Utils.webglAvailable()) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    } else {
        this.renderer = new THREE.CanvasRenderer({
            antialias: true
        });
    }
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(CHART_COLOR.BACKGROUND, 1.0);
    this.container.appendChild(this.renderer.domElement);
}
Chart3D.prototype.reinitObject = function(){
    for (var n in this.list_params){
        var conf = this.list_params[n];
        if (conf.type == CHART_TYPE.kChart) {
            this.reinitKlineGroup(conf);
        } else if (conf.type == CHART_TYPE.barChart) {
            this.reinitBarGroup(conf);
        } else if (conf.type == CHART_TYPE.lineChart) {
            this.reinitLineGroup(conf);
        }
    }
}
Chart3D.prototype.reinitKlineGroup = function(conf) {
    var group = this.group.getObjectByName(conf.name);

    var rectGeometry = Chart3D.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    var pointA = {x:0, y:0, z:0};
    var pointB = {x:0, y:this.chart_config.lineLength, z:0};
    var lineGeometry = Chart3D.Utils.getLineGeometry(pointA, pointB);

    var indexOfGroup = 0;
    var rect, line;
    for (var i = 0; i < this.numberOfSpace; i++) {
        if(group.children[indexOfGroup]){
            rect = group.children[indexOfGroup].children[0];
            line = group.children[indexOfGroup].children[1];
            rect.geometry.verticesNeedUpdate = true;
            line.geometry.verticesNeedUpdate = true;
            rect.geometry.vertices[0].set(0, 0, 0);
            rect.geometry.vertices[1].set(0, this.chart_config.rectYLen, 0);
            rect.geometry.vertices[2].set(this.chart_config.rectXLen, this.chart_config.rectYLen, 0);
            rect.geometry.vertices[3].set(this.chart_config.rectXLen, 0, 0);
            rect.position.set(i * this.lengthOfSpace, 0, conf.layer);
            line.geometry.vertices[0].set( 0, 0, 0);
            line.geometry.vertices[1].set( 0, this.chart_config.lineLength, 0);
            line.position.set(this.chart_config.rectXLen / 2 + i * this.lengthOfSpace, 0, conf.layer);
        }else{
            var object = new THREE.Object3D();
            rect = Chart3D.Utils.getRectMesh(rectGeometry, i * this.lengthOfSpace, 0, conf.layer);
            line = Chart3D.Utils.getLine(lineGeometry, this.chart_config.lineWidth, this.chart_config.rectXLen / 2 + i * this.lengthOfSpace, 0, conf.layer);
            object.add(rect);
            object.add(line);
            group.add(object);
        }
        indexOfGroup ++;
    }
    while(group.children[indexOfGroup]){
        rect = group.children[indexOfGroup].children[0];
        line = group.children[indexOfGroup].children[1];
        rect.position.setX(this.rightTop.x + 10);
        line.position.setX(this.rightTop.x + 10);
        indexOfGroup++;
    }
}

Chart3D.prototype.reinitBarGroup = function(conf) {
    var group = this.group.getObjectByName(conf.name);
    var rectGeometry = Chart3D.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    var indexOfGroup = 0;
    var barRect;
    for (var i = 0; i < this.numberOfSpace; i++) {
        if(group.children[indexOfGroup]){
            barRect = group.children[indexOfGroup];
            barRect.geometry.verticesNeedUpdate = true;
            barRect.geometry.vertices[0].set(0, 0, 0);
            barRect.geometry.vertices[1].set(0, this.chart_config.rectYLen, 0);
            barRect.geometry.vertices[2].set(this.chart_config.rectXLen, this.chart_config.rectYLen, 0);
            barRect.geometry.vertices[3].set(this.chart_config.rectXLen, 0, 0);
            barRect.position.set(i * this.lengthOfSpace, 0, conf.layer);
        }else{
            barRect = Chart3D.Utils.getRectMesh(rectGeometry, i * this.lengthOfSpace, 0, conf.layer);
            group.add(barRect);
        }
        indexOfGroup ++;
    }
    while(group.children[indexOfGroup]){
        barRect = group.children[indexOfGroup];
        barRect.position.setX(this.rightTop.x + 10);
        indexOfGroup++;
    }
}
Chart3D.prototype.reinitLineGroup = function(conf) {
    var group = this.group.getObjectByName(conf.name);
    var indexOfGroup = 0;
    for (var i = 0; i < this.numberOfSpace - 1; i++) {
        if(group.children[indexOfGroup]){
            var line = group.children[indexOfGroup];
            line.geometry.verticesNeedUpdate = true;
            line.geometry.vertices[0].set(this.chart_config.rectXLen / 2 + i * this.lengthOfSpace, 0, 0);
            line.geometry.vertices[1].set(this.chart_config.rectXLen / 2 + (i + 1) * this.lengthOfSpace, 0, 0);
            line.position.set(0, 0, conf.layer);
        }else{
            var lineGeometry = Chart3D.Utils.getLineGeometry({
                x: this.chart_config.rectXLen / 2 + i * this.lengthOfSpace,
                y: 0, 
                z: 0
            }, { 
                x: this.chart_config.rectXLen / 2 + (i+1) * this.lengthOfSpace,
                y: 0, 
                z: 0
            });
            var line = Chart3D.Utils.getLine(lineGeometry, this.chart_config.lineWidth, 0, 0, conf.layer);
            line.material.color.set(conf.color);
            group.add(line);
        }
        indexOfGroup ++;
    }
    while(group.children[indexOfGroup]){
        var line = group.children[indexOfGroup];
        line.position.setX(this.rightTop.x + 10);
        indexOfGroup++;
    }
}
Chart3D.prototype.initListParams = function(config) {
    for (var i = 0; i < config.list.length; i++) {
        var conf = config.list[i];
        this.list_params[conf.name] = {
            name: conf.name,
            type: conf.type,
            layer: conf.layer,
            color: conf.color ? conf.color : null
        }
    }
}
Chart3D.prototype.initObject = function() {
    for (var n in this.list_params){
        var conf = this.list_params[n];
        if (conf.type == CHART_TYPE.kChart) {
            this.initKlineGroup(conf);
        } else if (conf.type == CHART_TYPE.barChart) {
            this.initBarGroup(conf);
        } else if (conf.type == CHART_TYPE.lineChart) {
            this.initLineGroup(conf);
        }
    }
}
Chart3D.prototype.initKlineGroup = function(conf) {
    var group = new THREE.Group();
    group.name = conf.name;
    var rectGeometry = Chart3D.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    var pointA = {x:0, y:0, z:0};
    var pointB = {x:0, y:this.chart_config.lineLength, z:0};
    var lineGeometry = Chart3D.Utils.getLineGeometry(pointA, pointB);
    for (var i = 0; i < this.numberOfSpace; i++) {
        var object = new THREE.Object3D();
        var rectMesh = Chart3D.Utils.getRectMesh(rectGeometry, i * this.lengthOfSpace, 0, conf.layer);
        var line = Chart3D.Utils.getLine(lineGeometry, this.chart_config.lineWidth, this.chart_config.rectXLen / 2 + i * this.lengthOfSpace, 0, conf.layer);
        object.add(rectMesh);
        object.add(line);
        group.add(object);
    }
    this.group.add(group);
}
Chart3D.prototype.initBarGroup = function(conf) {
    var group = new THREE.Group();
    group.name = conf.name;
    var rectGeometry = Chart3D.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    for (var i = 0; i < this.numberOfSpace; i++) {
        var rectMesh = Chart3D.Utils.getRectMesh(rectGeometry, i * this.lengthOfSpace, 0, conf.layer);
        group.add(rectMesh);
    }
    this.group.add(group);
}
Chart3D.prototype.initLineGroup = function(conf) {
    var group = new THREE.Group();
    group.name = conf.name;
    var pointA = {
        x: this.chart_config.rectXLen / 2,
        y: 0,
        z: conf.layer
    };
    var pointB = {
        x: 0,
        y: 0,
        z: conf.layer
    };
    for (var i = 1; i < this.numberOfSpace; i++) {
        pointB.x = pointA.x + this.lengthOfSpace;
        var lineGeometry = Chart3D.Utils.getLineGeometry(pointA, pointB);
        var line = Chart3D.Utils.getLine(lineGeometry, this.chart_config.lineWidth, 0, 0, conf.layer);
        line.material.color.set(conf.color);
        pointA.x = pointB.x;
        group.add(line);
    }
    this.group.add(group);
}
Chart3D.prototype.initYAxis = function() {
    var group = new THREE.Group();
    group.name = 'axisY';
    var geometry = Chart3D.Utils.getLineGeometry({
        x: 0,
        y: 0,
        z: 0
    }, {
        x: this.rightTop.x,
        y: 0,
        z: 0
    });
    for (var i = 0; i < 50; i++) {
        var line = Chart3D.Utils.getLine(geometry, this.chart_config.lineWidth, 0, 0, -CAMERA_CONF.far);
        line.material.color.set('#333333')
        group.add(line);
    }
    this.group.add(group);
}
Chart3D.prototype.initXAxis = function() {
    var group = new THREE.Group();
    group.name = 'axisX';
    var geometry = Chart3D.Utils.getLineGeometry({
        x: 0,
        y: 0,
        z: 0
    }, {
        x: 0,
        y: this.rightTop.y,
        z: 0
    });
    for (var i = 0; i < 50; i++) {
        var line = Chart3D.Utils.getLine(geometry, this.chart_config.lineWidth, 0, 0, -CAMERA_CONF.far);
        line.material.color.set('#333333')
        group.add(line);
    }
    this.group.add(group);
}
Chart3D.prototype.update = function(config) {
    this.updateConfig(config);
    var price3DRatio = this.rightTop.y / (this.max - this.min);
    for (var i = 0; i < config.list.length; i++) {
        var conf = config.list[i];
        var args = {
            price3DRatio: price3DRatio,
            datas: conf.datas,
            colors: conf.colors,
            layer: this.list_params[conf.name].layer
        }
        if (conf.type == CHART_TYPE.kChart) {
            this.updateKlineGroup(conf.name, args);
        } else if (conf.type == CHART_TYPE.barChart) {
            this.updateBarGroup(conf.name, args);
        } else if (conf.type == CHART_TYPE.lineChart) {
            this.updateLineGroup(conf.name, args);
        }
    }
    this.updateYAxis();
    this.updateXAxis();
    this.render();
}
Chart3D.prototype.updateConfig = function(config){
    this.min = config.min;
    this.max = config.max;
    this.axisY = config.axisY;
    this.axisX = config.axisX;
}
Chart3D.prototype.updateKlineGroup = function(name, args) {
    var index = 0;
    var group = this.group.getObjectByName(name);
    for (var i = 0; i < this.numberOfSpace; i++) {
        var rect = group.children[i].children[0];
        var line = group.children[i].children[1];
        if (args.datas[i] == {} || args.datas[i] == null) {
            rect.position.setY(this.rightTop.y + 10); // 不显示这个柱子
            line.position.setY(this.rightTop.y + 10); // 不显示这个柱子
        } else {
            var open = args.datas[i].open;
            var close = args.datas[i].close;
            var high = args.datas[i].high;
            var low = args.datas[i].low;

            var dis = close - open;
            var rectY;
            if (dis >= 0) {
                rectY = args.price3DRatio * (open - this.min);
            } else {
                rectY = args.price3DRatio * (close - this.min);
            }
            rect.material.color.set(args.colors[i]);
            line.material.color.set(args.colors[i]);
            rect.position.setY(rectY);
            var lineY = args.price3DRatio * (low - this.min);
            line.position.setY(lineY);
            if(high == low){
                line.scale.setY(this.rightTop.y / this.height * 1 / this.chart_config['rectYLen']); // 只显示 1px
            }else{
                line.scale.setY(args.price3DRatio * (high - low) / this.chart_config['rectYLen']);
            }
            if (dis == 0) {
                rect.scale.setY(this.rightTop.y / this.height * 1 / this.chart_config['rectYLen']); // 只显示 1px
            } else {
                rect.scale.setY(args.price3DRatio * Math.abs(dis) / this.chart_config['rectYLen']);
            }
        }
    }
}
Chart3D.prototype.updateBarGroup = function(name, args) {
    var group = this.group.getObjectByName(name);
    for (var i = 0; i < this.numberOfSpace; i++) {
        var barRect = group.children[i];
        if (args.datas[i] == {} || args.datas[i] == null) {
            barRect.position.setY(this.rightTop.y + 10); // 不显示这个柱子
        } else {
            var color = args.colors[i];
            barRect.material.color.set(color);
            if(args.datas[i] > this.min){
                var scaley = args.price3DRatio * (args.datas[i] - this.min) / this.chart_config.rectYLen;
                barRect.position.setY(0);
                barRect.scale.setY(scaley);
            }else{
                barRect.position.setY(this.rightTop.y + 10);// 不显示这个柱子
            }
        }
    }
}
Chart3D.prototype.updateLineGroup = function(name, args) {
    var group = this.group.getObjectByName(name);
    var dataA = args.datas[0];
    var dataB = args.datas[1];
    var yA = args.price3DRatio * (dataA - this.min);
    var yB = args.price3DRatio * (dataB - this.min);
    
    for (var i = 0; i < this.numberOfSpace - 1; i++) {
        var line = group.children[i];
        line.geometry.verticesNeedUpdate = true;
        if (i == this.numberOfSpace - 1 || args.datas[i] == null || args.datas[i + 1] == null) {
            line.position.setZ(-1000);
        } else { // dataA dataB
            dataB = args.datas[i + 1];
            yB = args.price3DRatio * (dataB - this.min);
            line.geometry.vertices[0].setY(yA);
            line.geometry.vertices[1].setY(yB);
            line.position.setZ(args.layer);
            dataA = dataB;
            yA = yB;
        }
    }
}
Chart3D.prototype.updateYAxis = function() {
    var group = this.group.getObjectByName('axisY');
    var price3DRatio = this.rightTop.y / (this.max - this.min);
    for(var i=0; i< 50; i++){
        var line = group.children[i];
        line.position.setZ( -CAMERA_CONF.far);
    }
    for (var i = 0; i < this.axisY.length; i++) {
        var line = group.children[i];
        line.position.setY(price3DRatio * (this.axisY[i] - this.min));
        line.position.setZ(0);
    }
}
Chart3D.prototype.updateXAxis = function() {
    var group = this.group.getObjectByName('axisX');
    for(var i=0; i< 50; i++){
        var line = group.children[i];
        line.position.setZ( -CAMERA_CONF.far);
    }
    for (var i = 0; i < this.axisX.length; i++) {
        var line = group.children[i];
        line.position.setX(this.chart_config.rectXLen / 2 + this.axisX[i] * this.lengthOfSpace);
        line.position.setZ( -1);
    }
}
Chart3D.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
}