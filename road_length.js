var fs = require('fs');
var turf = require('turf');
var async = require('async');
var inFiles = {
  all: 'data/drc_car_cog_logging_roads.geojson',
  drc: 'data/drc_logging_roads.geojson',
  car: 'data/car_logging_roads.geojson',
  cog: 'data/cog_logging_roads.geojson'
};

var outFile = 'output/roads_distance.json';

var results = {};

async.each(Object.keys(inFiles), calcRoadDistance, function(err){
  if (err) throw err;

  try {
    results = JSON.stringify(results) + '\n';
  } catch (err) {
    throw err;
  }

  fs.writeFile(outFile, results);
  console.log('SUCCESS: wrote file to ' + outFile);
});

function calcRoadDistance(key, errCallback){
  var fName = inFiles[key];

  fs.readFile(fName, 'utf-8', function(err, data){
    if(err) errCallback(err);

    data = JSON.parse(data);

    var totalDistance = data['features'].reduce(function(distance, feature){
      return distance += turf.lineDistance(feature, 'kilometers');
    }, 0);

    results[key] = Math.round(totalDistance * 10) / 10;

    errCallback(null);
  });
}

