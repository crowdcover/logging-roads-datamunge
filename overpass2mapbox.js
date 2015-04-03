var fs = require('fs');
var overpass = require('query-overpass');
var upload = require('mapbox-upload');
var turf = require('turf');

var fName = process.argv.slice(2);
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

var app = {
  run: function(){
    if(fName.length > 1) throw 'please only specify one file';
    fName = fName[0];

    fs.readFile(fName, 'utf-8', function(err, data){
      if(err) throw err;
      console.log('loaded tm areas. querying overpass');

      var geojson = JSON.parse(data),
          bbox = app.getBbox(geojson),
          outFile = 'output/logging_roads.geojson',
          query = overpassQL.replace(/{{bbox}}/g, bbox);

      overpass(query, function(err, geojson){
        if(err) throw err.message;

        try {
          geojson = JSON.stringify(geojson) + '\n';
        } catch (err) {
          console.log(err);
          return;
        }

        console.log('successfully ran overpass query.  writing file')
        // throw 'BREAKING EARLY';

        fs.writeFile(outFile, geojson, function(err){
          if(err) throw err;
          console.log('saved logging roads to: ' + outFile);
          var mapbox = app.file2MapBox(outFile);

          mapbox.on('finished', function(){
            console.log('uploaded file to mapbox');
          });
        });


      });
    });
  },

  getBbox: function(geojson){
    // turf outputs bbox as: [w,s,e,n]
    // overpass requires bbox as: [s,w,n,e]
    // getBbox converts turf bbox to overpass bbox
    var turfBbox = turf.extent(geojson);
    return [turfBbox[1], turfBbox[0], turfBbox[3], turfBbox[2]];
  },

  file2MapBox: function(file){
    return progress = upload({
        file:  __dirname + '/' + file,
        account: 'crowdcover', // Mapbox user account.
        accesstoken: 'sk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiJsemhCUzljIn0.uIgOj_SkXD99320QU5ejuQ', // A valid Mapbox API secret token with the uploads:write scope enabled.
        mapid: 'crowdcover.logging_roads' // The identifier of the map to create or update.
    });
  }

};

app.run();





