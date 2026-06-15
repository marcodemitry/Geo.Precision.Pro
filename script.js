/* =========================
GLOBAL VARIABLES
========================= */

let surveyPoints = [];

let map;
let polygon;
let markers = [];

let drawMode = false;

let streetLayer;
let satelliteLayer;

let mapVisible = true;

/* =========================
MAP INIT
========================= */

map = L.map('map').setView([28.1099,30.7503],8);

/* STREET */

streetLayer = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'© OpenStreetMap'
}
);

/* SATELLITE */

satelliteLayer = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
{
attribution:'© Esri'
}
);

streetLayer.addTo(map);

/* =========================
MAP CLICK
========================= */

map.on('click',function(e){

if(!drawMode) return;

const lat = e.latlng.lat;
const lon = e.latlng.lng;

surveyPoints.push({

lat,
lon,

displayText:`

Lat:
${lat.toFixed(8)}

<br>

Lon:
${lon.toFixed(8)}

`

});

updateSurvey();

});

/* =========================
THEME
========================= */

function toggleTheme(){

document.body.classList.toggle('light');

}

/* =========================
MAP TYPE
========================= */

function setStreetMap(){

map.removeLayer(satelliteLayer);

streetLayer.addTo(map);

}

function setSatelliteMap(){

map.removeLayer(streetLayer);

satelliteLayer.addTo(map);

}

/* =========================
DRAW MODE
========================= */

function toggleDrawMode(){

drawMode = !drawMode;

if(drawMode){

alert('Draw Mode Enabled');

}else{

alert('Draw Mode Disabled');

}

}

/* =========================
MAP COLLAPSE
========================= */

function toggleMap(){

const container =
document.getElementById('mapContainer');

mapVisible = !mapVisible;

if(mapVisible){

container.style.display='block';

setTimeout(()=>{

map.invalidateSize();

},300);

}else{

container.style.display='none';

}

}

/* =========================
ELEMENTS
========================= */

const fromType =
document.getElementById('fromType');

const toType =
document.getElementById('toType');

const decimalInputSection =
document.getElementById('decimalInputSection');

const dmsInputSection =
document.getElementById('dmsInputSection');

const utmInputSection =
document.getElementById('utmInputSection');

const decimalResultBox =
document.getElementById('decimalResultBox');

const dmsResultBox =
document.getElementById('dmsResultBox');

const utmResultBox =
document.getElementById('utmResultBox');

/* =========================
INPUT SWITCH
========================= */

fromType.addEventListener(
'change',
updateInputSections
);

toType.addEventListener(
'change',
updateResultBoxes
);

function updateInputSections(){

decimalInputSection.style.display='none';

dmsInputSection.style.display='none';

utmInputSection.style.display='none';

if(fromType.value==='decimal'){

decimalInputSection.style.display='block';

}

if(fromType.value==='dms'){

dmsInputSection.style.display='block';

}

if(fromType.value==='utm'){

utmInputSection.style.display='block';

}

}

function updateResultBoxes(){

decimalResultBox.style.display='none';

dmsResultBox.style.display='none';

utmResultBox.style.display='none';

if(toType.value==='decimal'){

decimalResultBox.style.display='block';

}

if(toType.value==='dms'){

dmsResultBox.style.display='block';

}

if(toType.value==='utm'){

utmResultBox.style.display='block';

}

}

/* =========================
POINT INPUT
========================= */

const pointInputType =
document.getElementById('pointInputType');

const pointDecimalSection =
document.getElementById('pointDecimalSection');

const pointDMSSection =
document.getElementById('pointDMSSection');

const pointUTMSection =
document.getElementById('pointUTMSection');

pointInputType.addEventListener(
'change',
switchPointInput
);

function switchPointInput(){

pointDecimalSection.style.display='none';

pointDMSSection.style.display='none';

pointUTMSection.style.display='none';

if(pointInputType.value==='decimal'){

pointDecimalSection.style.display='block';

}

if(pointInputType.value==='dms'){

pointDMSSection.style.display='block';

}

if(pointInputType.value==='utm'){

pointUTMSection.style.display='block';

}

}

/* =========================
DECIMAL → DMS
========================= */

