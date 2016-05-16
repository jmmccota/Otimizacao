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


function mpl(modelos, local) {

    addHead("js/MathJax/MathJax.js?config=AM_HTMLorMML");
    addHead("js/ASCIIMathML.js");
    //$('#div_mpl').show();
    var mp = document.getElementById(local);
    //mp.innerHTML = "";
    var x;
	if(__global__executando__){
		if(__global__executando__ === "simplex"){
			x = new Simplex();
			x.init(modelos);
		}
		else if(__global__executando__ === "branchbound"){
			x = new Nodo(0, 0, 0, modelos, 0, 0);
		}
	}
    var bodyContent = x.modelo();
    mp.innerHTML = bodyContent;

};



$(document).ready(function () {
	t = Tabela();
    // **************************************************** FORM FUNCTION *****************************************************
    //Evita ficar mandando informção(submit)
    $("form").submit(function (event) {
        event.preventDefault();
    });

    // **************************************************** FILE FUNCTION *****************************************************
    //Ao clicar no botão file aparecer o caminho
    $(document).on('change', '.btn-file :file', function () {
        var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

	$("#novo").click(function() {
        if (t.existe) {
            var nVariaveis = document.getElementById("variaveis").value;
            if (nVariaveis > 1)
                mensagem = "Ser&aacute; criado uma nova tabela com<b> " + nVariaveis + " </b>vari&aacute;veis."
            else
                mensagem = "Ser&aacute; criado uma nova tabela com<b> 1 </b>variável"
            bootbox.dialog({
                title: '<center><b>Aviso</b></center>',
                message: '<center><p>Todas as informa&ccedil;&otilde;es ser&atilde;o perdidas.</p></center>' +
                '<center><p>' + mensagem + '</p></center>' +
                '<center><p>Tem certeza disso? </p></center>',
                buttons: {
                    main: {
                        label: "Cancelar",
                        className: "btn-default"
                    },
                    success: {
                        label: "Sim",
                        className: "btn-success",
                        callback: function() {
                            $("#panelResultado").fadeOut("fast");
                            $("#myTableData").empty();
                            $("#myTableData2").empty();
                            t.novo();
                            showAlert('success', 'Nova tabela gerada. ' + nVariaveis + ' vari&aacute;veis criadas');
                        }
                    }
                }
            });
        }
        //Cria nova tabela
        else
            t.novo();
        showFormProblema();
    });
    
    //Botão file
    $('.btn-file :file').on('fileselect', function (event, numFiles, label) {

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

    fileInput.addEventListener('change', function (e) {
        var fileInput = document.getElementById('fileInput');
        var fileDisplayArea = document.getElementById('fileDisplayArea');
        var file = fileInput.files[0];
        var textType = /text.*/;

        $("#rowFileDisplayArea").show("2000");
        if (file.type.match(textType)) {
            reader = new FileReader();

            reader.onload = function (e) {
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

            reader.onload = function (evt) {
				mpl(analisarFile(),"fileDisplayArea");
            };

        } else {
            analisarStyle("danger");
            // $("#rowProgressFile").hide();
            $('#analisarFile').prop('disabled', true);
            fileDisplayArea.innerHTML = "Arquivo não suportado";
            showAlert("danger", "Erro: Arquivo não suportado");
        }
    }, false);

});

//# sourceURL=features.js
