var fs = require('fs');
var async = require('async');

/////////////////////////////
// test module to mimic the bbox-query-overpass.js, w/o actually needing to query overpass
/////////////////////////////
module.exports = function(inFiles, overpassQL, callback){
  var output = {};

  // overwrite infiles with the file names of geojsons that mimic overpass results
  var inFiles = {
    drc: 'data/drc_logging_roads.geojson',
    car: 'data/car_logging_roads.geojson',
    cog: 'data/cog_logging_roads.geojson',
    cmr: 'data/cmr_logging_roads.geojson'
  };

  async.eachSeries(Object.keys(inFiles), queryOverpass, allDone);

  function queryOverpass(key, callback){
    var file = inFiles[key];

    fs.readFile(file, 'utf-8', function(err, data){
      if(err) callback(err);
      if(data === '') callback( new Error('Error: ' + file + 'is empty'));

      console.log('loading file: ' + file);

      output[key] = JSON.parse(data);
      callback();

    });
  }

  function allDone(err){
    if(err) callback(err, null);
    return callback(null, output);
  }
}
