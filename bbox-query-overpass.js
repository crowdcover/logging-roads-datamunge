var fs = require('fs');
var overpass = require('query-overpass');
var turf = require('turf');
var async = require('async');

/////////////////////////////
// given an array of geojson objects, query overpass for the bbox of each
// return an array of all results
/////////////////////////////
module.exports = function(inFiles, overpassQL, callback){
  var output = [];

  async.eachSeries(inFiles, queryOverpass, allDone);

  function queryOverpass(file, callback){
    fs.readFile(file, 'utf-8', function(err, data){
      if(err) callback(err);
      console.log('querying overpass for file: ' + file);

      var geojson = JSON.parse(data),
          bbox = getBbox(geojson),
          // outFile = 'data/' + key + '_logging_roads.geojson',
          query = overpassQL.replace(/{{bbox}}/g, bbox);

      overpass(query, function(err, geojson){
        if(err) callback(err);

        output.push(geojson)
        callback();

      });
    });
  }

  function allDone(err){
    if(err) callback(err, null);
    return callback(null, output);
  }

  function getBbox(geojson){
    // turf outputs bbox as: [w,s,e,n]
    // overpass requires bbox as: [s,w,n,e]
    // getBbox converts turf bbox to overpass bbox
    var turfBbox = turf.extent(geojson);
    return [turfBbox[1], turfBbox[0], turfBbox[3], turfBbox[2]];
  }

};


