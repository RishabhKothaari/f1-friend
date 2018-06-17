var app = angular.module("f1-friend", ["ngMaterial"]);
/**
 * App Controller
 */
app.controller("appCtrl", function($scope, $timeout, $mdSidenav, $http) {
  $scope.toggleLeft = buildToggler("left");
  $scope.toggleRight = buildToggler("right");
  $scope.driverInfo = true;
  /**
   * Toggle sidenav
   * @param {componentId to toggle} componentId
   */
  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
  $scope.seasonsList = ["2017", "2016", "2015", "2014", "2013"];

  $scope.lapChartList = ["2017", "2016", "2015", "2014", "2013"];

  $scope.rounds = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20
  ];

  $scope.selectedItem;
  /**
   * Display season information
   * @param {season to fetch information for} season
   */
  $scope.displaySeason = function(season) {
    $scope.selected = season;
    $scope.lapChartSeleted = false;
    $http.get("/season/" + escape(season)).then(function(result) {
      $scope.seasonData = result.data;
      $scope.seasonsMap = "season-" + season;
    });
    $scope.seasonSelected = true;
  };
  /**
   * Reveals a lap chart
   * @param {seasonid/year to fetch lap information about} year
   */
  $scope.revealLapChart = function(year) {
    $scope.seasonSelected = false;
    $scope.lapChartYear = year;
    $scope.lapChartSeleted = true;
  };
  /**
   * Displays Lap Chart for a round of a season
   * @param {year} season
   * @param {roundid} round
   */
  $scope.displayLapChart = function(season, round) {
    $http
      .get("/getLapChartData/" + escape(season) + "/" + escape(round))
      .then(function(result) {
        $scope.lapChartData = result.data;
      });
    $scope.lapChartSeleted = true;
  };
});

window.app = app;
