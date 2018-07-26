




var colorList = ["lightpink", "pink", "lavenderblush", "palevioletred", "hotpink", "deeppink", "orchid", "thistle", "plum", "violet", "magenta", "fuchsia", "mediumorchid", "lavender", "ghostwhite", "blue", "royalblue", "cornflowerblue", "lightsteelblue", "lightslategray", "slategray", "dodgerblue", "aliceblue", "steelblue", "lightskyblue", "skyblue", "deepskyblue", "lightblue", "powderblue", "cadetblue", "azure", "lightcyan", "paleturquoise", "cyan", "aqua", "darkturquoise", "darkcyan", "mediumturquoise", "lightseagreen", "turquoise", "aquamarine", "mediumaquamarine", "mediumspringgreen", "mintcream", "springgreen", "mediumseagreen", "seagreen", "honeydew", "lightgreen", "palegreen", "darkseagreen", "limegreen", "lime", "chartreuse", "lawngreen", "greenyellow", "yellowgreen", "beige", "lightgoldenrodyellow", "ivory", "lightyellow", "yellow", "lemonchiffon", "palegoldenrod", "khaki", "gold", "cornsilk", "goldenrod", "floralwhite", "oldlace", "wheat", "moccasin", "orange", "papayawhip", "blanchedalmond", "navajowhite", "antiquewhite", "tan", "burlywood", "bisque", "darkorange", "linen", "peru", "peachpuff", "sandybrown", "chocolate", "seashell", "lightsalmon", "coral", "orangered", "darksalmon", "tomato", "mistyrose", "salmon", "snow", "lightcoral", "rosybrown", "indianred", "red", "brown", "white", "whitesmoke", "gainsboro", "lightgrey", "Silver", "darkgray"];

// http://cng.seas.rochester.edu/CNG/docs/x11color.html 


// var CHART_CONFIG = function(width, height, conf) {
//     // width, height 整个容器的宽高
//     this.coordinateZ = 0;
//     this.chartZ = 1;

//     // 右上角 Y 坐标
//     this['rightTopY'] = CHART_CONFIG.CHART_CAMERA['z'] * Math.tan(THREE.Math.degToRad(CHART_CONFIG.CHART_CAMERA['fov'] / 2)) * 2;
//     // 右上角 3D 坐标 X
//     this['rightTopX'] = this['rightTopY'] / height * width;

//     // 容器3D高度 / 容器高度
//     this['device3DRatio'] = this['rightTopY'] / height;

//     // 线宽度
//     this['lineWidth'] = 1 * this['device3DRatio'];
//     // 柱子和线 初始高度/长度
//     this['rectYLen'] = 100;

//     //================
//     this.numberOfSpace = conf.numberOfSpace;
//     this.Xinterval = conf.Xinterval;

//     // 坐标层 上下留白
//     this['coordinateMarginTopPx'] = 5;
//     this['coordinateMarginBottomPx'] = 5;


//     this['gridY_MAX'] = CHART_CONFIG.COMMON_CONF['gridYPx_MAX'] * this['device3DRatio'];
//     this['gridY_MIN'] = CHART_CONFIG.COMMON_CONF['gridYPx_MIN'] * this['device3DRatio'];

//     // 柱子宽度
//     this['rectXLen'] = this['lengthOfSpace'] * CHART_CONFIG.COMMON_CONF['rectXPercentage'];

//     // 柱子间距
//     this['distanceX'] = this['lengthOfSpace'] - this['rectXLen'];

//     // 价格数据相关=============
//     // 容器3D高度 / 价格范围
//     this['price3DRatio'] = 1;
//     this['price3DRatioPriceTick'] = 1;
// };

// CHART_CONFIG.CHART_COLOR = {
//     'BACKGROUND': new THREE.Color(0x222222),
//     'RED': new THREE.Color(0xfc4d21),
//     'GREEN': new THREE.Color(0x64e8e8),
//     'BLACK': new THREE.Color(0x000000),
//     'WHITE': new THREE.Color(0xffffff),
//     'LINE': new THREE.Color(0xaaaaaa),
// }

// CHART_CONFIG.getColor = function(color) {
//     if (CHART_CONFIG.CHART_COLOR[color]) {
//         return CHART_CONFIG.CHART_COLOR[color];
//     } else {
//         return new THREE.Color(color);
//     }
// }

// CHART_CONFIG.COMMON_CONF = {
//     //X轴 最大值 最小值
//     'spacePx_MAX': 30,
//     'spacePx_MIN': 2,
//     // space 像素宽度
//     'spacePx': 10,