function decimalToDMS(decimal){

const absolute =
Math.abs(decimal);

const degrees =
Math.floor(absolute);

const minutesNotTruncated =
(absolute - degrees) * 60;

const minutes =
Math.floor(minutesNotTruncated);

const seconds =
(
(minutesNotTruncated - minutes) * 60
).toFixed(2);

return{

degrees,
minutes,
seconds

};

}

/* =========================
DMS → DECIMAL
========================= */

function dmsToDecimal(
deg,
min,
sec,
dir
){

let decimal =

parseFloat(deg || 0)

+

parseFloat(min || 0) / 60

+

parseFloat(sec || 0) / 3600;

if(
dir==='S'
||
dir==='W'
){

decimal *= -1;

}

return decimal;

}

/* =========================
UTM
========================= */

function getUTMZone(longitude){

return Math.floor((longitude + 180) / 6) + 1;

}

function getUTMProjection(zone){

return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;

}

function latLonToUTM(lat, lon){

const zone =
getUTMZone(lon);

const utmProjection =
getUTMProjection(zone);

const result =
proj4(
'WGS84',
utmProjection,
[lon, lat]
);

return{

zone,
easting: result[0],
northing: result[1]

};

}

function utmToLatLon(
easting,
northing,
zone,
hemisphere = "N"
){

let utmProjection =
getUTMProjection(zone);

if(hemisphere==="S"){

utmProjection += " +south";

}

const result =
proj4(
utmProjection,
'WGS84',
[
parseFloat(easting),
parseFloat(northing)
]
);

return{

lat:result[1],
lon:result[0]

};

}

/* =========================
MAIN CONVERT
========================= */

function convertCoordinates(){

let lat;
let lon;

/* FROM DECIMAL */

if(fromType.value==='decimal'){

lat =
parseFloat(
document.getElementById('decimalLat').value
);

lon =
parseFloat(
document.getElementById('decimalLon').value
);

}

/* FROM DMS */

if(fromType.value==='dms'){

lat =
dmsToDecimal(

document.getElementById('latDeg').value,

document.getElementById('latMin').value,

document.getElementById('latSec').value,

document.getElementById('latDir').value

);

lon =
dmsToDecimal(

document.getElementById('lonDeg').value,

document.getElementById('lonMin').value,

document.getElementById('lonSec').value,

document.getElementById('lonDir').value

);

}

/* FROM UTM */

if(fromType.value==='utm'){

const zone =
parseInt(
document.getElementById('utmZone').value
);

const hemisphere =
document.getElementById('utmHemisphere').value;

const easting =
parseFloat(
document.getElementById('utmEasting').value
);

const northing =
parseFloat(
document.getElementById('utmNorthing').value
);

const result =
utmToLatLon(
easting,
northing,
zone,
hemisphere
);

lat = result.lat;
lon = result.lon;

}

if(
isNaN(lat)
||
isNaN(lon)
){

alert('Invalid Coordinates');

return;

}

console.log("Convert To =", toType.value);

/* TO DECIMAL */

if(toType.value==='decimal'){

document.getElementById('decimalLatResult').value =
lat.toFixed(8);

document.getElementById('decimalLonResult').value =
lon.toFixed(8);

}

/* TO DMS */

if(toType.value==='dms'){

const latDMS =
decimalToDMS(lat);

const lonDMS =
decimalToDMS(lon);

document.getElementById('latDegResult').value =
latDMS.degrees;

document.getElementById('latMinResult').value =
latDMS.minutes;

document.getElementById('latSecResult').value =
latDMS.seconds;

document.getElementById('latDirResult').value =
lat >= 0 ? 'N' : 'S';

document.getElementById('lonDegResult').value =
lonDMS.degrees;

document.getElementById('lonMinResult').value =
lonDMS.minutes;

document.getElementById('lonSecResult').value =
lonDMS.seconds;

document.getElementById('lonDirResult').value =
lon >= 0 ? 'E' : 'W';

}

/* TO UTM */

if(toType.value==='utm'){

console.log("TO UTM");

const utm =
latLonToUTM(lat,lon);

console.log("UTM =", utm);

document.getElementById('utmZoneResult').value =
utm.zone;

document.getElementById('utmHemisphereResult').value =
lat >= 0 ? 'N' : 'S';

document.getElementById('utmEastingResult').value =
utm.easting.toFixed(3);

document.getElementById('utmNorthingResult').value =
utm.northing.toFixed(3);

}

}

