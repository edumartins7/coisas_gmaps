var colors = ['rgb(136, 14, 79)','rgb(165, 39, 20)','rgb(230, 81, 0)','rgb(249, 168, 37)','rgb(255, 214, 0)','rgb(129, 119, 23)','rgb(85, 139, 47)','rgb(9, 113, 56)','rgb(0, 96, 100)','rgb(1, 87, 155)','rgb(26, 35, 126)','rgb(103, 58, 183)','rgb(78, 52, 46)','rgb(194, 24, 91)','rgb(255, 82, 82)','rgb(245, 124, 0)','rgb(251, 192, 45)','rgb(255, 234, 0)','rgb(175, 180, 43)','rgb(124, 179, 66)','rgb(15, 157, 88)','rgb(0, 151, 167)','rgb(2, 136, 209)','rgb(57, 73, 171)','rgb(156, 39, 176)','rgb(121, 85, 72)','rgb(244, 143, 177)','rgb(237, 162, 155)','rgb(255, 204, 128)','rgb(250, 218, 128)','rgb(255, 255, 141)','rgb(230, 238, 156)','rgb(197, 225, 165)','rgb(135, 206, 172)','rgb(178, 235, 242)','rgb(161, 194, 250)','rgb(159, 168, 218)','rgb(206, 147, 216)','rgb(188, 170, 164)','rgb(255, 255, 255)','rgb(189, 189, 189)','rgb(117, 117, 117)','rgb(66, 66, 66)','rgb(0, 0, 0)']

function selectColorr(color){
    for (var i = 0; i < colorButtons.length; ++i) {
        var currColor = colorButtons[i].style.backgroundColor;
        colorButtons[i].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
    }
}
function makeColorButton (color) {
    var button = document.createElement('span');
    button.className = 'color-button';
    button.style.backgroundColor = color;

    //ao clicar troca a borda
    google.maps.event.addDomListener(button, 'click', function () {
        selectColorr(color);
    });

    return button;
}
function buildColorPalette(){
    var colorPalette = document.getElementById('color-palette');

    for (var i = 0; i < colors.length; ++i) {
        var colorButton = makeColorButton(colors[i]);
        colorPalette.appendChild(colorButton);
    }
}    
window.onload = function () {
    buildColorPalette();
};