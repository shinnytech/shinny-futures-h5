angular.module('starter.controllers').controller('HomeCtrl', ['$rootScope', '$scope', '$ionicHistory', '$timeout', 'LoginService',
    function ($rootScope, $scope, $ionicHistory, $timeout, LoginService) {
        $scope.options = {
            loop: true,
            effect: 'slide',
            speed: 500,
            autoplay: 2000
        }

        $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
            // data.slider is the instance of Swiper
            $scope.slider = data.slider;
        });

        $scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
            // console.log('Slide change is beginning');
        });

        $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
            // note: the indexes are 0-based
            $scope.activeIndex = data.slider.activeIndex;
            $scope.previousIndex = data.slider.previousIndex;
        });

        $scope.$on("$ionicView.afterEnter", function (event, data) {
            DM.update_data({
                'state': {
                    page: 'home'
                }
            });
        });
    }
])
