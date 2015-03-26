var fs = require('fs');
var overpass = require('query-overpass');
var upload = require('mapbox-upload');
var turf = require('turf');
var EventEmitter = require('events').EventEmitter;

var app = {
  run: function(){
    fs.readFile('drc_tm_area_small.geojson', 'utf-8', function(err, data){
      if(err) throw err;

      console.log('successfully read tm area geojson');
      var geojson = JSON.parse(data),
          areas = geojson['features'],
          areasCount = areas.length;


      for(var i = 0; i < areas.length; i++){
        var bbox = app.getBbox(areas[i]),
            allRoads = null;

        app.overpassBboxQuery(bbox, function(err, geojson){
          areasCount--;
          if(err){
            console.log(err);
            return false;
          }
          console.log('queried overpass, queries left: ' +  areasCount);

          if(allRoads ===  null){
            allRoads = geojson;
          }else{
            allRoads['features'].concat(geojson['features']);
          }

          if(areasCount === 0){
            var outFile = 'output/logging_roads.geojson';

            console.log('writing logging roads')

            try {
              allRoads = JSON.stringify(allRoads) + '\n';
            } catch (err) {
              throw err;
            }

            fs.writeFile(outFile, allRoads, function(err){
              if(err) throw err;

              console.log('saved logging roads to: ' + outFile);

              // app.file2MapBox(outFile)

            });
          }
        });

      }
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





