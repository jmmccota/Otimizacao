Tabela = function () {
    var t = {};

    t.reseta = function (){
        t.nRestri = 0;
        t.nVar = document.getElementById("variaveis").value;
    };

    //Cria a tabela base de um novo modelo
    t.novo = function () {
        
        t.reseta();
        
        t.existe = true;

        //Cabecalho
        var table = document.getElementById("myTableData");
        var row = table.insertRow(0);
        row.insertCell(0).innerHTML = '&nbsp;';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<center><b>x' + (i) + '</b></center>';
        row.insertCell().innerHTML = '<center><b>Rela&ccedil;&atilde;o&nbsp;&nbsp;</b></center>';
        row.insertCell().innerHTML = '<center><b>Lado Direito</b></center>';

        //Funcao Objetivo
        row = table.insertRow(1);
        row.insertCell(0).innerHTML = '<b>Objetivo</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="number" \
                    class="fObj form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '&nbsp;';
        row.insertCell().innerHTML = '&nbsp;';

        //Insere primeira restricao
        t.addRow();

        //Limite superior e inferior
        var table = document.getElementById("myTableData2");
        var rowCount = table.rows.length;
        row = table.insertRow(rowCount);
        row.insertCell(0).innerHTML = '&nbsp;';
        for (i = 1; i <= t.nVar; i++) {
            row.insertCell(i).innerHTML = '<center><b>x' + (i) + '</b></center>';
        }
        var rowCount = table.rows.length;
        row = table.insertRow(rowCount);
        row.insertCell(0).innerHTML = '<b>Limite Superior</b>';
        for (i = 1; i <= t.nVar; i++) {
            row.insertCell(i).innerHTML = '<input id="limiSupx' + (i) + '" type="text" \
                    class="limSup form-control" required  step="any">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" required  step="any">';
    };

    //Adiciona restricoes ao modelo
    t.addRow = function () {
        if (t.nRestri == 20) {
            showAlert('warning', 'Limite máximo de restrições atingido: 20!');
            return;
        }
        
        t.nRestri++;
        
        var table = document.getElementById("myTableData");
        var row = table.insertRow(t.nRestri + 1);
        row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + t.nRestri + '</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="x' + t.nRestri + '' + (i - 1) + '" type="number"  \
                    class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '<select id="relacao' + t.nRestri + '" class="relacao form-control">\
                <option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + t.nRestri + '" type="number" \
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    };

    //Remove restricoes do modelo
    t.deleteRow = function () {
        var obj = document.getElementById("myTableData").rows[t.nRestri];
        var index = obj.parentNode.parentNode.rowIndex;
        var table = document.getElementById("myTableData");
        if (t.nRestri > 0) {
            t.nRestri--;
            table.deleteRow(t.nRestri + 2);
        }
    };
    
    t.existe = false;
    
    return t;
};

$(document).ready(function () {

    //Por padrao os botoes estao escondidos
    hideFormProblema();
    t = Tabela();

    //Novo problema de otimizacao
    $("#novo").click(function () {

        //se ja tem algum modelo aberto
        if (t.existe) {
            var nVariaveis = document.getElementById("variaveis").value;
            bootbox.dialog({
                title: '<center><b>Aviso</b></center>',
                message: '<center><p>Todas as informa&ccedil;&otilde;es ser&atilde;o perdidas.</p></center>' +
                        '<center><p>Ser&aacute; criado uma nova tabela com<b> ' + nVariaveis + ' </b>vari&aacute;veis</p></center>' +
                        '<center><p>Tem certeza disso? </p></center>',
                buttons: {
                    main: {
                        label: "Cancelar",
                        className: "btn-default",
                    },
                    success: {
                        label: "Sim",
                        className: "btn-success",
                        callback: function () {
                            $("#myTableData").empty();
                            $("#myTableData2").empty();
                            t.novo();
                            showAlert('success', 'Nova tabela gerada com sucesso! ' + nVariaveis + ' vari&aacute;veis criadas.');
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

    //Adiciona Restricao
    $('#addRow').click(function (){
        t.addRow();
    });
    
    //Apaga restricao
    $('#delRow').click(function (){
        t.deleteRow();
    });

    //Limpa os dados do modelo
    $("#limpar").click(function () {
        bootbox.dialog({
            title: '<center><b>Aviso</b></center>',
            message: '<center><p>Todas as informa&ccedil;&otilde;es ser&atilde;o perdidas.</p></center>' +
                    '<center><p>Tem certeza disso? </p></center>',
            buttons: {
                main: {
                    label: "Cancelar",
                    className: "btn-default",
                },
                success: {
                    label: "Sim",
                    className: "btn-success",
                    callback: function () {
                        $("#myTableData").empty();
                        $("#myTableData2").empty();
                        t.novo();
                        showAlert('success', 'Limpeza realizada com Sucesso!')
                    }
                }
            }
        });
    });
    
    //Salva em arquivo
    $('#salvar').click(function (){
        
    });
    
    //Carrega de arquivo
    $('#carregar').click(function (){
        
    });
    
    //Executar Branch and Bound
    $('#executar').click(function (){
        b = BranchBound();
        
        while(!b.terminou()){
            nodo = b.executar();
            //funcao de desenhar
        }
        
        otimo = b.melhorSolucao();
        //faz alguma coisa com o otimo
    });
    
    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function (){
        b = BranchBound();
        
        while(!b.terminou()){
            nodo = b.proximoPasso(function (){
                //funcao que retorna o indice do x que o usuario escolheu
            });
            //funcao de desenhar
        }
        
        otimo = b.melhorSolucao();
        //faz alguma coisa com o otimo
    });

    //Ao rolar a pagina adiciona o botao de voltar ao topo
    $(document).on('scroll', function () {
        if ($(window).scrollTop() > 100)
            $('.scroll-top-wrapper').addClass('show');
        else
            $('.scroll-top-wrapper').removeClass('show');
    });

    //Ao clicar no botao volta para o topo
    $('.scroll-top-wrapper').on('click', function () {
        verticalOffset = typeof (verticalOffset) != 'undefined' ?
                verticalOffset :
                0;
        offset = $('body').offset();
        offsetTop = offset.top;
        $('html, body').animate({scrollTop: offsetTop}, 500, 'linear');
    });
});

// ??????????
function fileUpload(arq) {
    var string = "";
    //o parametro arq é o endereço do txt
    //carrega o txt
    var arquivo = dados.OpenTextFile(arq, 1, true);
    //varre o arquivo
    while (!arquivo.AtEndOfStream) {
        string += arquivo.ReadAll();
    }
    //fecha o txt
    arquivo.Close();
}

// ??????????
window.onload = function () {
    var col;
    var row;
    var source = "";
    var fileInput = document.getElementById('exampleInputFile');
    fileInput.addEventListener('change', function (e) {
        var file = fileInput.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function (e) {
                source = reader.result;
                alert(source);
                var lp = glp_create_prob();
                glp_read_lp_from_string(lp, null, source);
                row = glp_get_num_rows(lp);
                col = glp_get_num_cols(lp);
                run(source);
            };

            reader.readAsText(file);

        } else {
            alert("Erro no Carregamento");
        }
    });
    //document.getElementById('start#sectionA').click();
};

////////////////////////////////////////////////////
//                FUNCOES AUXILIARES              //
////////////////////////////////////////////////////

// ??????????
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 44 && charCode <= 46)
            return true;
        return false;
    }
    return true;
}

//Cria um alert bootstrap
function showAlert(type, message) {
    $('#alert').removeClass();
    $('#alert').addClass('alert alert-' + type).html(message).fadeIn();
    window.setTimeout(closeAlert, 3000);
}
//Apaga um alert bootstrap
function closeAlert() {
    $('#alert').fadeOut();
}

//Mostra os botoes de controle da tabela
function showFormProblema() {
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
}
