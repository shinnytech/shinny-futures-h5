angular.module('starter.controllers').controller('QuoteCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicPopover', '$ionicPopup',
    function ($rootScope, $scope, $ionicLoading, $ionicPopover, $ionicPopup) {
        $scope.changeDMState = function (t) {
            DM.update_data({
                'state': {
                    page: 'quotes',
                    custom_ins_list: localStorage.getItem('CustomList'),
                    ins_type: t
                }
            });
        };

        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function (id, name) {
            $rootScope.insList.id = id;
            $rootScope.insList.title = name;
            $scope.popover.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });

        $ionicPopover.fromTemplateUrl("ins_types.html", {
            scope: $scope
        }).then(function(popover){
            $scope.popover = popover;
        });

        $scope.$watch('insList.id', function (t) {
            if(DIVISIONS.tbody && DIVISIONS.tbody.dom) DIVISIONS.tbody.dom.scrollTo(0, 0);
            $scope.changeDMState(t);
        });

        $scope.$on("$ionicView.enter", function (event, data) {
            $scope.changeDMState($rootScope.insList.id);
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
    }
]);