//     //Y轴 坐标间隔距离 最大值 最小值
//     'gridYPx_MAX': 50,
//     'gridYPx_MIN': 45,

//     //X轴 坐标间隔距离 最大值 最小值
//     'gridXPx_height': 20,
//     'gridXPx': 100,
//     'gridXPx_MIN': 80,

//     // 柱子宽度占预留空间的比例
//     'rectXPercentage': 0.6,

//     // 坐标层 z 坐标, 左右留白
//     'coordinateZ': 0,
//     'coordinateMarginLeftPx': 5,
//     'coordinateMarginRightPx': 5,

//     // 图表层 z 坐标， 左右留白
//     'chartZ': 1,
//     'chartMarginLeftPx': 10,
//     'chartMarginRightPx': 50,
// }

// CHART_CONFIG.prototype.reset = function(width, height, numberOfSpace, Xinterval) {
//     this.numberOfSpace = numberOfSpace;
//     this.Xinterval = Xinterval;

//     this['rightTopX'] = this['rightTopY'] / height * width;
//     this['device3DRatio'] = this['rightTopY'] / height;

//     this['coordinateMarginLeft'] = CHART_CONFIG.COMMON_CONF['coordinateMarginLeftPx'] * this['device3DRatio'];
//     this['coordinateMarginRight'] = CHART_CONFIG.COMMON_CONF['coordinateMarginRightPx'] * this['device3DRatio'];

//     this['chartMarginLeft'] = CHART_CONFIG.COMMON_CONF['chartMarginLeftPx'] * this['device3DRatio'];
//     this['chartMarginRight'] = CHART_CONFIG.COMMON_CONF['chartMarginRightPx'] * this['device3DRatio'];

//     this['coordinateMarginTop'] = this['coordinateMarginTopPx'] * this['device3DRatio'];
//     this['coordinateMarginBottom'] = this['coordinateMarginBottomPx'] * this['device3DRatio'];

//     this['chartMarginTop'] = this['chartMarginTopPx'] * this['device3DRatio'];
//     this['chartMarginBottom'] = this['chartMarginBottomPx'] * this['device3DRatio'];

//     this['chartHeight'] = this['rightTopY'] - this['chartMarginTop'] - this['chartMarginBottom'];
//     this['chartWidth'] = this['rightTopX'] - this['chartMarginLeft'] - this['chartMarginRight'];
//     this['lengthOfSpace'] = CHART_CONFIG.COMMON_CONF['spacePx'] * this['device3DRatio'];
//     this['gridY_MAX'] = CHART_CONFIG.COMMON_CONF['gridYPx_MAX'] * this['device3DRatio'];
//     this['gridY_MIN'] = CHART_CONFIG.COMMON_CONF['gridYPx_MIN'] * this['device3DRatio'];
//     this['rectXLen'] = this['lengthOfSpace'] * CHART_CONFIG.COMMON_CONF['rectXPercentage'];
//     this['distanceX'] = this['lengthOfSpace'] - this['rectXLen'];

// };

// // 增加/减少 space 像素值
// CHART_CONFIG.prototype.scaleX = function(x, numberOfSpace, Xinterval) {
//     this.numberOfSpace = numberOfSpace;
//     this.Xinterval = Xinterval;
//     this['spacePx'] = x;
//     this['lengthOfSpace'] = CHART_CONFIG.COMMON_CONF['spacePx'] * this['device3DRatio'];
//     this['rectXLen'] = this['lengthOfSpace'] * CHART_CONFIG.COMMON_CONF['rectXPercentage'];
//     this['distanceX'] = this['lengthOfSpace'] - this['rectXLen'];
// }


/** =========================== */

// CHART.prototype.initPanel = function() {
//     this.panel['dom'] = document.createElement('div');
//     this.panel['dom'].style.position = 'absolute';
//     this.panel['dom'].style.left = '0px';
//     this.panel['dom'].style.top = '0px';
//     this.panel['dom'].style.width = this.width + 'px';
//     this.panel['dom'].style.height = this.height + 'px';
//     this.panel['dom'].style.backgroundColor = 'transparent';
//     this.panel['childPanels'] = {};
//     this.container.appendChild(this.panel['dom']);
// }

// CHART.prototype.initYAxis = function() {
//     this.coordinatesY['YAxisGroup'] = new THREE.Group();
//     var YAxisGeometry = new THREE.Geometry();
//     YAxisGeometry.vertices.push(
//         new THREE.Vector3(0, 0, 0),
//         new THREE.Vector3(this.config['rectYLen'], 0, 0)
//     );
//     YAxisGeometry.computeLineDistances();

