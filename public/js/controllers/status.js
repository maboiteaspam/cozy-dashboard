'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:StatusCtrl
 * @description
 * # StatusCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('StatusCtrl', function ($scope) {
    // connecting | connected | stopped
    $scope.status = "connecting";
    $scope.error = "";

    var openSocket = function(data){
      var socket = new WebSocket( data );
      socket.onmessage = function(event) {
        event = JSON.parse(event.data);
        $scope.$apply(function(){
          $scope.$emit(event.message,event.data);
        });
      };
      socket.onclose = function(event) {
        $scope.$emit('disconnect');
        $scope.$apply(function(){
          $scope.status = "stopped";
        });
        retryConnect();
      };
      socket.onopen = function(){
        $scope.status = "connected";
        socket.send('connect');
      };
      return socket;
    };
    var interval;
    var retryConnect = function(){
      if(!interval){
        interval = setInterval(function(){
          $.get("socket-api",connectSuccess)
            .done(function(){
              clearInterval(interval);
              interval = null;
            })
            .fail(connectFailure);
        },1500);
      }
    };
    var connectSuccess = function(data,status,xhr){
      openSocket(data);
    };
    var connectFailure = function(){
      $scope.status = "stopped";
      $scope.error = "unavailable dashboard location";
    };
    $.get("socket-api",connectSuccess)
      .fail(connectFailure);
  });
