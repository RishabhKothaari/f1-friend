var express = require("express");

var app = express();

var ErgastClient = require("ergast-client");

var WikiClient = require("wikipedia-js");

// makes use of ergast node js client wrapper for fetching data from Ergast developer Api's
var ergast = new ErgastClient();

var bodyParser = require("body-parser");

var async = require("async");

var fs = require("fs");

bodyParser.urlencoded({
  extended: "true"
});

app.use(bodyParser.json());

var port = 8081 || process.env.PORT;

var hostname = "127.0.0.1";

/* set this to true if there is a problem in fetching data from Ergast.
 * if true the data for lap charts is fetched from static prefetched json files
 * This data is only available for 2017 season.
 */
const fetchStatic = true;

//use static middleware to serve static content.

app.use(express.static(__dirname + "/bower_components"));
app.use(express.static(__dirname + "/public"));

app.listen(port, hostname, function() {
  console.log("Up an running... at", hostname + ":" + port);
});
/**
 * Get Schedule for a season.
 */
app.get("/season/:seasonid", function(request, response) {
  var year = request.params.seasonid;
  var data = {};
  var latitudes = [];
  var longitudes = [];
  var images = [];
  var races = [];
  var wikiUrl = "";
  /**
   * SVG path for target icon
   */
  var targetSVG =
    "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
  ergast.getSeason(year, function(err, season) {
    races = season.races;
    races.map(function(race) {
      var imageDetails = {};
      imageDetails.info = {};
      var location = race.circuit.location;
      imageDetails.type = "circle";
      imageDetails.color = "#000000";
      imageDetails.title = race.raceName + "," + race.circuit.circuitName;
      imageDetails.grandPrixUrl = race.url;
      imageDetails.circuitUrl = race.circuit.url;
      imageDetails.latitude = location.lat;
      imageDetails.longitude = location.long;
      imageDetails.selectable = true;
      imageDetails.info.id = race.raceName + "," + race.circuit.circuitName;
      imageDetails.info.raceUrl = race.url;
      imageDetails.info.circuitUrl = race.circuit.url;
      wikiUrl = race.url;
      imageDetails.info.round = race.round;
      imageDetails.info.date = race.date;
      imageDetails.info.time = race.time;
      latitudes.push(location.lat);
      longitudes.push(location.long);
      images.push(imageDetails);
    });
    data.latitudes = latitudes;
    data.longitudes = longitudes;
    data.images = images;
    response.send(data);
  });
});
/**
 * Get Drivers Data for a Season,right now hard coded to 2018
 */
app.get("/drivers", function(request, response) {
  ergast.getDrivers("2018", function(request, driverList) {
    response.send(driverList);
  });
});
/**
 * Get lap chart data for a round in a season.
 */