/* =========================
COPY
========================= */

function copyResults(){

let text='';

if(toType.value==='decimal'){

text =
`Latitude: ${document.getElementById('decimalLatResult').value}
Longitude: ${document.getElementById('decimalLonResult').value}`;

}

if(toType.value==='dms'){

text =
`${document.getElementById('latDegResult').value}° ${document.getElementById('latMinResult').value}' ${document.getElementById('latSecResult').value}" ${document.getElementById('latDirResult').value}

${document.getElementById('lonDegResult').value}° ${document.getElementById('lonMinResult').value}' ${document.getElementById('lonSecResult').value}" ${document.getElementById('lonDirResult').value}`;

}

if(toType.value==='utm'){

text =
`Zone: ${document.getElementById('utmZoneResult').value}${document.getElementById('utmHemisphereResult').value}

Easting: ${document.getElementById('utmEastingResult').value}

Northing: ${document.getElementById('utmNorthingResult').value}`;

}

navigator.clipboard.writeText(text);

alert('Copied');

}

/* =========================
CLEAR CONVERTER
========================= */

function clearConverter(){

document
.querySelectorAll('#decimalInputSection input, #dmsInputSection input, #utmInputSection input')
.forEach(input=>{

input.value='';

});

document.getElementById('decimalLatResult').value='';
document.getElementById('decimalLonResult').value='';

document.getElementById('latDegResult').value='';
document.getElementById('latMinResult').value='';
document.getElementById('latSecResult').value='';
document.getElementById('latDirResult').value='N';

document.getElementById('lonDegResult').value='';
document.getElementById('lonMinResult').value='';
document.getElementById('lonSecResult').value='';
document.getElementById('lonDirResult').value='E';

document.getElementById('utmZoneResult').value='';
document.getElementById('utmHemisphereResult').value='';
document.getElementById('utmEastingResult').value='';
document.getElementById('utmNorthingResult').value='';

}

/* =========================
ADD POINT
========================= */

function addPoint(){

let lat;
let lon;

let displayText='';

/* DECIMAL */

if(pointInputType.value==='decimal'){

lat =
parseFloat(
document.getElementById('pointLat').value
);

lon =
parseFloat(
document.getElementById('pointLon').value
);

displayText = `

Lat:
${lat}

<br>

Lon:
${lon}

`;

}

/* DMS */

if(pointInputType.value==='dms'){

const latDeg =
document.getElementById('pointLatDeg').value;

const latMin =
document.getElementById('pointLatMin').value;

const latSec =
document.getElementById('pointLatSec').value;

const latDir =
document.getElementById('pointLatDir').value;

const lonDeg =
document.getElementById('pointLonDeg').value;

const lonMin =
document.getElementById('pointLonMin').value;

const lonSec =
document.getElementById('pointLonSec').value;

const lonDir =
document.getElementById('pointLonDir').value;

lat =
dmsToDecimal(
latDeg,
latMin,
latSec,
latDir
);

lon =
dmsToDecimal(
lonDeg,
lonMin,
lonSec,
lonDir
);

displayText = `

${latDeg}°
${latMin}'
${latSec}"
${latDir}

<br>

${lonDeg}°
${lonMin}'
${lonSec}"
${lonDir}

`;

}

/* UTM */

if(pointInputType.value==='utm'){

const zone =
parseInt(
document.getElementById('pointUTMZone').value
);

const hemisphere =
document.getElementById('pointUTMHemisphere').value;

const easting =
parseFloat(
document.getElementById('pointEasting').value
);

const northing =
parseFloat(
document.getElementById('pointNorthing').value
);

const result =
utmToLatLon(
easting,
northing,
zone,
hemisphere
);

lat = result.lat;
lon = result.lon;

displayText = `

Zone: ${zone}${hemisphere}

<br>

Easting:
${easting}

<br>

Northing:
${northing}

`;

}

if(
isNaN(lat)
||
isNaN(lon)
){

alert('Invalid Point');

return;

}

surveyPoints.push({

lat,
lon,
displayText

});

updateSurvey();

}

/* =========================
DELETE POINT
========================= */

function deletePoint(index){

surveyPoints.splice(index,1);

updateSurvey();

}

/* =========================
CLEAR SURVEY
========================= */

