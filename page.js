var selectedFeature;
var colorButtons = document.getElementsByClassName('color-button');
var selectedColor;
var map;
var polygons = [];
var infoWindow; //garantir apenas uma infowindow
var layers = [];
var currentLayerId = function () { return $('.layer-radio:checked').first().data('layer-id'); }; //inicializa na camada com o radiobutton selecionado
var skipsaveChangesAtLocalStorage = false;
var shoppingLat;
var shoppingLng;
var goToCenterControlDiv;
var setCenterControlDiv;
var mapCenterZoom;


//#region AAA

function GoToCenterControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 0 15px rgba(0,0,0,.9)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '150px';
  controlUI.style.textAlign = 'center';


  controlUI.style.backgroundColor = 'rgb(57, 73, 171)';    
  controlUI.title = 'Clique para centralizar';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'white';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  controlText.style.paddingLeft = '40px';
  controlText.style.paddingRight = '40px'
  controlText.innerHTML = '&#171';
  controlUI.appendChild(controlText);

  //Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {

    if(shoppingLat && shoppingLng) {
      var center = new google.maps.LatLng(shoppingLat, shoppingLng);
      map.setCenter(center);
    
      goToCenterControlDiv.style["display"] = "none";
      goToCenterControlDiv.style.left = '390px';
      setCenterControlDiv.style["display"] = "none";
      map.setZoom(mapCenterZoom);
    }
  });
}

function addGoToCenterControl(map, index, position) {
  goToCenterControlDiv = document.createElement('div');
  goToCenterControlDiv.index = index;
  
  var centerControl = new GoToCenterControl(goToCenterControlDiv, map);

  map.controls[position].push(goToCenterControlDiv);
}


function SetCenterControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 0 15px rgba(0,0,0,.9)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '150px';
  controlUI.style.marginLeft = '100px';
  
  controlUI.style.textAlign = 'center';
  controlUI.style.backgroundColor = 'rgb(251, 192, 45)';  
  controlUI.title = 'Clique para fixar a tela nessa posição';
  controlDiv.appendChild(controlUI);
  
  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'white';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  controlText.style.paddingLeft = '40px';
  controlText.style.paddingRight = '40px'
  controlText.innerHTML = 'F';
  controlUI.appendChild(controlText);

  //Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    var mapCenter = map.getCenter();
    var currentZoom = map.getZoom();    

    mapCenterZoom = currentZoom;
    shoppingLat = mapCenter.lat();
    shoppingLng = mapCenter.lng();

    goToCenterControlDiv.style["display"] = "none";
    setCenterControlDiv.style["display"] = "none";
  });
}

function addSetCenterControl(map, index, position) {
  setCenterControlDiv = document.createElement('div');
  setCenterControlDiv.index = index;
  
  var centerControl = new SetCenterControl(setCenterControlDiv, map);

  map.controls[position].push(setCenterControlDiv);
}


//#endregion



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
  '</div>' +
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
    saveChangesAtLocalStorage();
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
function deleteSelectedFeature() {
  if(selectedFeature){
    map.data.remove(selectedFeature);
    closeInfoWindow();
  }
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
    //salva ao excluir 
    dataLayer.addListener('removefeature', saveChangesAtLocalStorage);
    //salva ao alterar
    dataLayer.addListener('setgeometry', saveChangesAtLocalStorage);
  
    //fecha a infowindow no momento em que o usuário começar a arrastar um polígono
    dataLayer.addListener('mousedown', closeInfoWindow);
 
    //clicar sobre o polígono o seleciona
    dataLayer.addListener('click', function(event) {
      setSelected(event.feature);
      openInfoWindow(event.feature);
    });
  
    //clicar fora do polígono desseleciona tudo e fecha as infoWindows
    map.addListener('click', function (event) {
      unselectAll();
      closeInfoWindow();     
    });

    //ao mover o centro do mapa atualiza os textboxes do painel
    map.addListener('center_changed', function () {
      var mapCenter = map.getCenter();

      var currentLat = mapCenter.lat();
      var currentLng = mapCenter.lng();

      $('#mapLat').text(currentLat);
      $('#mapLng').text(currentLng);


      console.log("sLat: " + shoppingLat + " sLng: " + shoppingLng + " currentLat: " + currentLat + " currentLng: " + currentLng );

      if(!shoppingLat || !shoppingLng) {
        console.log('a');
        goToCenterControlDiv.style["display"] = "none";
        setCenterControlDiv.style["display"] = "inline";          
        console.log('aa');      
      } else if (shoppingLat == currentLat && shoppingLng == currentLng) {
        console.log('b');
        
        goToCenterControlDiv.style["display"] = "none";
        setCenterControlDiv.style["display"] = "none";

      } else {
        var a = goToCenterControlDiv.style["display"];
        var b = setCenterControlDiv.style["display"];

        if(a != "inline" && b != "inline"){
          console.log('c');
          goToCenterControlDiv.style["display"] = "inline";
          setCenterControlDiv.style["display"] = "inline";
          goToCenterControlDiv.style.left = '390px';
          
        }
      }
    });
  }

