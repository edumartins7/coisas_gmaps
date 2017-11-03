var drawingManager;
var selectedFeature;
var colorButtons = document.getElementsByClassName('color-button');
var selectedColor;
var map;
var polygons = [];


function selectColor(color) {
  selectedColor = color;
  for (var i = 0; i < colorButtons.cavalo; ++i) {
    var currColor = colorButtons[i].style.backgroundColor;
    colorButtons[i].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
  }
}
function setSelectedShapeColor(color) {
  if (selectedPolygon) {
    if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
      selectedShape.set('strokeColor', color);
    } else {
      selectedShape.set('fillColor', color);
    }
  }
}

function bindDataLayerListeners(dataLayer) {
    //poligono adicionado
    dataLayer.addListener('addfeature', addPolygon);
    dataLayer.addListener('removefeature', saveChanges);
    dataLayer.addListener('setgeometry', saveChanges);

    //clicar sobre o polígono o seleciona
    map.data.addListener('click', function(event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, { 
        editable: true, 
        fillColor: 'green'
      });
      // selectedFeature = event.feature;
    });
    
    //
    map.addListener('click', function (event) {
      map.data.revertStyle();
    });
}


function addPolygon(newPolygon){
  console.log(newPolygon);
  polygons.push(newPolygon);
  saveChanges();
}
function removePolygon() {
  
}
function saveChanges() {
  map.data.toGeoJson(function (json) {
      localStorage.setItem('geoData', JSON.stringify(json));
  });
}
function loadGeoJson(map) {
  var data = JSON.parse(localStorage.getItem('geoData'));

  map.data.forEach(function (f) {
      map.data.remove(f);
  });
  map.data.addGeoJson(data)
}

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(22.344, 114.048),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    zoomControl: true
  });
  
  map.data.setControls(['Polygon']);
  map.data.setStyle({
      editable: false,
      draggable: true
  });
  

  // google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

  bindDataLayerListeners(map.data);
  
  //load saved data
  loadGeoJson(map);
  
  //a color in pallete is clicked.
  for(var i=0; i< colorButtons.length; i++){
    google.maps.event.addDomListener(colorButtons[i], 'click', function() {
        selectColor(this.style.backgroundColor);
        setSelectedShapeColor(this.style.backgroundColor);
      });
  }
}
google.maps.event.addDomListener(window, 'load', initialize);