//     var YAxisMeterial = new THREE.LineDashedMaterial({
//         color: CHART_CONFIG.CHART_COLOR['LINE'],
//         linewidth: this.config['lineWidth'],
//         gapSize: 0.5,
//         dashSize: 1
//     });

//     for (var i = 0; i < 50; i++) {
//         var line = new THREE.Line(YAxisGeometry, YAxisMeterial);
//         line.position.set(0, 0, -CHART_CONFIG.CHART_CAMERA['far']);
//         line.rotation.set(0, 0, 0);
//         line.scale.set(1, 1, 1);
//         this.coordinatesY['YAxisGroup'].add(line);
//     }
//     this.scene.add(this.coordinatesY['YAxisGroup']);
//     // initYAxisText
//     this.coordinatesY['dom'] = document.createElement('div');
//     this.coordinatesY['dom'].style.position = 'absolute';
//     this.coordinatesY['dom'].style.right = '0px';
//     this.coordinatesY['dom'].style.top = '0px';
//     this.coordinatesY['dom'].style.color = '#ffffff';
//     this.coordinatesY['dom'].style.width = (this.config['klineMarginRight'] / this.config['device3DRatio']) + 'px';
//     this.coordinatesY['datas'] = [];
//     this.coordinatesY['domChildren'] = [];
//     this.coordinatesY['update'] = function(chart) {
//         for (var i = 0; i < chart.coordinatesY['datas'].length; i++) {
//             chart.coordinatesY['domChildren'][i].innerText = chart.coordinatesY['datas'][i] + '';
//         }
//     }
//     this.container.appendChild(this.coordinatesY['dom']);
// }

// CHART.prototype.initMaxMinContainer = function() {

//     this.maxMinContainer['domMax'] = document.createElement('div');
//     this.maxMinContainer['domMax'].style.position = 'absolute';
//     this.maxMinContainer['domMax'].style.left = '0px';
//     this.maxMinContainer['domMax'].style.top = '0px';
//     this.maxMinContainer['domMax'].style.color = '#ffffff';

//     this.maxMinContainer['domMin'] = document.createElement('div');
//     this.maxMinContainer['domMin'].style.position = 'absolute';
//     this.maxMinContainer['domMin'].style.left = '0px';
//     this.maxMinContainer['domMin'].style.top = '0px';
//     this.maxMinContainer['domMin'].style.color = '#ffffff';

//     this.maxMinContainer['data'] = {
//         max: 0,
//         min: 0
//     };

//     this.maxMinContainer['update'] = function(chart) {
//         chart.maxMinContainer['domMax'].innerText = chart.maxMinContainer['data']['max'] + '';
//         chart.maxMinContainer['domMin'].innerText = chart.maxMinContainer['data']['min'] + '';

//     }

//     this.container.appendChild(this.maxMinContainer['domMax']);
//     this.container.appendChild(this.maxMinContainer['domMin']);
// }

// CHART.prototype.paint = function(left, right) {
//     switch (this.type) {
//         case 0:
//             this.paintKline(left, right);
//             this.paintYAxis(); // 画 Y 轴
//             this.paintXAxis();
//             this.paintMaxMin();
//             break;
//         case 1:
//             this.paintBar(left, right);
//             this.paintYAxis(); // 画 Y 轴
//             this.paintXAxis();
//             break;
//         case 2:
//             this.paintLine(left, right);
//             this.paintYAxis(); // 画 Y 轴
//             this.paintXAxis();
//             break;
//         default:
//             break;
//     }
// }

// /* content = [
//  *     {
//  *         id: 'positions',
//  *         backgroundColor: "#f00",
//  *         color: "#fff",
//  *         datas: {
//  *             1234: ['3@1234','3@1234']
//  *         }
//  *     },{
//  *         id: 'orders',
//  *         backgroundColor: "#ff0",
//  *         color: "#000",
//  *         datas: {}
//  *     },
//  * ]
//  * */

