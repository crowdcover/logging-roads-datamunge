var fs = require('fs');
var upload = require('mapbox-upload');

var inFile = '/data/drc_car_cog_logging_roads.geojson';


// creates a progress-stream object to track status of
// upload while upload continues in background
var progress = upload({
  file:  __dirname + '/' + inFile,
  account: 'crowdcover', // Mapbox user account.
  accesstoken: 'sk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiJsemhCUzljIn0.uIgOj_SkXD99320QU5ejuQ', // A valid Mapbox API secret token with the uploads:write scope enabled.
  mapid: 'crowdcover.logging_roads' // The identifier of the map to create or update.
});

progress.on('error', function(err){
    if (err) throw err;
});

progress.on('progress', function(p){
    // Do something with progress-stream object, like display upload status
    console.log(p);
    console.log(p.percentage);
    console.log('---');
});

progress.once('finished', function(){
  console.log('uploaded file to mapbox');
});
