var fs = require('fs');
var async = require('async');
var mergeGeoJSON = require('./merge-geojson');
var queryOverpass = require('./bbox-query-overpass');
// var queryOverpass = require('./read-files.js');  // for test purposes
var calcLength = require('./calc-line-length');

var overpassQL = '[out:json][timeout:25];' +
            '(' +
              'way["highway"="track"]["access"="forestry"]( {{bbox}} );' +
              'way["highway"="track"]["access"="agriculture"]( {{bbox}} );' +
              'way["abandoned:highway"="track"]["access"="forestry"]( {{bbox}} );' +
              'way["abandoned:highway"="track"]["access"="agricultural"]( {{bbox}} );' +
            ');' +
            'out body;' +
            '>;' +
            'out skel qt;';

var inFiles = {
  drc: 'data/drc_project_areas.geojson',
  car: 'data/car_project_areas.geojson',
  cog: 'data/cog_project_areas.geojson'
};

var roadLengthFile = 'data/km_roads_by_project.json';

queryOverpass(inFiles, overpassQL, function(err, geojsonObj){
  if(err) throw err;

  var roadLengths = {};

  // given an array of project logging road geojson feature collections
  // 1. calculate their length
  // 2. write each to file
  // 3. write calculated lengths to file
  // 4. merge and write that to a file
  // 5. upload the merged file to MapBox

  async.each(Object.keys(geojsonObj), function(key, callback){
    // 1. calculate length
    var geojson = geojsonObj[key];
    roadLengths[key] = calcLength(geojson);

    // 2. write to file
    writeJSON('data/' + key + '_logging_roads.geojson', geojson);

    callback();

  }, function(err){
    if(err) throw err

    // 3. write road lengths to file
    writeJSON(roadLengthFile, roadLengths);

  });

  // 4. merge geojsons and write to file
  var allRoads = mergeGeoJSON(geojsonObj);

  writeJSON('data/' + Object.keys(geojsonObj).join('_') + '_logging_roads.geojson', allRoads);

  // 5. upload to MapBox

});

function writeJSON(outFile, json, callback){
  try {
    json = JSON.stringify(json) + '\n';
  }catch(err){
    console.log(err);
  }

  fs.writeFile(outFile, json, function(err){
    if(err) console.log(err);
    console.log('successfully wrote file: ' + outFile);

    if(callback) callback();
  });
}