// CHART.prototype.paintPanel = function(content) {
//     if (this.type != 0) {
//         return;
//     }
//     for (var panel in this.panel['childPanels']) {
//         this.panel['dom'].removeChild(this.panel['childPanels'][panel]);
//     }
//     for (var i = 0; i < content.length; i++) {
//         var id = content[i].id;
//         var div = document.createElement('div');
//         div.style.position = 'absolute';
//         div.style.left = '0px';
//         div.style.top = '0px'; // 
//         div.style.width = this.width + 'px';
//         div.style.height = this.height + 'px';
//         div.style.marginLeft = "10px";
//         div.style.backgroundColor = 'transparent';
//         for (var price in content[i].datas) {
//             var panel = document.createElement('div');
//             panel.style.position = 'absolute';
//             panel.style.left = '0px';
//             var top = price > this.dataFeature.max ? 0 : price < this.dataFeature.min ? this.height :
//                 this.height * (this.dataFeature.max - price) / (this.dataFeature.max - this.dataFeature.min);
//             panel.style.width = this.width + 'px';
//             panel.style.height = '20px';

//             if (top > 150) {
//                 panel.style.top = top - 20 + 'px';
//                 panel.style.borderBottom = '1px solid ' + content[i].backgroundColor;
//             } else {
//                 panel.style.top = top + 'px';
//                 panel.style.borderTop = '1px solid ' + content[i].backgroundColor;
//             }


//             for (var j = 0; j < content[i].datas[price].length; j++) {
//                 var text = document.createElement('div');
//                 text.style.position = 'relative';
//                 text.style.display = 'inline-block';
//                 text.style.backgroundColor = content[i].backgroundColor;
//                 if (j > 0) {
//                     text.style.marginLeft = "10px";
//                 }
//                 text.style.color = content[i].color;
//                 text.innerText = content[i].datas[price][j];
//                 panel.appendChild(text);

//             }

//             div.appendChild(panel);
//         }
//         this.panel['childPanels'][id] = div;
//         this.panel['dom'].appendChild(this.panel['childPanels'][id]);
//     }
// }

// CHART.prototype.showPanel = function(id) {
//     switch (this.type) {
//         case 0:
//             this.panel['childPanels'][id].style.visibility = "visible";
//             break;
//         default:
//             break;
//     }
// }

// CHART.prototype.hidePanel = function(id) {
//     switch (this.type) {
//         case 0:
//             this.panel['childPanels'][id].style.visibility = "hidden";
//             break;
//         default:
//             break;
//     }
// }


// CHART.prototype.paintBar = function(left, right) {
//     var index = 0;
//     for (var i = left; i < right; i++, index++) {
//         var barRect = this.group.children[index];
//         if (i < 0) {
//             barRect.scale.setY(0);
//         } else {
//             var d = this.datas[i][this.dataFeature.field];
//             var color = (this.datas[i].color == 'WHITE') ? 'RED' : this.datas[i].color;
//             barRect.material.color.set(CHART_CONFIG.CHART_COLOR[color]);

//             var scaley = this.config['chartHeight'] / this.dataFeature.max * d;
//             barRect.scale.setY(scaley / this.config['rectYLen']);
//         }
//     }
// }

// CHART.prototype.paintLine = function(left, right) {
//     var index = 0;
//     var line = this.group.children[0];
//     // line.material.color.set(CHART_CONFIG.CHART_COLOR['GREEN']);
//     line.geometry.verticesNeedUpdate = true;
//     for (var i = left; i < right; i++, index++) {
//         var d = this.datas[i][this.dataFeature.field[0]];
//         var y = this.config['chartHeight'] / (this.dataFeature.max - this.dataFeature.min) * (d - this.dataFeature.min) + this.config['chartMarginBottom'];
//         line.geometry.vertices[index].setY(y);
//     }
// }

// CHART.getGridValue = function(grid_value_min, grid_value_max) {
//     // 每格对应 价格
//     var grid_value = grid_value_max;

//     for (var i = 0, j = 1; i < 9; i++, j *= 10) {
//         var n = Math.round(grid_value / (j * 10)) * (j * 10);
//         if (n >= grid_value_min) {
//             grid_value_min = n;
//             continue;
//         }
//         n = Math.round(grid_value / (j * 5)) * (j * 5);
//         if (n >= grid_value_min) {
//             grid_value_min = n;
//             break;
//         }
//         n = Math.round(grid_value / (j * 2)) * (j * 2);
//         if (n >= grid_value_min) {
//             grid_height = n;
//             break;
//         }
//     }
//     if (grid_value < 1) {
//         grid_value = 1;
//     }
//     return grid_value;
// }

