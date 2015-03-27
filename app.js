var fs = require('fs');
var overpass = require('query-overpass');
var upload = require('mapbox-upload');
var turf = require('turf');
var EventEmitter = require('events').EventEmitter;

var app = {
  run: function(){
    fs.readFile('drc_cog_car_tm-area.geojson', 'utf-8', function(err, data){
      if(err) throw err;
      console.log('loaded tm areas. querying overpass');

      var geojson = JSON.parse(data),
          bbox = app.getBbox(geojson),
          outFile = 'output/logging_roads.geojson';

      app.overpassBboxQuery(bbox, function(err, geojson){
        if(err){
          console.log(err);
          return;
        }

        try {
          geojson = JSON.stringify(geojson) + '\n';
        } catch (err) {
          console.log(err);
          return;
        }

        console.log('successfully ran overpass query.  writing file')

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

  overpassBboxQuery: function(bbox, callback){
    // bbox should be array: [s,w,n,e]
    var query = '[out:json][timeout:25];' +
                '(' +
                  'way["highway"="track"]["access"="forestry"](' + bbox.join() + ');' +
                  'way["highway"="track"]["access"="agriculture"](' + bbox.join() + ');' +
                ');' +
                'out body;' +
                '>;' +
                'out skel qt;';

    overpass(query, callback);
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





