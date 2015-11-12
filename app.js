var fs = require('fs');
var async = require('async');
var upload = require('mapbox-upload');
var shpwrite = require('shp-write');
var mergeGeoJSON = require('./custom_modules/merge-geojson');
var queryOverpass = require('./custom_modules/bbox-query-overpass');
//var queryOverpass = require('./custom_modules/read-files.js');  // for test purposes
var calcLength = require('./custom_modules/calc-line-length');



//TODO: covert these to command line args
var runAsCronJob = true;
var saveStatsToDB = true;
var pushToMapBox = false;

//var cronTime = '00 * * * * *'; //once a minute - for testing only
 var cronTime = '00 00 00 * * *'; //every night at midnight


//polyfill startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

function run(dataUpdatedCallback){

if(saveStatsToDB){
  var knex = require('./connection');
}

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
  drc: __dirname + '/data/drc_project_areas.geojson',
  car: __dirname + '/data/car_project_areas.geojson',
  cog: __dirname + '/data/cog_project_areas.geojson',
  cmr: __dirname + '/data/cmr_project_areas.geojson'
};

var roadLengthFile = __dirname + '/data/km_roads_by_project.json';

queryOverpass(inFiles, overpassQL, function(err, geojsonObj){
  if(err) throw err;

  var roadLengths = {};

  var roadCount = 0;
  var roadWithTagCount = 0;

  // given an array of project logging road geojson feature collections
  // 1. calculate their length
  //1. b) convert OSM tags to geoJSON properties
  // 2. write each to file
  // 3. write calculated lengths to file
  // 4. merge and write that to a file
  // 5. upload the merged file to MapBox

  async.each(Object.keys(geojsonObj), function(key, callback){
    // 1. calculate length
    var geojson = geojsonObj[key];
    roadLengths[key] = calcLength(geojson);

    roadCount += geojson.features.length;

    //1. b) convert OSM tags to geoJSON properties
    geojson.features.forEach(function(feature){
              var tags = feature.properties.tags;
              Object.keys(tags).map(function (key) {
                   var val = tags[key];
                   if(typeof val === 'object'){
                     val = JSON.stringify(val);
                    }
                   feature.properties[key] = val;
                 });
                 if(feature.properties.start_date
                 && feature.properties.start_date != ''
                 && feature.properties.start_date != 'unknown'){
                   roadWithTagCount++;
                 }else{
                   //assign a value so it is easier to style in the map
                   feature.properties.start_date = 'unknown';
                 }
                 //remove bad tags
                 if(feature.properties.start_date
                 && feature.properties.start_date.startsWith('before')
                 && feature.properties.start_date != 'before 2000'){
                   feature.properties.start_date = 'unknown';
                 }

               //delete feature.properties.tags;
            });

    // 2. write to file
    writeJSON(__dirname + '/data/' + key + '_logging_roads.geojson', geojson);

    callback();

  }, function(err){
    if(err) throw err

    // 3. write road lengths to file
    writeJSON(roadLengthFile, roadLengths);

  });

  // 4. merge geojsons and write to file
  var allRoads = mergeGeoJSON(geojsonObj);
  // var allRoadsFileName = __dirname + '/data/' + Object.keys(geojsonObj).join('_') + '_logging_roads.geojson';
  var allRoadsFileName = __dirname + '/output/roads.geojson';

  if(saveStatsToDB){
    //save counts to database
    knex('logging.stats')
    .where({key: 'totalRoads'})
    .update({ value: roadCount})
    .catch(function (err) {
          console.log(err);
    });
  
    knex('logging.stats')
    .where({key: 'taggedRoads'})
    .update({ value: roadWithTagCount})
    .catch(function (err) {
          console.log(err);
    });
  
  }

  writeJSON(allRoadsFileName, allRoads, function(err){
    if (err) throw err;

  if(pushToMapBox) {
    // 5. upload to MapBox
    var progress = upload({
      file: allRoadsFileName,
      account: 'crowdcover', // Mapbox user account.
      accesstoken: 'sk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiJsemhCUzljIn0.uIgOj_SkXD99320QU5ejuQ', // A valid Mapbox API secret token with the uploads:write scope enabled.
      mapid: 'crowdcover.e06eb11a' // The identifier of the map to create or update.
    });

    progress.on('error', function(err){
        if (err) throw err;
    });

    progress.once('finished', function(){
      console.log('Uploaded to mapbox complete for file: ' + allRoadsFileName);
    });

  }

  //remove unknown
  var allRoadsWithTags = {
    "type":"FeatureCollection",
    "features":[]
  };

  allRoads.features.forEach(function(feature){
    if(feature.properties.start_date
       && feature.properties.start_date == 'before 2000'){
         feature.properties.start_date = '2000';
     }

     if(feature.properties.start_date
        && feature.properties.start_date == 'after 2013'){
          feature.properties.start_date = '2014';
      }

     if(feature.properties.start_date
        && feature.properties.start_date != 'unknown'){
          allRoadsWithTags.features.push(feature);
      }

   });

   var allRoadsWithTagFileName = __dirname + '/data/all_roads_withstartdate.geojson';
   writeJSON(allRoadsWithTagFileName, allRoadsWithTags, function(err){
     if(err) console.log(err);
     
     var options = {
        folder: 'loggingroads',
        types: {
            line: 'roads',
            polyline: 'roads'
        }
     } 
      
     var shapefile = shpwrite.zip(allRoads, options);
     var shapeFileName = __dirname + '/output/roads.shp.zip';
     
     fs.writeFile(shapeFileName, shapefile, function(err){
        if(err) console.log(err);
        console.log('successfully wrote file: ' + shapeFileName);
    
         dataUpdatedCallback();
      });
     
    
   });
   
   

});

});

function writeJSON(outFile, json, callback){
  try {
    json = JSON.stringify(json) + '\n';
  }catch(err){
    console.log(err);
  }

  fs.writeFile(outFile, json, function(err){
    if(err) console.log(err);
    console.log('successfully wrote file: ' + outFile);

    if(callback) callback();
  });
}

} //end run()

if(runAsCronJob){
  var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: cronTime,
  onTick: function() {
    try{
      console.log('Started: ' + new Date().toLocaleString());
      run(function(){
        console.log('Finished: ' + new Date().toLocaleString());
         var sys = require('sys')
          var exec = require('child_process').exec;
          var child;
          child = exec("pm2 restart tessera", function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
          });
        });
    } catch(error){
      console.log(error.toString());
    }
    
    //restart vector tile service to load new data
   
    
  },
  start: false,
  timeZone: 'America/New_York'
});
job.start();
} else {
  //just run once
   console.log('Started: ' + new Date().toLocaleString());
  run(function(){
     console.log('Finished: ' + new Date().toLocaleString());
  });
}


