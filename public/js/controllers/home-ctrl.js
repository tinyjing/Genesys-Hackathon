'use strict';

angular.module('myApp.controllers').controller(

    'HomeCtrl',

    function($scope, $location, cookieService, gMapServices, userProfileService) {

        $scope.geocoder = new google.maps.Geocoder();

        $scope.init = function() {
            cookieService.checkUser(function(data) {
                if (data) {
                    $location.path('/menu');
                }
            });
        };

        $scope.signIn = function() {
            gMapServices.getPlace($scope, function(results, status) {

                var gps = results[0].geometry.location;
                userProfileService.userSignIn({
                    gps: gps,
                    userName: $scope.userName,
                    postalCode: $scope.postalCode
                });
                console.log(gps);

            }, $scope.postalCode);
        };

        $scope.init();

    }
);