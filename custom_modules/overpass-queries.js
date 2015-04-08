// NOTES FROM RAFAEL
// You shouldn't forget about the abandoned:track=* segments (more than
// 7000 in Cameroon for example), and the segments without access tag
// (more than one thousand in Rep. of Congo).

// Maybe better...

// //For tracks and abandoned tracks with access tag (all countries)

// way["highway"="track"]["access"="forestry"](bbox);
// way["highway"="track"]["access"="agriculture"](bbox);
// way["abandoned:highway"="track"]["access"="forestry"](bbox);
// way["abandoned:highway"="track"]["access"="agricultural"](bbox);

// //For tracks and abandoned tracks without access tag (only Cameroon,
// Centrafrique and Gabon. We ignore DRC and Eq. Guinea, as they have all
// segments with access tag, and Congo because it's source=* tag is
// different)

// way["highway"="track"]["source"="Landsat;WRI"](bbox);
// way["abandoned:highway"="track"]["source"="Landsat;WRI"](bbox);

// //For Congo only

// way["highway"="track"]["source"="WRI"](bbox);
// way["abandoned:highway"="track"]["source"="WRI"](bbox);


module.exports = function(queryName, bbox){
  // bbox should be array [s,w,n,e] or string 's,w,n,e'
  if(Array.isArray(bbox)){ bbox = bbox.join(); }

  var queries = {
    sample: '[out:json][timeout:25];' +
            '(' +
              'way["highway"="track"]["access"="forestry"]( {{bbox}} );' +
              'way["highway"="track"]["access"="agriculture"]( {{bbox}} );' +
              'way["abandoned:highway"="track"]["access"="forestry"]( {{bbox}} );' +
              'way["abandoned:highway"="track"]["access"="agricultural"]( {{bbox}} );' +
            ');' +
            'out body;' +
            '>;' +
            'out skel qt;'
  };

  return queries[queryName].replace(/{{bbox}}/g, bbox);

};
