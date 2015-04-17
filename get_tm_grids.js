var fs = require('fs');
var http = require('http');
var tmProjects = process.argv.slice(2);

if(tmProjects.length === 0) throw 'please specify at least one tm project number';

tmProjects.forEach(function(project){
  console.log('requesting tm grid for project: ' + project);
  
  var req = http.get('http://tasks.hotosm.org/project/' + project + '/tasks.json', function(res){
    var outFile = fs.createWriteStream('data/osm_tm_tasks_' + project + '.geojson');
    res.pipe(outFile);
  });

  req.on('error', function(err){
    console.log('Error for tm project ' + project + ': ' + err.message);
  });

});
