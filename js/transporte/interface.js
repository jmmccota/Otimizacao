
////////////////////////////////////////////////////
//           FUNCOES DA TABELA TRANSPORTE         //
////////////////////////////////////////////////////
TransporteTable = function () {

    $("#result").empty();
    //$("#resultInfo").empty();

    this.reseta = function (cont) {
        $("#myTableResult" + cont).empty();
    };

    this.drawTableStep = function (result, nIteracao) {

        $('#result').append(
            '<div class="row panel panel-default" tabindex="-1" style="overflow:auto;" id="styleScroll">' +
            '   <div class="panel-heading"> ' +
            '      <h3 class="panel-title" id="panel-title" style="display: inline;"><label>' + ((nIteracao === 0) ? 'Iteração Inicial' : ((nIteracao === result.length - 1) ? 'Resultado' : 'Iteração ' + nIteracao)) + '</label></h3>' +
            '                                              <div style="float:right;"> <i style="text-align: right; font-weight:700;"> Custo Total: ' + solver.custo(nIteracao) + ' </i></div>' +
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
            var cell = row.insertCell(i);
            cell.innerHTML = '<center><b>Destino ' + i + '</b></center>';
            cell.className = "transpcell-destino"
        }
        var cell = row.insertCell(i);
        cell.innerHTML = '<center><b>Suprimento</b></center>';
        cell.className = "transpcell-suprimento"

        //Elemento pivo
        var pivo = ((nIteracao != result.length - 1) ? solver.pivo(nIteracao) : '');

        //Valores de cada Iteração
        for (var i = 0; i < result[nIteracao].length; i++) {
            row = this.tableObj.insertRow(i + 1);
            //if (nIteracao > 0) {
            row.className = (pivo.i == i) ? 'pivoT' : '';
            //}
            if (i < result[nIteracao].length - 1) {
                row.insertCell(0).innerHTML = '<p class="transpcell-origem"><b>Origem ' + (i + 1) + '</b></p>';
            }
            else {
                row.insertCell(0).innerHTML = '<p class="transpcell-demanda"><b>Demanda</b></p>';
            }
            for (var j = 0; j < result[nIteracao][0].length; j++) {
                var cell = row.insertCell(j + 1);
                if (j < result[nIteracao][0].length - 1 && i < result[nIteracao].length - 1) {
                    cell.innerHTML = '<p id="' + (i) + "_" + (j) + '"class="transpcell"> Custo: ' + ("" + (+result[nIteracao][i][j].custo.toFixed(4))).replace('.', ',') +
                        " x Quantidade: " + ("" + (+result[nIteracao][i][j].qtd.toFixed(4))).replace('.', ',') + '</p>';
                }
                else if (!(j === result[nIteracao][0].length - 1 && i === result[nIteracao].length - 1)) {
                    cell.innerHTML = '<p class="transpcell-suprimento">' + ("" + (+result[nIteracao][i][j].toFixed(4))).replace('.', ',') + '</p>';
                }
                if (nIteracao < result.length - 1 && result[nIteracao][0].length <= result[nIteracao + 1][0].length) {
                    cell.className = (pivo.j == j) ? 'pivoT' : '';
                }
                if (result[nIteracao][i][j] && result.length - 1 == nIteracao && result[nIteracao][i][j].qtd !== 0 && i < result[nIteracao].length - 1 && j < result[nIteracao][i].length - 1) {
                    cell.className = 'selecionado';
                }
            }

        }
    };

    this.drawTable = function (result, drawLastIteration = true) {
        $("#result").empty();

        for (var nIteracao = 0; nIteracao < ((drawLastIteration) ? result.length : result.length - 1); nIteracao++) {
            //Cria MytableResult
            $('#result').append(
                '<div class="row panel panel-default" tabindex="-1" style="overflow:auto;" id="styleScroll">' +
                '   <div class="panel-heading"> ' +
                '      <h3 class="panel-title" id="panel-title" style="display: inline;"><label>' + ((nIteracao === 0) ? 'Iteração Inicial' : ((nIteracao === result.length - 1) ? 'Resultado' : 'Iteração ' + nIteracao)) + '</label></h3>' +
                '                                              <div style="float:right;"> <i style="text-align: right; font-weight:700;"> Custo Total: ' + solver.custo(nIteracao) + ' </i></div>' +
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
                var cell = row.insertCell(i);
                cell.innerHTML = '<center><b>Destino ' + i + '</b></center>';
                cell.className = "transporte"
            }
            var cell = row.insertCell(i);
            cell.innerHTML = '<center><b>Suprimento</b></center>';
            cell.className = "transporte"

            //Elemento pivo
            var pivo = ((nIteracao != result.length - 1) ? solver.pivo(nIteracao) : '');

            //Valores de cada Iteração
            for (var i = 0; i < result[nIteracao].length; i++) {
                row = this.tableObj.insertRow(i + 1);
                //if (nIteracao > 0) {
                row.className = (pivo.i == i) ? 'pivoT' : '';
                //}
                if (i < result[nIteracao].length - 1) {
                    row.insertCell(0).innerHTML = '<p class="transporte"><b>Origem ' + (i + 1) + '</b></p>';
                }
                else {
                    row.insertCell(0).innerHTML = '<p class="transporte"><b>Demanda</b></p>';
                }
                for (var j = 0; j < result[nIteracao][0].length; j++) {
                    var cell = row.insertCell(j + 1);
                    if (j < result[nIteracao][0].length - 1 && i < result[nIteracao].length - 1) {
                        cell.innerHTML = '<p class="transporte"> Custo: ' + ("" + (+result[nIteracao][i][j].custo.toFixed(4))).replace('.', ',') +
                            " x Quantidade: " + ("" + (+result[nIteracao][i][j].qtd.toFixed(4))).replace('.', ',') + '</p>';
                    }
                    else if (!(j === result[nIteracao][0].length - 1 && i === result[nIteracao].length - 1)) {
                        cell.innerHTML = '<p class="transporte">' + ("" + (+result[nIteracao][i][j].toFixed(4))).replace('.', ',') + '</p>';
                    }
                    if (nIteracao < result.length - 1 && result[nIteracao][0].length <= result[nIteracao + 1][0].length) {
                        cell.className = (pivo.j == j) ? 'pivoT' : '';
                    }
                    if (result[nIteracao][i][j] && result.length - 1 == nIteracao && result[nIteracao][i][j].qtd !== 0 && i < result[nIteracao].length - 1 && j < result[nIteracao][i].length - 1) {
                        cell.className = 'selecionado';
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

    //Executar Transporte
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

                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            }
            catch (err) {
                showAlert("danger", "" + err);
            }
        }
    });

    //Executar Transporte Passo a Passo
    $('#passoAPasso').click(function () {
        try {
            if (!verificaTabela()) {
                table = TransporteTable();
                solver = new Transporte();
                var modelo = leituraParametros();

                solver.init(modelo);
                table.drawTableStep(solver.iteracoes, 0);

                $("#panelResultado").show();
                $("#proximoPasso").prop('disabled', false);
                $('#proximoPasso').show('fast');
                $('#rowObsProximoPasso').show('fast');
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            }
        } catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Define botao para proximo passo
    $('#proximoPasso').click(function () {
        try {
            delete table;
            table = new TransporteTable();
            res = solver.proximoPasso();

            table.drawTable(res);
            $("html, body").animate({ scrollTop: $(document).height() }, 1000);

            if (solver.terminou()) {
                //$("#proximoPasso").prop('disabled', true);
                $("#proximoPasso").hide();
            }
        } catch (err) {
            showAlert("danger", "" + err);
        }
    });

    $('.transpcell').live('click', function () {
        try {
            var id = $(this).attr('id').split('_');
            var i = id[0];
            var j = id[1];

            if (solver.terminou()) {
                var temp = solver.iteracao(i, j);
                $("#proximoPasso").hide();
                table.drawTable(temp, true);
            } else {
                // true  :: desenha todas iterações
                // false :: desenha iterações-1
                var temp = solver.iteracao(i, j);
                table.drawTable(temp, false);
                table.drawTableStep(temp, temp.length - 1)
            }

            $("html, body").animate({ scrollTop: $(document).height() }, 1000);

        } catch (err) {
            showAlert("danger", "" + err);
        }
    });

    //Analisar arquivo
    $('#analisarFile').click(function () {
        try {
            if (reader.result != null) {
                t.reseta();
                showFormProblema();
                var problema = analisarFile();

                var d = document.getElementById("variaveis");
                d.value = problema["nVariaveis"] - 1;

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
