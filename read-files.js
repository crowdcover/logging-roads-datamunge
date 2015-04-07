var fs = require('fs');
var async = require('async');

/////////////////////////////
// test module to mimic the bbox-query-overpass.js, w/o actually needing to query overpass
/////////////////////////////
module.exports = function(inFiles, overpassQL, callback){
  var output = [];

  // overwrite infiles with the file names of geojsons that mimic overpass results
  var inFiles = [
    'data/drc_logging_roads.geojson',
    'data/car_logging_roads.geojson',
    'data/cog_logging_roads.geojson'
  ];

  async.eachSeries(inFiles, queryOverpass, allDone);

  function queryOverpass(file, callback){
    fs.readFile(file, 'utf-8', function(err, data){
      if(err) callback(err);
      console.log('loading file: ' + file);

      output.push(JSON.parse(data));
      callback();

    });
  }

  function allDone(err){
    if(err) callback(err, null);
    return callback(null, output);
  }
}
