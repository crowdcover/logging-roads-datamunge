var fs = require('fs');
var http = require('http');
var tmProjects = process.argv.slice(2);

for(var i=0; i<tmProjects.length; i++){
  (function(i){
    var project = tmProjects[i];
    console.log('requesting tm grid for project: ' + project);
    var req = http.get('http://tasks.hotosm.org/project/' + tmProjects[i] + '/tasks.json', function(res){
        var outFile = fs.createWriteStream('output/osm_tm_tasks_' + project + '.geojson');
        res.pipe(outFile);
      }).on('error', function(err){
        console.log('Error for tm project ' + project + ': ' + err.message);
      });

  })(i);

}