// CHART.prototype.paintYAxis = function() {
//     if (this.coordinatesY['YAxisGroup'].children) {
//         for (var i = 0; i < this.coordinatesY['YAxisGroup'].children.length; i++) {
//             if (this.coordinatesY['YAxisGroup'].children[i].position.z > CHART_CONFIG.CHART_CAMERA['far']) {
//                 break;
//             }
//             this.coordinatesY['YAxisGroup'].children[i].position.setZ(CHART_CONFIG.CHART_CAMERA['far'] + 1);
//         }
//         for (var i = 0; i < this.coordinatesY['domChildren'].length; i++) {
//             this.coordinatesY['dom'].removeChild(this.coordinatesY['domChildren'][i]);
//         }
//     }
//     delete this.coordinatesY['datas'];
//     delete this.coordinatesY['domChildren'];
//     this.coordinatesY['datas'] = [];
//     this.coordinatesY['domChildren'] = [];


//     // 每格对应 价格
//     var grid_value_min = Math.round(this.config['gridY_MAX'] / this.config['price3DRatioPriceTick']);
//     var grid_value_max = Math.round(this.config['gridY_MIN'] / this.config['price3DRatioPriceTick']);
//     var grid_value = CHART.getGridValue(grid_value_min, grid_value_max);
//     // 每格对应 3D 距离
//     var grid_height = grid_value * this.config['price3DRatioPriceTick'];
//     var grid_number = Math.floor(this.config['chartHeight'] / grid_height);


//     var baseX = this.config['chartMarginLeft'];

//     var valueBaseY = Math.round((this.dataFeature.min + (this.dataFeature.range - grid_value * grid_number) * this.dataFeature.priceTick / 2) / this.dataFeature.priceTick) * this.dataFeature.priceTick;

//     var baseY = this.config['chartMarginBottom'] + (valueBaseY - this.dataFeature.min) * this.config['price3DRatio'];

//     var scaleX = this.config['chartWidth'] / this.config['rectYLen'];

//     for (var i = 0; i <= grid_number; i++) {
//         var y = baseY + i * grid_height;
//         this.coordinatesY['YAxisGroup'].children[i].position.set(baseX, y, 0);
//         this.coordinatesY['YAxisGroup'].children[i].scale.setX(scaleX);

//         this.coordinatesY['domChildren'].push(document.createElement('div'));
//         this.coordinatesY['domChildren'][i].style.position = 'absolute';
//         this.coordinatesY['domChildren'][i].style.right = '0px';
//         this.coordinatesY['domChildren'][i].style.top = (this.config['rightTopY'] - y) / this.config['device3DRatio'] - 8 + 'px';
//         this.coordinatesY['dom'].appendChild(this.coordinatesY['domChildren'][i]);
//         this.coordinatesY['datas'].push((valueBaseY + i * grid_value * this.dataFeature.priceTick).toFixed(this.dataFeature.fixed));
//     }
//     this.coordinatesY['update'](this);
// }

// CHART.prototype.paintXAxis = function() {
//     if (this.coordinatesX['XAxisGroup'].children) {
//         for (var i = 0; i < this.coordinatesX['XAxisGroup'].children.length; i++) {
//             if (this.coordinatesX['XAxisGroup'].children[i].position.z > CHART_CONFIG.CHART_CAMERA['far']) {
//                 break;
//             }
//             this.coordinatesX['XAxisGroup'].children[i].position.setZ(CHART_CONFIG.CHART_CAMERA['far'] + 1);
//         }
//     }
//     // 每格对应 3D 距离
//     var grid_width = this.config['Xinterval'] * CHART_CONFIG.COMMON_CONF['spacePx'] * this.config['device3DRatio'];

//     var baseX = this.config['chartMarginLeft'];

//     var scaleY = this.config['rightTopY'] / this.config['rectYLen'];
//     var index = 0;
//     for (var i = 0; i < this.config['numberOfSpace']; i += this.config['Xinterval'], index++) {
//         this.coordinatesX['XAxisGroup'].children[index].position.set(baseX + index * grid_width, 0, 0);
//         this.coordinatesX['XAxisGroup'].children[index].scale.setY(scaleY);
//     }
// }

// CHART.prototype.paintMaxMin = function() {
//     this.maxMinContainer['data'].max = this.dataFeature.max.toFixed(this.dataFeature.fixed) + '';
//     this.maxMinContainer['data'].min = this.dataFeature.min.toFixed(this.dataFeature.fixed) + '';

//     this.maxMinContainer['domMin'].style.left = ((this.dataFeature.minIndex * this.config['lengthOfSpace'] + this.config['chartMarginLeft']) / this.config['device3DRatio'] - 15) + 'px';
//     this.maxMinContainer['domMin'].style.top = ((this.config['rightTopY'] - this.config['chartMarginBottom']) / this.config['device3DRatio']) + 'px';

