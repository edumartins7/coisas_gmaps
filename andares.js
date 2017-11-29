!function ($) {
    var mapLayers = function(element, settings){
        this.baseElement = $(element);
        this.layers = this.baseElement.children('.layers');
        this.rows = function () {
            return this.layers.find('.layer'); 
        };
        this.rowCount = function () { 
            return this.rows().length; 
        };
        this.addButton = $(element).find('.add-layer-button');
        this.options = settings;
        this.initialize();
    };

    mapLayers.prototype = {
        initialize: function () {
            this.bindAddButtonEvent();
            this.bindExcludeButtonEvent();
            this.bindMoveUpEvent();
            this.bindMoveDownEvent();
            return;
        },
        bindAddButtonEvent: function() {
            var s = this;
            s.addButton.on('click', function () {
                var cloned = s.rows().last().clone(); //clona o html da linha
                var radioButton = cloned.children('.layer-radio');
                $(radioButton).attr('data-layer-id', s.newGuid()); //cria um id para a nova layer

                var textbox = cloned.children('.layer-name');
                textbox.val('');

                cloned.insertAfter(s.rows().last());

                $(radioButton).trigger('click');//alterna para a nova camada
            });
        },
        bindExcludeButtonEvent: function () {
            var s = this;
            s.baseElement.on('click', '.exclude', function () {
                if(s.rowCount() === 1){
                    alert('É obrigatório definir pelo menos um andar.');
                    return;                    
                }
                var parent = this.parentNode;
                var isChecked = $(parent).children('.layer-radio').is(':checked');
                
                if(isChecked) {
                    $(s.rows()[0]).children('.layer-radio').trigger('click');
                }
                
                parent.parentNode.removeChild(parent);
            });
        },
        bindMoveUpEvent: function() {
            var s = this;          
            s.baseElement.on('click', '.moveUp', function(e) {
                var parent = e.target.closest('.layer');
                $(parent).prev('.layer').insertAfter(parent); //insere antes do anterior

                s.fixOrder();
            });
        },
        bindMoveDownEvent: function(){
            var s = this;
            s.baseElement.on('click', '.moveDown', function(e) {
                var parent = e.target.closest('.layer');
                $(parent).next('.layer').insertBefore(parent); //insere após o próximo

                s.fixOrder();
            });
        },
        fixOrder: function(){
            this.rows().each(function(i,v){
                $(v).find('.order').val(i);
            });
        },

        newGuid: function () { //esse cara não é tão garantido quanto um algoritmo do .net, mas ainda é bastante improvável que ocorra duplicidade.
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
        }
    };

    
    $.fn.mapLayers = function (options) {
        var defaults = {
            data: null,
            //maxOneChecked: false,
            minOneRow: false,
            sort: false,
            addCallback: null,
            delCallback: null
        };

        $.fn.mapLayers.newGuid =  function () { //esse cara não é tão garantido quanto um algoritmo do .net, mas ainda é bastante improvável que ocorra duplicidade.
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
        }

        var settings = $.extend({}, defaults, options);

        return this.each(function () {
            new mapLayers(this, settings);
        });
    };
}(window.jQuery);


// var divAndares = document.getElementByClassName('layers-container')[0];
// var qtdeLayers = divAndares.count



// document.getElementById('add-andar-button').addEventListener('click', function () {
//     var novoAndar = '<div class="andar">';
//     novoAndar += '<input type="radio" name="layerRadio" class="layerRadio" data-layer-name="layer3" > ';
//     novoAndar += '<input type="text" name="layers"> <a href="#" class="excluirAndar">x</a>';
//     novoAndar += '</div>';

//     divAndares.insertAdjacentHTML('beforeend', novoAndar);

//     var lastElement = divAndares.lastElementChild;
//     var checkbox = lastElement.querySelector('.layerRadio');
//     console.log(checkbox);
//     // checkbox.checked = true;
//     checkbox.click();
// });

// divAndares.addEventListener('click', function (event) { 
//     if(event.target && event.target.className == 'excluirAndar') {
//         var parent = event.target.parentNode;
//         parent.parentNode.removeChild(parent);
//         //mostrar janela de confirmação
//     }
// });