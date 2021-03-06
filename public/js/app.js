'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'btford.socket-io',
    'myApp.services',
    'myApp.controllers',
    'myApp.directives',
    'ui.bootstrap',
    'ui.multiselect',
    'ui.bootstrap.position',
    'ui.bootstrap.dateparser',
    'ui.bootstrap.datepicker',
    'ui.bootstrap.timepicker'
]).
config(function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'partials/home',
        controller: 'HomeCtrl'
    }).
    when('/menu', {
        templateUrl: 'partials/menu',
        controller: 'MenuCtrl'
    }).
    when('/chat', {
        templateUrl: 'partials/chat',
        controller: 'ChatCtrl'
    }).
    otherwise({
        redirectTo: '/home'
    });

    $locationProvider.html5Mode(true);
});