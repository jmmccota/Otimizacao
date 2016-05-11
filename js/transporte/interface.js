
////////////////////////////////////////////////////
//           FUNCOES DA TABELA TRANSPORTE         //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
//               FUNCOES DE INTERFACE             //
////////////////////////////////////////////////////
$(document).ready(function() {
    //Por padrao os botoes estao escondidos

    hideFormProblema();
    t = Tabela();

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
            var x = leituraParametros();
            if (!verificaTabela()) {
                var problema = x['problema'];

                for (var i = 0; i < problema.length; i++) {
                    for (j = 0; j < problema[i].length; j++) {
                        source += problema[i][j] + "|";
                    }
                    source += "\r\n";
                }

                //alert(source);
                var blob = new Blob([source], { type: "application/octet-stream;charset=utf-8" });
                saveAs(blob, "modelo.txt");
            }
        } catch (err) {
            showAlert("danger", "Biblioteca 'FileSaver.js' não encontrada. " + err);
        }
    });

    //Executar Branch and Bound
    $('#executar').click(function() {
        $('#proximoPasso').hide('fast');
        if (!verificaTabela()) {
            try {

            }
            catch (err) {
                showAlert("danger", "" + err);
            }
        }
    });

    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function() {
        try {
        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Define botao para proximo passo
    $('#proximoPasso').click(function() {
        try {

        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Analisar arquivo
    $('#analisarFile').click(function() {
        throw "Not Implemented Yet!";
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
                $('#ui-id-1').click();
                showAlert("success", "Arquivo analisado com sucesso");

            } else
                throw "Não foi possível analisar o arquivo";
        } catch (err) {
            showAlert("danger", "Erro: " + err);
        }

    });
    $("#addCol").click(function(evt) {
        t.addCol();
    });
    $("#delCol").click(function(evt) {
        t.deleteCol();
    });
});

//# sourceURL=interfaceTransporte.js
