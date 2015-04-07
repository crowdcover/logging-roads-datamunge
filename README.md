Some simple node scripts to collect and analyze HOT Tasking Manager and OSM Overpass data.  Written for the [Logging Roads project](https://github.com/crowdcover/logging-roads).

### overpass2mapbox.js
Query overpass for all logging roads within the bounding box of the specified geojson file.  This will overwrite the existing mapbox project, effectively updating the map layer, providing you run it against a a geojson that contains all current tm projects.

**e.g.**
```
node overpass2mapbox.js drc_cog_car_tm-area.geojson
```
Uploads all logging roads that are within the bbox of the project geojsons stored in the `drc_cog_car_tm-area.geojson` file.


### get_tm_grids.js
Request project grids from the tasking manager for all specified projects.  Currently, the HOT TM isn't CORS enabled, so the jekyll front end can't directly request.

**e.g.**
```
node get_tm_grids.js 920 956 957
```

### road_length.js
Calculate the total length of a .geojson file containing a GeoJSON FeatureCollection of LineString features.

**e.g.**
```
node road_length.js
```

