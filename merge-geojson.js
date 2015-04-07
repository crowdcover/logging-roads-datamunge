module.exports = function mergeGeoJSON(files, callback){
  // merge geojson files, skipping duplicate features
  var merged = {
    "type": "FeatureCollection",
    "features": []
  };
  var ids = {};
 
  async.eachSeries(files, function(file, callback){

    fs.readFile(file, 'utf-8', function(err, data){
      if(err) {
        console.log(err);
        return callback(err);
      }
      data = JSON.parse(data);

      data['features'].forEach(function(feature){
        var id = feature['properties']['id'];

        if(!(id in ids)){
          ids[id] = true;
          merged['features'].push(feature);
        }

      });

      callback();
    });    

  }, function(err){
    callback(merged, ids);
  });

}
