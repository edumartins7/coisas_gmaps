!function ($) {
    var mapLayers = function(element, settings){
        this.baseElement = $(element);
        this.options = settings;
        this.generateHtml();

        this.layers = this.baseElement.children('.layers');
        this.rows = function () {
            return this.layers.find('.layer'); 
        };
        this.rowCount = function () { 
            return this.rows().length; 
        };
        this.addButton = $(element).find('.add-layer-button');
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
        generateHtml: function (){
            var layersContainer = $('<div class="layers">');
            var data = this.options.data;
            for (var i = 0; i < data.length; ++i) {
                var layer = $('<div class="layer">');

                var moveUp = $('<a class="moveUp" href="#">&#9650;</a>');
                var moveDown = $('<a class="moveDown" href="#" >&#9660;</a>');
                var hiddenOrder = $('<input type="hidden" class="order" value="' + data[i].order +'">');
                var radioButton = $('<input type="radio" name="layerRadio" class="layer-radio" data-layer-id="'+ data[i].id +'" checked>');
                var txt = $('<input type="text" class="layer-name" tabindex="1" value="'+ data[i].name +'">');
                var excludeButton = $('<a href="#" class="exclude" >x</a>');

                $(layer).prepend(moveUp, moveDown, hiddenOrder, radioButton, txt, excludeButton);
                $(layersContainer).prepend(layer);
            }
            this.baseElement.prepend(layersContainer);
        },
        bindAddButtonEvent: function() {
            var s = this;
            s.addButton.on('click', function () {
                var cloned = s.rows().last().clone(); //clona o html da linha
                var radioButton = cloned.children('.layer-radio');
                $(radioButton).attr('data-layer-id', newGuid()); //cria um id para a nova layer

                var textbox = cloned.children('.layer-name');
                textbox.val('');

                cloned.insertAfter(s.rows().last());

                $(radioButton).trigger('change'); //alterna para a nova camada
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
        }
    };

    
    $.fn.mapLayers = function (options) {
        var defaults = {
            data: [
                {
                    'id': newGuid(),
                    'name': '',
                    'order': 0
                }
            ]
        };

        var settings = $.extend({}, defaults, options);

        return this.each(function () {
            new mapLayers(this, settings);
        });
    };
}(window.jQuery);