var fs = require('fs');
var overpass = require('query-overpass');
var turf = require('turf');
var async = require('async');

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

// queries to overpass can't be run in parallel, so use async.eachSeries()
async.eachSeries(Object.keys(inFiles), queryOverpass, allDone);

function queryOverpass(key, callback){
  fs.readFile(inFiles[key], 'utf-8', function(err, data){
    if(err) callback(err);
    console.log('loaded project areas. querying overpass');

    var geojson = JSON.parse(data),
        bbox = getBbox(geojson),
        outFile = 'data/' + key + '_logging_roads.geojson',
        query = overpassQL.replace(/{{bbox}}/g, bbox);

    overpass(query, function(err, geojson){
      if(err) callback(err);

      try {
        geojson = JSON.stringify(geojson) + '\n';
      } catch (err) {
        callback(err);
      }

      console.log('successfully ran overpass query.  writing file ' + inFiles[key])

      fs.writeFile(outFile, geojson, function(err){
        if(err) callback(err);
        console.log('successfully wrote file ' + inFiles[key]);
        callback();
      });
    });
  });
}

function allDone(err){
  if(err) console.log(err);
  var fileNames = Object.keys(inFiles).reduce(function(fileList, key){
    return fileList += inFiles[key] + ', ';
  }, '');
  console.log('SUCCESS: queried overpass for files ' + fileNames)
}

function getBbox(geojson){
  // turf outputs bbox as: [w,s,e,n]
  // overpass requires bbox as: [s,w,n,e]
  // getBbox converts turf bbox to overpass bbox
  var turfBbox = turf.extent(geojson);
  return [turfBbox[1], turfBbox[0], turfBbox[3], turfBbox[2]];
}
