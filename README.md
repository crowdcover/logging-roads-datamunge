Some simple node scripts to collect and analyze HOT Tasking Manager and OSM Overpass data.  Written for the [Logging Roads project](https://github.com/crowdcover/logging-roads).

## app.js
Run `node app.js` to:
* download logging roads for each project area and write to file
* calculate the total distance of roads per project and write to file
* merge all logging road geojsons and write to file
* upload the merged file to MapBox

Projects are defined in app.js as a series of key-value pairs:
* **key**: project key
* **value**: path to project areas geojson file



## Modules
app.js a bunch of custom modules that can be used independently.  With the exception of `bbox-query-overpass`, they all expect geojson objects, not paths to geojson files, so would likely need to be called from another small script in order to run them independently.


### bbox-query-overpass.js
Given an object literal, where each key is a unique project key, and each value is a path to a project_area.geojson file, send a query request to OSM Overpass for the bbox of the specified project_area.geojson.

**e.g.**
```
queryOverpass(inFiles, overpassQL, function(err, geojsonObj){...});
```


### get_tm_grids.js
**not implemented**
Request project grids from the tasking manager for all specified projects.  Currently, the HOT TM isn't CORS enabled, so the jekyll front end can't directly request.

**e.g. (from the CLI)**
```
node get_tm_grids.js 920 956 957
```


### road_length.js
Given an object literal where each key is a unique project key, and each value is a geojson JSON (not stringified) FeatureCollection of LineStrings, return the total length of all LineStrings.

**e.g.**
```
calcLength(geojson);
```


### merge-geojson.js
Given an object literal where each key is a unique project key, and each value is a geojson JSON (not stringified) FeatureCollection, merge all json objects, skipping features with duplicate id properties.

**e.g.**
```
mergeGeoJSON(geojsonObj);
```


### overpass2mapbox.js
**no longer implemented**
Script combining query-overpass.js and upload2mapbox.js.  Query overpass for all logging roads within the bounding box of the specified geojson file.  This will overwrite the existing Mapbox project, effectively updating the map layer, providing you run it against a a geojson that contains all current tm projects.

**e.g.**
```
node overpass2mapbox.js drc_cog_car_tm-area.geojson
```
Uploads all logging roads that are within the bbox of the project geojsons stored in the `drc_cog_car_tm-area.geojson` file.
