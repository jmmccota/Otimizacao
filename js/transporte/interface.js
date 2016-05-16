
////////////////////////////////////////////////////
//           FUNCOES DA TABELA TRANSPORTE         //
////////////////////////////////////////////////////

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

	
	function analisarFile() {
		try {
			var source = "";
			var restricoes = [];
			var nVariaveis = 0;
			source = reader.result;
			var linha = 1;
			var cont = 0;
			var p = 0; //qual parte
			while (cont < source.length) {
				linha = "";
				while(cont < source.length && source[cont] != "\n"){
					linha += source[cont];
					cont++;
				}
				nVariaveis = 0;
				for (i = 0; i < linha.length; i++) { //o numero de | Ã© o numero de variaveis
                    if (linha[i] === "|") {
                        nVariaveis++;
                    }
                }
				restricoes[p] = linha.split("|",nVariaveis);
				p++;
				cont++;
			}
			//console.log(restricoes);
		} catch (err) {
			throw "Erro: Modelo no formato incorreto. " + err;
		}
		return {
			restricoes: restricoes,
			nVariaveis: (nVariaveis+1),
			iRest : (p+1)
		};
	}
	
	
    //Analisar arquivo
    $('#analisarFile').click(function () {
        try {
            if (reader.result != null) {
                t.reseta();
                showFormProblema();
                var problema = analisarFile();
                
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
