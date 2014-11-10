'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:PluginListCtrl
 * @description
 * # PluginListCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('PluginListCtrl', function ($scope, $rootScope) {
    $scope.plugins = [];
    $rootScope.$on('pluginList',function(ev,data){
      $scope.plugins = data;
    });
    $rootScope.$on('disconnect',function(ev){
      $scope.plugins = [];
    });
  });
