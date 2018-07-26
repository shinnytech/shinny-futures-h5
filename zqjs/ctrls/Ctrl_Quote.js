angular.module('starter.controllers').controller('QuoteCtrl', ['$rootScope', '$scope', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopover', '$ionicPopup',
    function ($rootScope, $scope, $ionicScrollDelegate, $ionicLoading, $ionicPopover, $ionicPopup) {
        $scope.changeDMState = function (t) {
            DM.update_data({
                'state': {
                    page: 'quotes',
                    custom_ins_list: localStorage.getItem('CustomList'),
                    ins_type: t
                }
            });
        };

        $scope.insList = {
            id: 'main',
            title: '主力合约'
        };

        $scope.$watch('insList.id', function (t) {
            if (t == 'custom') {
                $scope.insList.id = 'custom';
                $scope.insList.title = '自选合约';
            } else {
                $scope.insList.id = 'main';
                $scope.insList.title = '主力合约';
            }
            $scope.changeDMState(t);
        });

        var template = '<ion-popover-view><ion-header-bar><h1 class="title">选择合约类型</h1></ion-header-bar><ion-content>';
        template += '<ion-radio ng-model="insList.id" style="color:#000" ng-value="\'main\'" ng-click=\'closePopover()\'>主力合约</ion-radio>';
        template += '<ion-radio ng-model="insList.id" style="color:#000" ng-value="\'custom\'" ng-click=\'closePopover()\'>自选合约</ion-radio>';
        template += '</ion-content></ion-popover-view>';

        $scope.popover = $ionicPopover.fromTemplate(template, {
            scope: $scope
        });

        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };

        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            $scope.changeDMState($scope.insList.id);

        });

        // 添加自选合约 参数 
        //  用户输入 inside
        //  对应的合约列表 insList
        //  用户选择添加的合约 customSelect
        //  $index 
        $scope.data = { insid: '', insList: [], customSelect: [] };

        $scope.$watch('data.insid', function (t) {
            $scope.data.insList = InstrumentManager.getInsListByInput(t);
        })

        $scope.search = function () {

            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.insid"><div>' +
                    '<div ng-repeat="item in data.insList" style="padding:2px;display:inline-block;">' +
                    '<button class="button button-small button-light" ng-class="{\'button-positive\':data.customSelect[$index]}" ng-click="data.customSelect[$index]=!data.customSelect[$index]">{{item}}</button>' +
                    '</div></div>',
                title: '添加自选合约',
                subTitle: '输入合约代码,添加自选合约！',
                scope: $scope,
                buttons: [{
                    text: '取消',
                    onTap: function (e) {
                        return null;
                    }
                }, {
                    text: '<b>添加</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        var l = [];
                        for (var i = 0; i < $scope.data.insList.length; i++) {
                            if ($scope.data.customSelect[i]) {
                                l.push($scope.data.insList[i]);
                            }
                        }
                        return l;
                    }
                }]
            });

            myPopup.then(function (res) {
                // 检查是否有这个合约
                // data.insList = InstrumentManager.getInsListByInput(res);
                if (res) {
                    InstrumentManager.addCustomInsList(res);
                }

            });
        }

        $scope.onHold = function (e) {
            if ($scope.insList.id == 'custom' && e.path[1].nodeName == 'TR') {
                var insid = e.path[1].className.split(' ')[1];
                navigator.notification.confirm(
                    '确认删除自选合约 - ' + insid + '?', // message
                    function (buttonIndex) {
                        if (buttonIndex == 1) {
                            InstrumentManager.delCustomIns(insid);
                        } else {
                            return;
                        }
                    },
                    '删除自选合约', // title
                    ['删除', '取消'] // buttonLabels
                );
            }
        }


        $scope.followScroll = function () {
            var top = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top;
            var left = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().left;
            var qt_c = document.querySelector('.qt_container table.qt_c');
            var qt_r = document.querySelector('.qt_container table.qt_r');
            qt_r.style.left = (left * -1) + 'px';
            qt_c.style.top = (top * -1) + 'px';
        }
    }
]);
