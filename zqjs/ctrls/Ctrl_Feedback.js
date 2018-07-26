angular.module('starter.controllers').controller('FeedbackCtrl', ['$rootScope', '$scope',
    function ($rootScope, $scope) {

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            DM.update_data({
                'state': {
                    page: 'feedback'
                }
            });

        });
    }
])
