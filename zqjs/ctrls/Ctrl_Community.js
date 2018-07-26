angular.module('starter.controllers').controller('CommunityCtrl', ['$rootScope', '$scope', '$ionicLoading',
    function ($rootScope, $scope, $ionicLoading) {

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            DM.update_data({
                'state': {
                    page: 'community'
                }
            });
        });

    }
])
