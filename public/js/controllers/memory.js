'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:MemoryCtrl
 * @description
 * # MemoryCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('MemoryCtrl', function ($scope, $rootScope) {
    $scope.memoryValue = "";
    $scope.memoryUnit = "";
    $rootScope.$on('memoryChanged',function(ev,data){
      $scope.memoryValue = data.value;
      $scope.memoryUnit = data.unit;
    });
    $rootScope.$on('disconnect',function(ev){
      $scope.memoryValue = "";
      $scope.memoryUnit = "";
    });
  });
