var divAndares = document.getElementById('divAndaresContainer');

document.getElementById('add-andar-button').addEventListener('click', function () {
    var novoAndar = '<div class="andar">';
    novoAndar += '<input type="radio" name="chbLayer" class="chbLayer" data-layer-name="layer3" >';
    novoAndar += '<input type="text"> <a href="#" class="excluirAndar" >x</a>';
    novoAndar += '</div>';

    divAndares.insertAdjacentHTML('beforeend', novoAndar);
});