module.exports = function mergeGeoJSON(geojsons, callback){
  // merge geojson files, skipping duplicate features
  var merged = {
    "type": "FeatureCollection",
    "features": []
  };
  var ids = {};
 
  Object.keys(geojsons).forEach(function(key){
    var geojson = geojsons[key];
    
    geojson['features'].forEach(function(feature){
      var id = feature['properties']['id'];
      //delete tags from merged file
      delete feature.properties.tags; 
      if(!(id in ids)){
        ids[id] = true;
        merged['features'].push(feature);
      }

    });
  });

  return merged;

};