//     this.maxMinContainer['domMax'].style.left = ((this.dataFeature.maxIndex * this.config['lengthOfSpace'] + this.config['chartMarginLeft']) / this.config['device3DRatio'] - 15) + 'px';
//     this.maxMinContainer['domMax'].style.top = ((this.config['chartMarginTop']) / this.config['device3DRatio'] - 16) + 'px';
//     this.maxMinContainer['update'](this);
// }

// CHART.prototype.resize = function(width, height, numberOfSpace, Xinterval) {
//     this.width = width;
//     this.height = height;

//     this.config.reset(width, height, numberOfSpace, Xinterval);
//     this.reinitCamera(width, height);

//     this.renderer.setSize(width, height);
//     this.scene.remove(this.group);
//     if (this.type == 0) {
//         this.initKlineGroup();
//     } else if (this.type == 1) {
//         this.initBarGroup();
//     } else if (this.type == 2) {
//         this.initLineGroup();
//     }
// }

// CHART.prototype.reinitCamera = function() {
//     this.camera.aspect = this.width / this.height;
//     this.camera.position.set(this.config['rightTopX'] / 2, this.config['rightTopY'] / 2, CHART_CONFIG.CHART_CAMERA['z']);
//     this.camera.updateProjectionMatrix();
// }

// CHART.prototype.scaleX = function(x, numberOfSpace, Xinterval) {
//     this.config.scaleX(x, numberOfSpace, Xinterval);
//     this.scene.remove(this.group);
//     if (this.type == 0) {
//         // 画好初始状态柱子
//         this.initKlineGroup();
//     } else if (this.type == 1) {
//         // 画好初始状态柱子
//         this.initBarGroup();
//     } else if (this.type == 2) {
//         this.initLineGroup();
//     }
// }


/**
 * 
 * @param {[type]} container [description]
 * @param {[type]} width     [description]
 * @param {[type]} height    [description]
 * @param {[type]} user_config    [description]
 */

// var user_config = {
//     numberOfSpace: 200,
//     list: [{
//         name: 'name',
//         type: 'kChart',
//         datas: [],
//         priceTick: 1,
//         color: [],
//         min: 0,
//         max: 100,
//         layer: 1,
//     }, {
//         name: 'name',
//         type: 'barChart',
//         datas: [],
//         priceTick: 1,
//         colors: [],
//         min: 0,
//         max: 100,
//         layer: 2,
//     }, {
//         name: 'name',
//         type: 'lineChart',
//         datas: [],
//         priceTick: 1,
//         colors: [],
//         min: 0,
//         max: 100,
//         layer: 3,
//     }
// };

var Chart = function(container, width, height, user_config) {
    this.container = container;
    this.width = width;
    this.height = height;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.rightTop = {
        x: 0,
        y: 0
    }; // 右上角 3d 坐标
    this.user_config = user_config;
    this.chart_config = {};
    this.group = new THREE.Group(); // add // getObjectById getObjectByName
}

