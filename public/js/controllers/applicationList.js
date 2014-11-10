'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:ApplicationListCtrl
 * @description
 * # ApplicationListCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('ApplicationListCtrl', function ($scope, $rootScope) {
    $scope.applications = [];
    $rootScope.$on('applicationList',function(ev,data){
      $scope.applications = data;
    });
    $rootScope.$on('disconnect',function(ev){
      $scope.applications = [];
    });
  });
