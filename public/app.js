var app = angular.module('f1-friend', ['ngMaterial']);

app.controller('appCtrl', function ($scope, $timeout, $mdSidenav, $http) {


    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.driverInfo = true;

    function buildToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        };
    }
    $scope.seasonsList = ['2017', '2016', '2015', '2014', '2013'];

    $scope.lapChartList = ['2017', '2016', '2015', '2014', '2013'];

    $scope.rounds = [1, 2, 3, 4, 5, 6, 7,8,9,10,11,12,13,14,15,16,17,18,19,20];

    $scope.selectedItem;


    $scope.displaySeason = function (season) {
        $scope.selected = season;
        $scope.lapChartSeleted = false
        $http.get('/season/' + escape(season))
            .then(function (result) {
                $scope.seasonData = result.data;
                $scope.seasonsMap = "season-" + season;
            });
        $scope.seasonSelected = true;
    }

    $scope.revealLapChart = function(year){
        $scope.seasonSelected = false;
        $scope.lapChartYear = year;
        $scope.lapChartSeleted = true;
    }

    $scope.displayLapChart = function (season,round) {
        $http.get('/getLapChartData/'+escape(season)+'/'+escape(round)).then(function(result){
            $scope.lapChartData = result.data;
        })
        $scope.lapChartSeleted = true;
    }
});

window.app = app