function bindDomListeners() {
  //uma cor é clicada
  for(var i=0; i< colorButtons.length; i++){
    google.maps.event.addDomListener(colorButtons[i], 'click', function() {
      selectedColor = this.style.backgroundColor;
      setSelectedFeatureColor(this.style.backgroundColor);
    });
  }
  
  //seletor de opacidade
  google.maps.event.addDomListener(document.getElementById('fill_opacity'), 'change', function(){
    var opacity = this.value / 100;
    if (selectedFeature) {
      selectedFeature.setProperty('fillOpacity', opacity); //a função toGeoJson não salva essas propriedades mais detalhadas dos polígonos. é preciso armazenar nas properties e ler posteriormente.
      map.data.overrideStyle(selectedFeature, { 
        fillOpacity: opacity
      });
    }
  });

  //deleta a feature selecionada ao clicar no botão "excluir"
  google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', function (){
    deleteSelectedFeature();
  });

  $(document).on('change', '.layer-radio', function () {
    loadGeoJson(currentLayerId());
  });

  google.maps.event.addDomListener(document, 'keydown', function (event) {
    //pressionar delete com o objeto selecionado o exclui
    if(event.keyCode == 46) {
      deleteSelectedFeature();
    }
    //seleciona a ferramenta de mover ao pressionar esc. Isso faz com que polígonos que estejam sendo desenhados sejam concluídos.
    else if(event.keyCode == 27) {
      map.data.setDrawingMode(null);        
    }
  });

  //ao clicar no botão "lock" bloqueia mover a tela e limita o zoom
  // google.maps.event.addDomListener(document.getElementById('lockscreen-button'), 'click', function () {
  //   var currentZoom = map.getZoom();    
  //   var locked = this.dataset.locked;

  //   if (locked === 'true') {
  //     this.innerHTML = 'lock';
  //     this.dataset.locked = 'false';
  //     map.setOptions({ draggable: true, minZoom: null, maxZoom: null });
  //   } else {
  //     this.innerHTML = 'unlock';
  //     this.dataset.locked = 'true';
  //     map.setOptions({ draggable: false, minZoom: currentZoom -3, maxZoom: currentZoom + 3 });
  //   } 
  // });


}

function clearMap(saveChangesAtLocalStorage) {
  skipsaveChangesAtLocalStorage = !saveChangesAtLocalStorage;
  map.data.forEach(function (f) {
    map.data.remove(f); //esse cara dá trigger no evento featureRemoved, que por padrão salva as alterações.
  });
  skipsaveChangesAtLocalStorage = false;
}

function addPolygon(newPolygon) {
  polygons.push(newPolygon);
  saveChangesAtLocalStorage();
  setSelected(newPolygon.feature);
  map.data.setDrawingMode(null);
}

function saveChangesAtLocalStorage() {
  if(!skipsaveChangesAtLocalStorage) {
    map.data.toGeoJson(function (json) {
      localStorage.setItem(currentLayerId(), JSON.stringify(json));    
    });
  } 
}

function downloadLayers(){
  var request = new XMLHttpRequest();
  request.open("GET", "layer1.json", false);
  request.send(null);
  request.onreadystatechange = function() {
    if ( request.readyState === 4 && request.status === 200 ) {
      var my_JSON_object = request.responseText;
      console.log(my_JSON_object);
    }
  }
}

function loadGeoJson(fileName) {
  var data = JSON.parse(localStorage.getItem(fileName));
  clearMap(true);
  map.data.addGeoJson(data);
  

  //o geoJson, por ser um padrão genérico, é um tanto limitado. 
  //o trecho abaixo serve para colorir um polígono  - uma funcionalidade do gmaps, não do geoJson - com base em propriedades arbitrárias
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


function initAutocomplete(){
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
     
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    map.setZoom(19);
  });
}

        
function initialize() {

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: new google.maps.LatLng(-23.621384594886123, 313.3008238892556),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    zoomControl: true,
    rotateControl: true
  });

  map.data.setControls(['Polygon','Point']);
  map.data.setControlPosition(google.maps.ControlPosition.TOP_CENTER);
  
  addGoToCenterControl(map, 1, google.maps.ControlPosition.BOTTOM_CENTER);
  addSetCenterControl(map, 2, google.maps.ControlPosition.BOTTOM_CENTER);
  
  initAutocomplete();
  
  bindDataLayerListeners(map.data);
  bindDomListeners();

  //deixa a primeira cor selecionada por padrão
  selectColor(colorButtons[0].style.backgroundColor);

  //baixa as camadas
  // downloadLayers();

  //load saved data
  loadGeoJson(currentLayerId());
}

google.maps.event.addDomListener(window, 'load', initialize);