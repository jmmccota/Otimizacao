//Varivel de controle para MathJax.js
mathCont = 1;
//Varivel para leitura do arquivo
var reader;

// ******************************************************** ALERTS *********************************************************
//Cria um alert bootstrap
function showAlert(type, message) {
    $('#alert').removeClass();
    $('#alert').addClass('alert alert-' + type).html(message).fadeIn();
    window.setTimeout(closeAlert, 3200);
}

//Apaga um alert bootstrap
function closeAlert() {
    $('#alert').fadeOut();
}

// **************************************************** FILE FUNCTION ******************************************************
function analisarStyle(type) {
    $("#analisarFile").removeClass();
    $("#analisarFile").addClass("btn btn-" + type);
}

function analisarFile() {
    try {
        var source = "";
        var restricoes = [];
        var relacoes = [];
        var rhs = [];
        var upper = [];
        var lower = [];
        var objetivo = [];
        var problema = "";
        var nVariaveis = 0;
        var iRest = 0;
        var contLinha = 0;
        source = reader.result;
        var linha = 1;
        var cont = 1;
        var tam = 0;
        var p = 1; //qual parte
        while (cont < source.length) {
            if (p === 1) {//qual problema...p=1 Ã© pra saber se Ã© max ou min
                if (source[1] === "a") {
                    problema = "Maximize";
                } else if (source[1] === "i") {
                    problema = "Minimize";
                } else {
                    throw "Tipo do problema indefinido";
                }
                while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9") {

                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }
                p++;
            }
            if (p === 2) { //saber funÃ§ao objetivo
                var linha = "";
                while (source[cont] !== "\n") { //pega a linha inteira 

                    linha += source[cont];
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }

                for (i = 0; i < linha.length; i++) { //o numero de | Ã© o numero de variaveis
                    if (linha[i] === "|") {
                        nVariaveis++;
                    }
                }
                objetivo = linha.split("|", nVariaveis); //funÃ§ao objetivo
                p++;
                while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9" && source[cont] !== "n") {//avanÃ§a ate as restriÃ§oes

                    cont++;
                    if (cont > source.length) {
                        break;
                    }

                }
                if (source[cont] === "n") {
                    restricoes.push("n");
                    p = 4;
                }
            }
            if (p === 3) { //pega restriÃ§oes
                linha = "";
                while (source[cont] !== ">" && source[cont] !== "<" && source[cont] !== "=") { //pega ate a relacao
                    linha += source[cont];
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }
                restricoes[iRest] = linha.split("|", nVariaveis);
                iRest++;
                if (source[cont] === ">") { //pega a relacao
                    relacoes.push(">=");
                    cont += 2;
                } else if (source[cont] === "<") {
                    relacoes.push("<=");
                    cont += 2;
                } else if (source[cont] === "=") {
                    relacoes.push("=");
                    cont++;
                } else {
                    throw "Sentido da expressão inexistente"
                }
                var ld = "";
                cont++;
                while (source[cont] !== "|") { //pega o lado direito
                    ld += source[cont];
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }

                rhs.push(ld);
                cont += 2;
                if (source[cont + 2] === "\n") { //se tiver acabado restriÃ§oes pula pro proximo p
                    p++;
                } else { //se nao tiver pula pra proxima linha
                    cont++;
                }
            }
            if (p === 4) { //pega lower
                while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9") {
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }
                linha = "";
                while (source[cont] !== "\n") { //pega a linha com os minimos
                    linha += source[cont];
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }
                var lw = linha.split("|", nVariaveis); //separa valores
                for (i = 0; i < nVariaveis; i++) {
                    lower.push(lw[i]);
                }
                p++;
                cont += 3;
            }
            if (p === 5) {//pega uppers
                linha = "";
                var cb = 0;
                while (source[cont] !== "\n" && cb < nVariaveis) { //vai ate a linha
                    linha += source[cont];
                    if (source[cont] === "|") {
                        cb++;
                        if (cb === nVariaveis) {
                            break;
                        }

                    }
                    cont++;
                    if (cont > source.length) {
                        break;
                    }
                }
                var up = linha.split("|", nVariaveis); //separa valores

                for (j = 0; j < nVariaveis; j++) {
                    upper.push(up[j]);
                }
                p++;
            }
            if (p === 6) {//termina
                cont = source.length;
            }
        }
    } catch (err) {
        throw "Erro: Modelo no formato incorreto. " + err;
    }

    return {
        problema: problema,
        objetivo: objetivo,
        restricoes: restricoes,
        relacoes: relacoes,
        rhs: rhs,
        upper: upper,
        lower: lower,
        nVariaveis: nVariaveis,
        iRest: iRest
    };
}

// ******************************************* SCRIP AND STYLE DYNAMIC MATHJAX  ********************************************
//Remover script Dinamico
function removeHead(src) {
    $("script[src='" + src + "']").remove();
}

