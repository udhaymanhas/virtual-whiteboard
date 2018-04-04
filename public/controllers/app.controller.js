app.controller('settingsController', ['$scope','$mdDialog', function($scope, $mdDialog){
  $scope.showProgress = false;

  $scope.setName = function(){
    $scope.showProgress = true;
    window.name = $scope.name;
    $scope.showProgress = false;
    $scope.enableSet = false;
  }

  $scope.setColor = function(){
    window.color = $scope.color;
  }

  $scope.showSmDialog = function(ev) {
   $mdDialog.show({
     controller: DialogController,
     templateUrl: './views/smDialog.html',
     parent: angular.element(document.body),
     targetEvent: ev,
     clickOutsideToClose:true
   })
   .then(function(answer) {}, function() {});
 };

 function DialogController($scope, $mdDialog) {
    $scope.name = '';
    $scope.setName = function(){
      window.name = $scope.name;
      $mdDialog.hide();
    }
  }

}])
