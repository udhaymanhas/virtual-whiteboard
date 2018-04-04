app.controller('settingsController', ['$scope', function($scope){
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
}])
