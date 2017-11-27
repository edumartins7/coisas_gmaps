var selectedFeature;
var colorButtons = document.getElementsByClassName('color-button');
var selectedColor;
var map;
var polygons = [];
var infoWindow; //garantir apenas uma infowindow


function buildContent(descriptionId){
  
  //vem de uma chamada ajax
  var bd = '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
  'sandstone rock formation in the southern part of the '+
  'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
  'rock caves and ancient paintings. Uluru is listed as a World '+
  'Heritage Site.</p>'+
  '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
  'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
  '(last visited June 22, 2009).</p>';
  var tit = "Ulurururu";

  var contentString = '<div id="content">'+
  '<div id="siteNotice">'+
  '</div>'+
  '<h1 id="firstHeading" class="firstHeading">' + tit + '</h1>'+
  '<div id="bodyContent">'+
  bd +  
  '</div>'+
  '</div>';

  return contentString;
}


function selectColor(color) {
  selectedColor = color;
}
function setSelectedFeatureColor(color) {
  if (selectedFeature) {
    selectedFeature.setProperty('fillColor', color); //a função toGeoJson não salva essas propriedades mais detalhadas dos polígonos. é preciso armazenar nas properties e ler posteriormente.
    map.data.overrideStyle(selectedFeature, { 
      fillColor: color
    });
  }
}
function unselectAll(){
  for (var i = 0; i < polygons.length; i++){
    map.data.overrideStyle(polygons[i].feature,{
      editable: false,
      draggable: false
    });
  }
  selectedFeature = null;
}

function setSelected(feature) {
  unselectAll();
  map.data.overrideStyle(feature, { 
    editable: true,
    draggable: true
  });
  selectedFeature = feature;  
}

function bindDataLayerListeners(dataLayer) {
    //poligono adicionado
    dataLayer.addListener('addfeature', addPolygon);
    dataLayer.addListener('removefeature', saveChanges);
    dataLayer.addListener('setgeometry', saveChanges);

    //clicar sobre o polígono o seleciona
    dataLayer.addListener('click', function(event) {
      setSelected(event.feature);
      openInfoWindow(event.feature);
    });
   
    map.addListener('click', function (event) {
      unselectAll();
    });
}

function addPolygon(newPolygon) {
   //fecha a infowindow no momento em que o usuário começar a arrastar um polígono
   google.maps.event.addListener(newPolygon, 'dragstart', function (e) {
    console.log('eeeee');
    closeInfoWindow();
  });

  polygons.push(newPolygon);
  saveChanges();
  setSelected(newPolygon.feature);
  map.data.setDrawingMode(null);
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
  map.data.addGeoJson(data);
  
  map.data.setStyle(function(feature){
    var fillColor = 'gray';
    var fillOpacity = 0.7;
    var strokeWeight = 1000;
    if(feature.getProperty('fillColor')) {
      fillColor = feature.getProperty('fillColor');
    };
    if(feature.getProperty('fillOpacity')) {
      fillOpacity = feature.getProperty('fillOpacity');
    };

    return ({
      editable: false,
      draggable: false,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      strokeColor : fillColor,
      strokeOpacity: 1
    });
  });
}

function closeInfoWindow(){
  if(infoWindow){
    infoWindow.close();
  }
}

function openInfoWindow(feature){
  closeInfoWindow();

  infoWindow = new google.maps.InfoWindow({
    content: buildContent(0)
  });

  infoWindow.setPosition(feature.getGeometry().getAt(0).getAt(0));
  infoWindow.open(map);
}

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(22.344, 114.048),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    zoomControl: true
  });
  
  map.data.setControls(['Polygon','Point']);

  bindDataLayerListeners(map.data);

  //deixa a primeira cor selecionada por padrão
  selectColor(colorButtons[0].style.backgroundColor);
  
  //a color in pallete is clicked.
  for(var i=0; i< colorButtons.length; i++){
    google.maps.event.addDomListener(colorButtons[i], 'click', function() {
      selectedColor = this.style.backgroundColor;
      setSelectedFeatureColor(this.style.backgroundColor);
    });
  }
  
  //muda opacidade
  google.maps.event.addDomListener(document.getElementById('fill_opacity'), 'change', function(){
    var opacity = this.value / 100;
    if (selectedFeature) {
      selectedFeature.setProperty('fillOpacity', opacity); //a função toGeoJson não salva essas propriedades mais detalhadas dos polígonos. é preciso armazenar nas properties e ler posteriormente.
      map.data.overrideStyle(selectedFeature, { 
        fillOpacity: opacity
      });
    }
  });

  //deleta a feature selecionada
  google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', function (){
    if(selectedFeature){
      map.data.remove(selectedFeature);
    }
  });

  //fecha qualquer infoWindow ao clicar fora dela
  google.maps.event.addDomListener(map, 'click', function(event) {
    closeInfoWindow();
  });


  //load saved data
  loadGeoJson(map);
}
google.maps.event.addDomListener(window, 'load', initialize);