//Função para verificar a existencia de um script
function existeHead(src) {
    var head = $('head');
    head = head.find('script');
    for (i = 0; i < head.length; i++) {
        scriptSrc = head[i].src.split("/");
        srcLocal = src.split("/");
        if (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]) {
            return true;
        }
    }
    return false;
}

//Adiciona script dinamico - modificado para o MathJax
function addHead(src) {
    if (mathCont > 0) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    } else {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        document.getElementsByTagName("head")[0].appendChild(script);
        mathCont++;
    }
}

function removeStyle() {
    $('style').empty();
}

// ***************************************************** PROGRESS BAR ******************************************************
function progressBar(type, percent) {
    //Progress bar
    var $pb = $('#progress-bar');
    $('#rowProgress').show('fast');
    $pb.removeClass();
    $pb.addClass('progress-bar progress-bar-' + type + ' active');
    $pb.width(percent + "%");
}

//Progress Bar
function progressBarFile(type, percent) {
    //Progress bar
    var $pb = $('#progress-barFile');
    $('#rowProgressFile').show('fast');
    $pb.removeClass();
    $pb.addClass('progress-bar progress-bar-' + type + ' active');
    $pb.width(percent + "%");
}


// ***************************************************** SPECIAL KEYS *******************************************************
// Proibe a digitação de letras e simbolos especiais
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 45 && charCode <= 46)
            return true;
        return false;
    }
    return true;
}

function isInfinityKey(evt) {

    var valida = false;
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 45 && charCode <= 46)
            valida = true;
        else
            //inf minuscuto
            if (charCode == 105 || charCode == 110 || charCode == 102)
                valida = true;
            else
                //INF maiusculo
                if (charCode == 70 || charCode == 73 || charCode == 78)
                    valida = true;
                else
                    valida = false;
    }
    else
        valida = true;

    return valida;
}



// *********************************************** FORM PROBLEM HIDE/SHOW ***************************************************
//Mostra os botoes de controle da tabela
function showFormProblema() {
    $('#rowTable').show();
    $('#addRow').show('fast');
    $('#delRow').show('fast');
    $('#executar').show('fast');
    $('#passoAPasso').show('fast');
    $('#salvar').show('fast');
    $('#limpar').show('fast');
}

//Esconde os botoes de controle da tabela
function hideFormProblema() {
    $('#addRow').hide('fast');
    $('#delRow').hide('fast');
    $('#executar').hide('fast');
    $('#passoAPasso').hide('fast');
    $('#salvar').hide('fast');
    $('#limpar').hide('fast');
    $('#esconde').hide('fast');
    $('#proximoPasso').hide('fast');
}

