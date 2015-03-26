var upload = require('mapbox-upload');

// creates a progress-stream object to track status of
// upload while upload continues in background
var progress = upload({
    file:  __dirname + '/overpass_result.geojson',
    account: 'crowdcover', // Mapbox user account.
    accesstoken: 'sk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiJsemhCUzljIn0.uIgOj_SkXD99320QU5ejuQ', // A valid Mapbox API secret token with the uploads:write scope enabled.
    mapid: 'crowdcover.logging_roads' // The identifier of the map to create or update.
});

progress.on('error', function(err){
    // if (err) { throw err; }
    if (err) { console.log(err); }
});

progress.on('progress', function(p){
    // Do something with progress-stream object, like display upload status
    console.log('progress', p);
});

progress.once('finished', function(){
    // Upload has completed but is likely queued for processing and not yet available on Mapbox.
    console.log('finished');
});
