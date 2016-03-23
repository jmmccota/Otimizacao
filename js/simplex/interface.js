////////////////////////////////////////////////////
//         FUNCOES DA TABELA DE RESULTADO         //
////////////////////////////////////////////////////
SimplexTable = function() {

    this.reseta = function() {
        $("#myTableResult").empty();
    };

    this.draw = function(result, interacao) {
        this.tableObj = document.getElementById("myTableResult");
        this.reseta();

        if (interacao === "all") {

        }
        else if (interacao === "last") {
            var row = this.tableObj.insertRow(0);

            var lastIt = result.length - 1;

            //Cabeçalho
            for (var i = 1; i < result[lastIt][0].length; i++) {
                row.insertCell(i - 1).innerHTML = '<center><b>x' + i + '</b></center>';
            }
            row.insertCell().innerHTML = '<center><b>Resultado</b></center>';

            //Valores
            for (var i = 0; i < result[lastIt].length; i++) {
                row = this.tableObj.insertRow(i + 1);
                for (var j = 0; j < result[lastIt][0].length; j++) {
                    row.insertCell(j).innerHTML = '<p class="simplex">' + result[lastIt][i][j].toFixed(4) + '</p>';
                }
            }
        }
    };

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
            var x = t.leituraParametros();
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
                var simplex = new Simplex();
                var modelo = leituraParametros(1);

                simplex.init(modelo);
                var temp = simplex.executa();
                simplexTable.draw(temp, "last");

                $("html, body").animate({ scrollTop: $(document).height() - 385 }, 1500);
                $("#panelResultado").show();



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

    //Analisar arquivo
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
