
var simplex = null;
////////////////////////////////////////////////////
//         FUNCOES DA TABELA DE RESULTADO         //
////////////////////////////////////////////////////
SimplexTable = function() {

    this.reseta = function(cont) {
        $("#myTableResult" + cont).empty();
    };


    this.drawTable = function(result) {

        $("#result").empty();
        $("#resultInfo").empty();

        for (var nIteracao = 0; nIteracao < result.length; nIteracao++) {

            //Cria MytableResult
            $('#result').append(
                '<div class="row panel panel-default" tabindex="-1">' +
                '   <div class="panel-heading"> ' +
                '      <h3 class="panel-title" id="panel-title"><label>Iteração ' + ((nIteracao === 0) ? 'Inicial' : nIteracao) + '</label></h3>' +
                '   </div>' +
                '   <div class="panel-body" style="padding: 0;">' +
                '      <table id="myTableResult' + nIteracao + '" class="table table-condensed"></table>' +
                '   </div>' +
                '</div>');

            this.tableObj = document.getElementById("myTableResult" + nIteracao);
            this.reseta(nIteracao);

            var row = this.tableObj.insertRow(0);

            //Cabeçalho
            row.insertCell(0).innerHTML = '<center><b>Base</b></center>';
            for (var i = 1; i < result[nIteracao][0].length; i++) {
                row.insertCell(i).innerHTML = '<center><b>x' + i + '</b></center>';
            }
            row.insertCell().innerHTML = '<center><b>Resultado</b></center>';

            //Elemento pivo
            var pivo = ((nIteracao != result.length - 1) ? simplex.pivo(nIteracao) : '');

            var base = simplex.base(nIteracao);

            //Valores de cada Iteração
            for (var i = 0; i < result[nIteracao].length; i++) {
                row = this.tableObj.insertRow(i + 1);
                //Se for ultima iteracao fase 1 do duas fases nao mostra o pivo 
                if(nIteracao < result.length-1 &&
                   result[nIteracao][0].length <= result[nIteracao+1][0].length)
                    row.className = (pivo[1] == i) ? 'pivo' : '';
                var cell = row.insertCell(0);
                if(i == 0)
                    cell.innerHTML = '<p class="simplex">z</p>';
                else
                    cell.innerHTML = '<p class="simplex">x' + ((+base[i])+1) + '</p>';
                for (var j = 0; j < result[nIteracao][0].length; j++) {
                    var cell = row.insertCell(j+1);
                    cell.innerHTML = '<p class="simplex">' + ("" + (+result[nIteracao][i][j].toFixed(4))).replace('.', ',') + '</p>';
                    if(nIteracao < result.length-1 &&
                       result[nIteracao][0].length <= result[nIteracao+1][0].length)
                        cell.className = (pivo[0] == j) ? 'pivo' : '';
                }
            }
        }
        /*
        //Mostra tipo de solução e valor de Z
        var z = simplex.resultado(result.length - 1);
        $("resultInfo").append(
            '<div class="numeral-info-box one-third">' +
            '   <span class="numeral-info-number" id="valorZ">' + z["FuncaoObjetivo"] + '</span>' +
            '   <span class="numeral-info-description" id="tipoSolucao">' + z["TipoResultado"] + '</span>' +
            '</div>');
        */
    };
/*
    this.drawTable = function(result, nIteracao) {

    }
*/
    return this;
}

////////////////////////////////////////////////////
//               FUNCOES DE INTERFACE             //
////////////////////////////////////////////////////
$(document).ready(function() {
    //Por padrao os botoes estao escondidos

    hideFormProblema();
    t = Tabela();

    //Novo problema de otimizacao
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

    //Adiciona Restricao
    $('#addRow').click(function() {
        t.addRow();
    });

    //Apaga restricao
    $('#delRow').click(function() {
        if (t.nRestri == 0)
            showAlert("warning", "Não há mais restrições para excluir!");
        else
            t.deleteRow();
    });

    //Limpa os dados do modelo
    $("#limpar").click(function() {
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
                    callback: function() {
                        $("#panelResultado").fadeOut("fast");
                        $("#myTableData").empty();
                        $("#myTableData2").empty();
                        t.novo();
                        showAlert('success', 'Limpeza realizada com Sucesso');
                    }
                }
            }
        });
    });

    //Salva em arquivo
    $('#salvar').click(function() {
        try {
            var source = "";
            var x = leituraParametros(2);
            if (!verificaTabela()) {
                source = x['problema'] + '\r\n\r\n';
                for (var i = 0; i < x.objetivo.length; i++) {
                    //                    source += x['objetivo'][i] >= 0 ? "+" : "";
                    source += x['objetivo'][i] + "|";
                }
                source += "\r\n\r\n";
                if (x['restricoes'].length > 0) {
                    for (i = 0; i < x['restricoes'].length; i++) {
                        for (var j = 0; j < x['objetivo'].length; j++) {
                            //                        source += (x['restricoes'][i][j] >= 0) ? "+" : "";
                            source += x['restricoes'][i][j] + "|";
                        }
                        source += x['relacoes'][i] + "|" + x['rhs'][i] + "|";
                        source += "\r\n";
                    }
                } else { // caso não tenha restricao
                    source += "nr\r\n";
                }

                source += "\r\n";
                for (i = 0; i < x['objetivo'].length; i++) {
                    source += x['lower'][i] + '|';
                }
                source += "\r\n\r\n";
                for (i = 0; i < x['objetivo'].length; i++) {
                    source += x['upper'][i] + '|';
                }
                source += "\r\n\r\n";
                //alert(source);
                var blob = new Blob([source], { type: "application/octet-stream;charset=utf-8" });
                saveAs(blob, "modelo.txt");
            }
        } catch (err) {
            showAlert("danger", "Biblioteca 'FileSaver.js' não encontrada. " + err);
        }
    });

    //Executar Simplex
    $('#executar').click(function() {
        $('#proximoPasso').hide('fast');
        if (!verificaTabela()) {
            try {
                var simplexTable = new SimplexTable();
                simplex = new Simplex();
                var modelo = leituraParametros(1);

                $("#panelResultado").show();

                simplex.init(modelo);
                var temp = simplex.executa();
                simplexTable.drawTable(temp);

                $("html, body").animate({ scrollTop: $(document).height() - 385 }, 1500);
            }
            catch (err) {
                showAlert("danger", "" + err);
            }
        }
    });

    //Executar Simplex Passo a Passo
    $('#passoAPasso').click(function() {
        if (!verificaTabela()) {
            $("#proximoPasso").prop('disabled', false);
            $('#proximoPasso').show('fast');
        }
    });

    //Define botao para proximo passo
    $('#proximoPasso').click(function() {

    });

    $('#analisarFile').click(function() {
        try {
            if (reader.result != null) {
                t.reseta();
                showFormProblema();
                var problema = analisarFile();
                var c = document.getElementById("problema");
                for (var i = 0; i < c.options.length; i++) {
                    if (c.options[i].value === problema["problema"]) {
                        c.options[i].selected = true;
                        break;
                    }
                }
                var d = document.getElementById("variaveis");
                for (var k = 1; k <= d.options.length; k++) {
                    if (k === problema["nVariaveis"]) {
                        d.options[k - 1].selected = true;
                        break;
                    }
                }

                t.carrega(problema);
                showAlert("success", "Arquivo analisado com sucesso");

            } else
                throw "Não foi possível analisar o arquivo";
        } catch (err) {
            showAlert("danger", "Erro: " + err);
        }
    });
});

//# sourceURL=interfaceSimplex.js