function clearSurvey(){

surveyPoints=[];

updateSurvey();

}

/* =========================
UPDATE SURVEY
========================= */

function updateSurvey(){

const pointsList =
document.getElementById('pointsList');

pointsList.innerHTML='';

markers.forEach(marker=>{

map.removeLayer(marker);

});

markers=[];

if(polygon){

map.removeLayer(polygon);

}

surveyPoints.forEach((point,index)=>{

const marker =
L.marker([point.lat,point.lon])

.addTo(map)

.bindPopup(
`Point ${index+1}`
);

markers.push(marker);

pointsList.innerHTML += `

<div class="point-card">

<b>
Point ${index+1}
</b>

<br><br>

${point.displayText}

<button
class="delete-btn"
onclick="deletePoint(${index})">

Delete Point

</button>

</div>

`;

});

if(
surveyPoints.length >=3
){

polygon =
L.polygon(

surveyPoints.map(p=>[
p.lat,
p.lon
]),

{
color:'#38bdf8',
fillColor:'#38bdf8',
fillOpacity:0.25
}

).addTo(map);

map.fitBounds(
polygon.getBounds()
);

}

document.getElementById('areaMeters')
.innerText =
calculateArea().toFixed(2);

document.getElementById('perimeterMeters')
.innerText =
calculatePerimeter().toFixed(2);

}

/* =========================
AREA
========================= */

function calculateArea(){

if(
surveyPoints.length <3
){

return 0;

}

let utmPoints=[];

surveyPoints.forEach(point=>{

const utm =
latLonToUTM(
point.lat,
point.lon
);

utmPoints.push({

x:utm.easting,
y:utm.northing

});

});

let area=0;

for(
let i=0;
i<utmPoints.length;
i++
){

const j =
(i+1)%utmPoints.length;

area +=
utmPoints[i].x *
utmPoints[j].y;

area -=
utmPoints[j].x *
utmPoints[i].y;

}

return Math.abs(area/2);

}

/* =========================
PERIMETER
========================= */

function calculatePerimeter(){

if(
surveyPoints.length <2
){

return 0;

}

let total = 0;

for(
let i=0;
i<surveyPoints.length;
i++
){

const j =
(i+1)%surveyPoints.length;

const p1 =
latLonToUTM(
surveyPoints[i].lat,
surveyPoints[i].lon
);

const p2 =
latLonToUTM(
surveyPoints[j].lat,
surveyPoints[j].lon
);

const dx =
p2.easting - p1.easting;

const dy =
p2.northing - p1.northing;

total +=
Math.sqrt(
dx*dx + dy*dy
);

}

return total;

}

/* =========================
GPS
========================= */

function useCurrentGPS(){

navigator.geolocation
.getCurrentPosition(

(position)=>{

const lat =
position.coords.latitude;

const lon =
position.coords.longitude;

document.getElementById('pointLat')
.value =
lat.toFixed(8);

document.getElementById('pointLon')
.value =
lon.toFixed(8);

map.setView(
[lat,lon],
16
);

},

()=>{

alert('GPS Permission Denied');

}

);

}

/* =========================
EXPORT CSV
========================= */

function exportCSV(){

if(
surveyPoints.length===0
){

alert('No Points');

return;

}

let csv =
'Point,Latitude,Longitude\n';

surveyPoints.forEach((p,i)=>{

csv +=
`${i+1},${p.lat},${p.lon}\n`;

});

const blob =
new Blob([csv],{
type:'text/csv'
});

const link =
document.createElement('a');

link.href =
URL.createObjectURL(blob);

link.download =
'GeoPrecision_Points.csv';

link.click();

}

/* =========================
SAVE PROJECT
========================= */

function saveProject(){

localStorage.setItem(

'geoPrecisionPoints',

JSON.stringify(surveyPoints)

);

alert('Project Saved');

}

/* =========================
LOAD PROJECT
========================= */

window.onload = function(){

const saved =
localStorage.getItem(
'geoPrecisionPoints'
);

if(saved){

surveyPoints =
JSON.parse(saved);

updateSurvey();

}

updateInputSections();

updateResultBoxes();

switchPointInput();

};

/* =========================
PWA
========================= */

if(
'serviceWorker'
in navigator
){

navigator.serviceWorker
.register('service-worker.js');

}