$(document).ready(function() {

    // ***************************************************** FLEX SLIDER *****************************************************
    $('.flexslider').flexslider({
        namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
        selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
        animation: "slide",              //String: Select your animation type, "fade" or "slide"
        easing: "swing",               //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
        direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
        reverse: false,                 //{NEW} Boolean: Reverse the animation direction
        animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
        smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode 
        startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
        slideshow: true,                //Boolean: Animate slider automatically
        slideshowSpeed: 4000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
        animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
        initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
        randomize: false,               //Boolean: Randomize slide order

        // Usability features
        pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
        pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
        useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
        touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
        video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

        // Primary Controls
        controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
        directionNav: false,             //Boolean: Create navigation for previous/next navigation? (true/false)
        prevText: "",           //String: Set the text for the "previous" directionNav item
        nextText: "",               //String: Set the text for the "next" directionNav item

        // Secondary Navigation
        keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
        multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
        mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
        pausePlay: false,               //Boolean: Create pause/play dynamic element
        pauseText: 'Pause',             //String: Set the text for the "pause" pausePlay item
        playText: 'Play',               //String: Set the text for the "play" pausePlay item

        // Special properties
        controlsContainer: "",          //{UPDATED} Selector: USE CLASS SELECTOR. Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be ".flexslider-container". Property is ignored if given element is not found.
        manualControls: "",             //Selector: Declare custom control navigation. Examples would be ".flex-control-nav li" or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
        sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
        asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

        // Carousel Options
        itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
        itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
        minItems: 0,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
        maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
        move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.

        // Callback API
        start: function() { },            //Callback: function(slider) - Fires when the slider loads the first slide
        before: function() { },           //Callback: function(slider) - Fires asynchronously with each slider animation
        after: function() { },            //Callback: function(slider) - Fires after each slider animation completes
        end: function() { },              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
        added: function() { },            //{NEW} Callback: function(slider) - Fires after a slide is added
        removed: function() { }
    });

    // ************************************************** MAIN METRO SLIDER **************************************************
    $('.main-flexslider').flexslider({
        namespace: "main-flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
        selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
        animation: "slide",              //String: Select your animation type, "fade" or "slide"
        easing: "swing",               //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
        direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
        reverse: false,                 //{NEW} Boolean: Reverse the animation direction
        animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
        smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode 
        startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
        slideshow: false,                //Boolean: Animate slider automatically
        slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
        animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
        initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
        randomize: false,               //Boolean: Randomize slide order

        // Usability features
        pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
        pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
        useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
        touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
        video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

        // Primary Controls
        controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
        directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
        prevText: "",           //String: Set the text for the "previous" directionNav item
        nextText: "",               //String: Set the text for the "next" directionNav item

        // Secondary Navigation
        keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
        multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
        mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
        pausePlay: false,               //Boolean: Create pause/play dynamic element
        pauseText: 'Pause',             //String: Set the text for the "pause" pausePlay item
        playText: 'Play',               //String: Set the text for the "play" pausePlay item

        // Special properties
        controlsContainer: "",          //{UPDATED} Selector: USE CLASS SELECTOR. Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be ".flexslider-container". Property is ignored if given element is not found.
        manualControls: "",             //Selector: Declare custom control navigation. Examples would be ".flex-control-nav li" or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
        sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
        asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

        // Carousel Options
        itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
        itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
        minItems: 0,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
        maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
        move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.

        // Callback API
        start: function() { },            //Callback: function(slider) - Fires when the slider loads the first slide
        before: function() { },           //Callback: function(slider) - Fires asynchronously with each slider animation
        after: function() { },            //Callback: function(slider) - Fires after each slider animation completes
        end: function() { },              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
        added: function() { },            //{NEW} Callback: function(slider) - Fires after a slide is added
        removed: function() { }
    });

    // ******************************************************** TABS *********************************************************
    $(".tabs").tabs();

    // ******************************************************* ACORDION ******************************************************
    $(".accordion").accordion({
        collapsible: true,
        active: false
    });

    // ******************************************************** VIDEOS *********************************************************
    $("#content").fitVids();

    // **************************************************** RESPONSIVE NAVS ****************************************************
    var navigation = responsiveNav("#nav", { // Selector: The ID of the wrapper
        animate: true, // Boolean: Use CSS3 transitions, true or false
        transition: 400, // Integer: Speed of the transition, in milliseconds
        label: "", // String: Label for the navigation toggle
        insert: "after", // String: Insert the toggle before or after the navigation
        customToggle: "", // Selector: Specify the ID of a custom toggle
        openPos: "static", // String: Position of the opened nav, relative or static
        jsClass: "js", // String: 'JS enabled' class which is added to <html> el
        init: function() { }, // Function: Init callback
        open: function() { }, // Function: Open callback
        close: function() { } // Function: Close callback
    });

    // ******************************************************** SCROLL *********************************************************
    //Ao rolar a pagina adiciona o botao de voltar ao topo
    $(document).on('scroll', function() {
        if ($(window).scrollTop() > 100)
            $('.scroll-top-wrapper').addClass('show');
        else
            $('.scroll-top-wrapper').removeClass('show');
    });

    //Ao clicar no botao volta para o topo
    $('.scroll-top-wrapper').on('click', function() {
        verticalOffset = typeof (verticalOffset) != 'undefined' ?
            verticalOffset :
            0;
        offset = $('body').offset();
        offsetTop = offset.top;
        $('html, body').animate({ scrollTop: offsetTop }, 500, 'linear');
    });

    // **************************************************** FORM FUNCTION *****************************************************
    //Evita ficar mandando informção(submit)
    $("form").submit(function(event) {
        event.preventDefault();
    });

    // **************************************************** FILE FUNCTION *****************************************************
    

    //Ao clicar no botão file aparecer o caminho
    $(document).on('change', '.btn-file :file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    //Botão file
    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' arquivos selecionados' : label;
        if (input.length) {
            input.val(log);
        } else {
            if (log)
                showAlert("danger", "" + log);
        }
    });

    //Carregar, cria um evento de listener
    var fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function(e) {
        var fileInput = document.getElementById('fileInput');
        var fileDisplayArea = document.getElementById('fileDisplayArea');
        var file = fileInput.files[0];
        var textType = /text.*/;

        $("#rowFileDisplayArea").show("2000");
        if (file.type.match(textType)) {
            reader = new FileReader();

            reader.onload = function(e) {
                fileDisplayArea.innerHTML = reader.result.replace(/\n/g, "<br>");
            }

            // reader.onprogress = function(e) {
            //     var percentUploaded = Math.floor(e.loaded * 100 / e.total);
            //     progressBarFile("success", percentUploaded);
            // }

            $('#analisarFile').prop('disabled', false);
            showAlert("success", "Arquivo carregado com sucesso");
            analisarStyle("success");
            reader.readAsText(file);
        } else {
            analisarStyle("danger");
            // $("#rowProgressFile").hide();
            $('#analisarFile').prop('disabled', true);
            fileDisplayArea.innerHTML = "Arquivo não suportado";
            showAlert("danger", "Erro: Arquivo não suportado");
        }
    });
});

//# sourceURL=features.js
