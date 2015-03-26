var fs = require('fs');
var overpass = require('query-overpass');
var upload = require('mapbox-upload');
var EventEmitter = require('events').EventEmitter;

var bbox = [2,22,2.8,23.1],
    overpass_output_file = 'overpass_result.geojson',
    geojson = {};


var overpassBboxQuery = function(bbox, outfile, callback){
  var query = '[out:json][timeout:25];' +
              '(' +
                'way["highway"="track"]["access"="forestry"](' + bbox.join() + ');' +
                'way["highway"="track"]["access"="agriculture"](' + bbox.join() + ');' +
              ');' +
              'out body;' +
              '>;' +
              'out skel qt;',

  overpass(query, function(err, data){
    if(err) throw err;

    console.log('successful query');
    var geojson = '';

    try {
      geojson = JSON.stringify(data) + '\n';
    } catch (err) {
      throw err;
    }

    fs.writeFile(outfile, geojson, function(err){
      if(err) throw err;

      callback(geojson);
    });
  })

  return outfile;
};

var file2MapBox = function(file){
  return progress = upload({
      file:  __dirname + '/' + file,
      account: 'crowdcover', // Mapbox user account.
      accesstoken: 'sk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiJsemhCUzljIn0.uIgOj_SkXD99320QU5ejuQ', // A valid Mapbox API secret token with the uploads:write scope enabled.
      mapid: 'crowdcover.logging_roads' // The identifier of the map to create or update.
  });
};



////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
fs.readFile('drc_tm_area.geojson', 'utf-8', function(err, data){
  if(err) throw err;

  console.log('successfully read tm area geojson');
  var geojson = JSON.parse(data),
      features = geojson['features'];

  for(var i = 0; i < features.length; i++){
    // app.getBbox(features[i])
    // file = app.overpassBboxQuery
    // app.file2MapBox(file)
  }
});