app.get("/getLapChartData/:seasonid/:round", function(request, response) {
  var MECHANICAL_PROBLEMS_STATUSES = [
    "Clutch",
    "Electrical",
    "Engine",
    "Gearbox",
    "Hydraulics",
    "Transmission",
    "Suspension",
    "Brakes",
    "Mechanical",
    "Tyre",
    "Puncture",
    "Wheel",
    "Heat shield fire",
    "Oil leak",
    "Water leak",
    "Wheel nut",
    "Rear wing",
    "Engine misfire",
    "Vibrations",
    "Alternator",
    "Collision damage",
    "Pneumatics",
    "Fuel system",
    "Technical",
    "Oil pressure",
    "Drivetrain",
    "Turbo",
    "ERS",
    "Power Unit",
    "Water pressure",
    "Fuel pressure",
    "Throttle",
    "Steering",
    "Electronics",
    "Exhaust",
    "Retired",
    "Withdrew",
    "Power loss"
  ];

  var ACCIDENT_STATUSES = ["Accident", "Collision", "Spun off"];

  var season = request.params.seasonid;
  var round = request.params.round;
  /**
   *
   * 1.Get ergastRaceResults, ergastDrivers, ergastLaps, ergastPitStops
   * 2.Send the data to chartConverter.
   */
  var data = {};
  var tasks = {
    raceResults: function(callback) {
      setTimeout(function() {
        ergast.getRaceResults(season, round, function(error, raceData) {
          if (!error) {
            callback(null, raceData);
          } else {
            callback(error);
          }
        });
      }, 100);
    },
    raceDrivers: function(callback) {
      setTimeout(function() {
        ergast.getDrivers(season, function(error, driverData) {
          if (!error) {
            callback(null, driverData);
          } else {
            callback(error);
          }
        });
      }, 200);
    },
    raceLaps: function(callback) {
      setTimeout(function() {
        ergast.getLaps(season, round, function(error, lapData) {
          if (!error) {
            callback(null, lapData);
          } else {
            callback(error);
          }
        });
      }, 300);
    },
    racePitStops: function(callback) {
      setTimeout(function() {
        ergast.getPitStops(season, round, function(error, pitStopData) {
          if (!error) {
            callback(null, pitStopData);
          } else {
            callback(error);
          }
        });
      }, 400);
    }
  };

  if (fetchStatic) {
    var responseData;
    setTimeout(function() {
      fs.readFile(
        __dirname + "/data/" + season + "/" + round + ".json",
        function(err, data) {
          if (err) {
            throw err;
          }
          response.send(JSON.parse(data));
        }
      );
    }, 2000);
  } else {
    async.parallel(async.reflectAll(tasks), function(error, results) {
      data = results;
      convertToChartData(data);
    });
  }
  /**
   * Parse Lap Chart Data from Ergast
   * @param {lap chart data for a round in a season} data
   */
  function convertToChartData(data) {
    /**
     *
     * Create lapCount field.
     * Create laps field - [{"name":Driver Name,
     * "placing":[//plcaing array],
     * "pitstops":[//pitstops array],
     * "mechanical":[//mech failure],
     * "accident":[//accident array],
     * "lapped":[//lapped array],
     * "safety":[//saftey car array]}]
     *
     */
    var result = [];
    var lapsData = [];
    var pitStopData = [];
    var resultObj = {};
    resultObj.lapCount = data.raceLaps.value.length;
    resultObj.laps = [];
    resultObj.safety = [];
    resultObj.lapped = [];
    driversData = getLapsData(data.raceResults.value.driverResults, resultObj);
    lapsData = getRacePositions(data.raceLaps.value, driversData);
    pitStopsData = getPitStopsInfo(
      data.racePitStops.value,
      data.raceDrivers.value.drivers,
      lapsData
    );
    finalData = setRaceStatus(
      data.raceResults.value.driverResults,
      pitStopsData
    );
    response.send(finalData);
  }
  /**
   * Populate Laps Data to result
   * @param {Race results JSON from Ergast} raceResults
   * @param {Populate result} result
   */
  function getLapsData(raceResults, result) {
    var gridPosZero = 0;
    raceResults.forEach(function(driverResult, i) {
      var driverObj = {};
      driverObj.driverId = driverResult.driver.driverId;
      driverObj.name =
        driverResult.driver.givenName + " " + driverResult.driver.familyName;
      driverObj.placing = [];
      if (driverResult.grid === 0) {
        driverResult.grid = raceResults.length - gridPosZero;
        gridPosZero++;
      }
      driverObj.placing.push(driverResult.grid);
      driverObj.pitstops = [];
      driverObj.mechanical = [];
      driverObj.accident = [];
      driverObj.disqualified = [];
      result.laps.push(driverObj);
    });
    return result;
  }
  /**
   * Populate Race Positions to result
   * @param {Laps Infor from Ergast} raceLaps
   * @param {Result to be populated} result
   */
  function getRacePositions(raceLaps, result) {
    raceLaps.forEach(function(raceLap) {
      raceLap.laps.forEach(function(lapData) {
        result.laps.find(function(lap, i) {
          if (lap.driverId === lapData.driverId) {
            result.laps[i].placing.push(lapData.position);
          }
        });
      });
    });
    return result;
  }
  /**
   * Populate Pit Stop Information to result
   * @param {Pit Stops Information from Ergast} racePitStops
   * @param {Drivers Infromation from Ergast} raceDrivers
   * @param {Result to be Populated} result
   */
  function getPitStopsInfo(racePitStops, raceDrivers, result) {
    racePitStops.pitStops.forEach(function(pitData) {
      result.laps.find(function(driverData, i) {
        if (pitData.driverId === driverData.driverId) {
          result.laps[i].pitstops.push(pitData.lap);
        }
      });
    });
    return result;
  }
  /**
   * Set Race Status for each Driver
   * @param {results JSON from Ergast} raceResults
   * @param {populate result to send to client} result
   */
  function setRaceStatus(raceResults, result) {
    raceResults.forEach(function(raceResult) {
      result.laps.find(function(driverData, i) {
        if (
          driverData.driverId === raceResult.driver.driverId &&
          MECHANICAL_PROBLEMS_STATUSES.indexOf(raceResult.status) !== -1
        ) {
          result.laps[i].mechanical.push(raceResult.laps);
        }
        if (
          driverData.driverId === raceResult.driver.driverId &&
          ACCIDENT_STATUSES.indexOf(raceResult.status) !== -1
        ) {
          result.laps[i].accident.push(raceResult.laps);
        }
        if (
          driverData.driverId === raceResult.driver.driverId &&
          raceResult.status === "Disqualified"
        ) {
          result.laps[i].disqualified.push(raceResult.laps);
        }
      });
    });
    return result;
  }
});

app.get("*", function(req, res) {
  // body...
  res.sendFile("/public/index.html");
});
