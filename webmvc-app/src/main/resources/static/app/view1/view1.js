'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {

    var eventSource = null;
    var socket = null;
    var client = null;

    // Create a 'controllerSettins' object so we do not bind primitive directly to scope.
    //TODO would not be an issue if we use Controller-as syntax.
    $scope.controllerSettings = {
      transport: 'auto'
    };


    /**
     * Port of jQuery sseStart to function on Angular Controller Scope.
     */
    $scope.sseStart = function() {
      eventSource = new EventSource("/sse-interval");
      eventSource.onmessage = function(e) {
        console.log('Got: ' + e.data);
      }
    };

    /**
     * Port of jQuery sseStop to function on Angular Controller Scope.  Need to do null checking since we do not
     * know if eventSource has been created or not.
     */
    $scope.sseStop = function() {
      if (eventSource !== null) {
        eventSource.close();
      }
    };

    //$scope.webSocketStart = function() {
    //  //$.post( "/interval");
    //};
    //
    //$( "#webSocketStop" ).bind( "click", function() {
    //  $.ajax({ url: "/interval", method: 'DELETE' });
    //});
    //

    /**
     * Port of jQuery webSocketConsumerStart to function on Angular Controller Scope.
     */
    $scope.webSocketConsumerStart = function() {

      var options = {debug: true};
      var transport = $scope.controllerSettings.transport;
      if (transport != "auto") {
        options = {debug: true, transports: [transport]};
      }

      socket = new SockJS('/messaging', null, options);
      client = Stomp.over(socket);

      client.connect({}, function(frame) {
        console.log('Connected.');

        var subscription = client.subscribe("/topic/interval",
          function(message) {
            console.log('Got: ' + message.body);
          },
          {'selector' : 'headers.parity == \'even\''});

      });
    }

    /**
     * Port of jQuery webSocketConsumerStop.  The original jQuery method was bound to click of button
     * upon connection.  Instead, bind to scope but check to make sure client is constructed and
     * connected (and no-op otherwise).
     */
    $scope.webSocketConsumerStop = function() {
      if (client && client.connected === true) {
        client.disconnect();
      }
    }
}]);