var turf = require('turf');

module.exports = function calcRoadDistance(geojson){
  var totalDistance = geojson['features'].reduce(function(distance, feature){
    return distance += turf.lineDistance(feature, 'kilometers');
  }, 0);

  totalDistance = Math.round(totalDistance * 10) / 10;
  return totalDistance;
};