CAMERA_CONF = {
    'z': 1000,
    'fov': 60,
    'near': 1,
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

Chart.prototype.init3DScene = function() {
    // init 3d component
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.camera = new THREE.PerspectiveCamera(CAMERA_CONF.fov, this.width / this.height, CAMERA_CONF.near, CAMERA_CONF.far);
    // 右上角 3d 坐标
    this.rightTop.y = CAMERA_CONF.z * Math.tan(THREE.Math.degToRad(CAMERA_CONF.fov / 2)) * 2;
    this.rightTop.x = this.rightTop.y / this.height * this.width;
    this.camera.position.set(this.rightTop.x / 2, this.rightTop.y / 2, CAMERA_CONF.z);
    this.scene.add(this.camera);
    this.scene.add(this.group);
    if (Chart.Utils.webglAvailable()) {
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

Chart.prototype.initConfig = function() {
    this.chart_config.numberOfSpace = this.user_config.numberOfSpace;
    this.chart_config.lengthOfSpace = this.rightTop.x / this.chart_config.numberOfSpace;
    this.chart_config.rectXLen = this.chart_config.lengthOfSpace * 0.7;
    this.chart_config.rectYLen = 100;
    this.chart_config.lineWidth = this.rightTop.y / this.height * 0.2; // .5px
    this.chart_config.lineLength = 100;
    this.chart_config.chartZ = 1;
}

Chart.Utils = {
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

Chart.prototype.initObject = function() {
    for (var i = 0; i < this.user_config.list.length; i++) {
        var conf = this.user_config.list[i];
        if (conf.type == CHART_TYPE.kChart) {
            this.initKlineGroup(conf.name);
        } else if (conf.type == CHART_TYPE.barChart) {
            this.initBarGroup(conf.name);
        } else if (conf.type == CHART_TYPE.lineChart) {
            this.initLineGroup(conf.name);
        }
    }
}

Chart.prototype.initKlineGroup = function(name, layer) {
    var group = new THREE.Group();
    group.name = name;
    var rectGeometry = Chart.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    var lineGeometry = Chart.Utils.getLineGeometry({
        x: 0,
        y: 0,
        z: 0
    }, {
        x: 0,
        y: this.chart_config.lineLength,
        z: 0
    });
    for (var i = 0; i < this.chart_config.numberOfSpace; i++) {
        var object = new THREE.Object3D();
        var rectMesh = Chart.Utils.getRectMesh(rectGeometry, i * this.chart_config.lengthOfSpace, 0, layer);
        var line = Chart.Utils.getLine(lineGeometry, this.chart_config.lineWidth, this.chart_config.rectXLen / 2 + i * this.chart_config.numberOfSpace, 0, layer);
        object.add(rectMesh);
        object.add(line);
        group.add(object);
    }
    this.group.add(group);
}

Chart.prototype.initBarGroup = function(name, layer) {
    var group = new THREE.Group();
    group.name = name;
    var rectGeometry = Chart.Utils.getRectGeometry(this.chart_config.rectXLen, this.chart_config.rectYLen);
    for (var i = 0; i < this.chart_config.numberOfSpace; i++) {
        var rectMesh = Chart.Utils.getRectMesh(rectGeometry, i * this.chart_config.lengthOfSpace, 0, layer);
        group.add(rectMesh);
    }
    this.group.add(group);
}

Chart.prototype.initLineGroup = function(name, layer) {
    var group = new THREE.Group();
    group.name = name;
    var pointA = {
        x: this.chart_config.rectXLen / 2,
        y: 0,
        z: layer
    };
    var pointB = {
        x: 0,
        y: 0,
        z: layer
    };
    for (var i = 1; i < this.chart_config.numberOfSpace; i++) {
        pointB.x = this.chart_config.rectXLen / 2 + i * this.chart_config.numberOfSpace;
        var lineGeometry = Chart.Utils.getLineGeometry(pointA, pointB);
        var line = Chart.Utils.getLine(lineGeometry, this.chart_config.lineWidth, pointA.x, 0, layer);
        pointA.x = pointB.x;
        group.add(line);
    }
    this.group.add(group);
}

Chart.prototype.initYAxis = function() {
    var group = new THREE.Group();
    group.name = 'axisY';
    var geometry = Chart.Utils.getLineGeometry({
        x: 0,
        y: 0,
        z: 0
    }, {
        x: this.rightTop.x,
        y: 0,
        z: 0
    });
    for (var i = 0; i < 50; i++) {
        var line = Chart.Utils.getLine(geometry, this.chart_config.lineWidth, 0, 0, -CAMERA_CONF.far);
        line.material.color.set('#DCDCDC')
        group.add(line);
    }
    this.group.add(group);
}

Chart.prototype.initXAxis = function() {
    var group = new THREE.Group();
    group.name = 'axisX';
    var geometry = Chart.Utils.getLineGeometry({
        x: 0,
        y: 0,
        z: 0
    }, {
        x: 0,
        y: this.rightTop.y,
        z: 0
    });
    for (var i = 0; i < 50; i++) {
        var line = Chart.Utils.getLine(geometry, this.chart_config.lineWidth, 0, 0, -CAMERA_CONF.far);
        line.material.color.set('#DCDCDC')
        group.add(line);
    }
    this.group.add(group);
}

Chart.prototype.init = function() {
    this.init3DScene();
    this.initConfig();
    this.initObject();
    // 初始化 X / Y 轴
    this.initYAxis();
    this.initXAxis();
    this.render();
}

// var user_config = {
//     numberOfSpace: 200,
//     list: [{
//         name: 'name',
//         type: 'kChart',
//         datas: [],
//         priceTick: 1,
//         color: [],
//         min: 0,
//         max: 100,
//         layer: 1,
//     }, {
//         name: 'name',
//         type: 'barChart',
//         datas: [],
//         priceTick: 1,
//         colors: [],
//         min: 0,
//         max: 100,
//         layer: 2,
//     }, {
//         name: 'name',
//         type: 'lineChart',
//         datas: [],
//         priceTick: 1,
//         colors: [],
//         min: 0,
//         max: 100,
//         layer: 3,
//     }
// };

// var args = {
//     valueRange: valueRange,
//     range: range,
//     price3DRatio: this.rightTop.y / valueRange,
//     price3DRatioPriceTick: this.rightTop.y / range,
//     min: conf.min,
//     max: conf.max,
//     left_id: this.user_config.left_id,
//     right_id: this.user_config.right_id,
//     fields: conf.fields
//     colors: 
// }

Chart.prototype.updateKlineGroup = function(name, args) {
    var index = 0;
    var group = this.group.getObjectByName(name);

    var left = args.right_id - this.chart_config.numberOfSpace;
    var right = args.right_id;

    for (var i = 0; i < this.chart_config.numberOfSpace; i++, left++) {
        var rect = group.children[i].children[0];
        var line = group.children[i].children[1];

        if (args.datas[i] == {} || args.datas[i] == null) {
            rect.scale.setY(0);
            line.scale.setY(0);
        } else if (left < right) {
            var open = args.datas[i].open;
            var close = args.datas[i].close;
            var high = args.datas[i].high;
            var low = args.datas[i].low;

            var dis = close - open;
            var rectY;
            if (dis >= 0) {
                rectY = args.price3DRatio * (open - args.min);
            } else {
                rectY = args.price3DRatio * (close - args.min);
            }
            rect.material.color.set(args.colors[i]);
            line.material.color.set(args.colors[i]);
            rect.position.setY(rectY);
            var lineY = args.price3DRatio * (low - args.min);
            line.position.setY(lineY);
            line.scale.setY(args.price3DRatio * (high - low) / this.chart_config['rectYLen']);
            if (dis == 0) {
                rect.scale.setY(this.rightTop.y / this.height * 1 / this.chart_config['rectYLen']);
            } else {
                rect.scale.setY(args.price3DRatio * Math.abs(dis) / this.chart_config['rectYLen']);
            }
        }
    }
}

Chart.prototype.updateBarGroup = function(name, args) {
    var group = this.group.getObjectByName(name);
    for (var i = 0; i < this.chart_config.numberOfSpace; i++) {
        var barRect = group.children[i];
        if (args.datas[i] == {} || args.datas[i] == null) {
            barRect.scale.setY(0);
        } else {
            var d = args.datas[i];
            var color = args.colors[i];
            barRect.material.color.set(color);
            var scaley = this.rightTop.y / (args.max - args.min) * (d - args.min);
            barRect.scale.setY(scaley / this.chart_config.rectYLen);
        }
    }
}

Chart.prototype.updateLineGroup = function(name, args) {
    var group = this.group.getObjectByName(name);
    var dataA = args.datas[0];
    var dataB = args.datas[1];
    var yA = this.rightTop.y / (args.max - args.min) * (dataA - args.min);
    var yB = this.rightTop.y / (args.max - args.min) * (dataB - args.min);
    for (var i = 0; i < this.chart_config.numberOfSpace - 1; i++) {
        var line = group.children[i];
        if (args.datas[i] == {} || args.datas[i] == null) {
            line.position.setZ(-1000);
        } else { // dataA dataB
            dataB = args.datas[i + 1];
            yB = this.rightTop.y / (args.max - args.min) * (dataB - args.min);
            var color = args.colors[i];
            line.material.color.set(color);
            line.geometry.vertices[0].setY(yA);
            line.geometry.vertices[1].setY(yB);
            line.position.setZ(args.layer);
        }
    }
}

Chart.prototype.updateYAxis = function() {}

Chart.prototype.updateXAxis = function() {}

Chart.prototype.update = function(datas, user_config) {
    this.user_config = user_config;

    for (var i = 0; i < this.user_config.list.length; i++) {
        var conf = this.user_config.list[i];
        // 价格范围
        var valueRange = conf.max - conf.min;
        // 价格范围 对齐到 整数 范围
        var range = Math.round(valueRange / conf.priceTick);

        var args = {
            valueRange: valueRange,
            range: range,
            price3DRatio: this.rightTop.y / valueRange,
            price3DRatioPriceTick: this.rightTop.y / range,
            min: conf.min,
            max: conf.max,
            datas: conf.datas,
            colors: colors
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

Chart.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
}
