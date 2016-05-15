
////////////////////////////////////////////////////
//           FUNCOES DA TABELA TRANSPORTE         //
////////////////////////////////////////////////////
TransporteTable = function () {

    $("#result").empty();
    //$("#resultInfo").empty();

    this.reseta = function (cont) {
        $("#myTableResult" + cont).empty();
    };

    this.drawTable = function (result) {

        for (var nIteracao = 0; nIteracao < result.length; nIteracao++) {
            //Cria MytableResult
            $('#result').append(
                '<div class="row panel panel-default" tabindex="-1" style="overflow:auto;" id="styleScroll">' +
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
            row.insertCell(0).innerHTML = '<center><b></b></center>';
            for (var i = 1; i < result[nIteracao][0].length; i++) {
                row.insertCell(i).innerHTML = '<center><b>Coluna ' + i + '</b></center>';
            }
            row.insertCell().innerHTML = '<center><b>Suprimento</b></center>';

            //Elemento pivo
            var pivo = ((nIteracao != result.length - 1) ? solver.pivo(nIteracao) : '');

            //Valores de cada Iteração
            for (var i = 0; i < result[nIteracao].length; i++) {
                row = this.tableObj.insertRow(i + 1);
                if (i < result[nIteracao].length-1) {
                    row.insertCell(0).innerHTML = '<p class="simplex"><b>Linha ' + (i+1) + '</b></p>';
                }
                else{
                    row.insertCell(0).innerHTML = '<p class="simplex"><b>Demanda</b></p>';
                }
                for (var j = 0; j < result[nIteracao][0].length; j++) {
                    var cell = row.insertCell(j + 1);
                    if(j < result[nIteracao][0].length - 1 && i < result[nIteracao].length - 1){
                        cell.innerHTML = '<p class="simplex"> Custo: ' + ("" + (+result[nIteracao][i][j].custo.toFixed(4))).replace('.', ',') +
                        " x Quantidade: " + ("" + (+result[nIteracao][i][j].qtd.toFixed(4))).replace('.', ',') + '</p>';
                    }
                    else if (!(j === result[nIteracao][0].length - 1 && i === result[nIteracao].length - 1)){
                        cell.innerHTML = '<p class="simplex">' + ("" + (+result[nIteracao][i][j].toFixed(4))).replace('.', ',') + '</p>';
                    }
                    if (nIteracao < result.length - 1 && result[nIteracao][0].length <= result[nIteracao + 1][0].length) {
                        cell.className = (pivo[0] == j) ? 'pivo' : '';
                    }
                }
            }
        }
    };
    
    return this;
}

////////////////////////////////////////////////////
//               FUNCOES DE INTERFACE             //
////////////////////////////////////////////////////
$(document).ready(function () {
    //Por padrao os botoes estao escondidos

    hideFormProblema();
    t = Tabela();

    //Adiciona Restricao
    $('#addRow').click(function () {
        t.addRow();
    });

    //Apaga restricao
    $('#delRow').click(function () {
        if (t.nRestri == 0)
            showAlert("warning", "Não há mais restrições para excluir!");
        else
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
    $('#salvar').click(function () {
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

                var blob = new Blob([source], { type: "application/octet-stream;charset=utf-8" });
                saveAs(blob, "modelo.txt");
            }
        } catch (err) {
            showAlert("danger", "Biblioteca 'FileSaver.js' não encontrada. " + err);
        }
    });

    //Executar Branch and Bound
    $('#executar').click(function () {
        $('#proximoPasso').hide('fast');
        if (!verificaTabela()) {
            try {
                solver = new Transporte();
                table = TransporteTable();
                var x = leituraParametros();
                solver.init(x);
                var res = solver.executa();
                table.drawTable(res);
                $("#panelResultado").show();
            }
            catch (err) {
                showAlert("danger", "" + err);
            }
        }
    });

    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function () {
        try {
        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Define botao para proximo passo
    $('#proximoPasso').click(function () {
        try {

        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Analisar arquivo
    $('#analisarFile').click(function () {
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
    $("#addCol").click(function (evt) {
        t.addCol();
    });
    $("#delCol").click(function (evt) {
        t.deleteCol();
    });
});

//# sourceURL=interfaceTransporte.js
