
////////////////////////////////////////////////////
//                FUNCOES DA TABELA               //
////////////////////////////////////////////////////
Tabela = function() {
    var t = {};

    t.reseta = function() {
        t.nRestri = 0;
        t.nVar = document.getElementById("variaveis").value;
    };

    t.carrega = function(xx) {
        t.reseta();
        $("#myTableData").empty();
        $("#myTableData2").empty();
        t.existe = true;
        t.nRestri = xx["iRest"];
        t.nVar = xx["nVariaveis"];
        t.problema = xx["problema"];
        t.objetivo = xx["objetivo"];
        t.restricoes = xx["restricoes"];
        t.relacoes = xx["relacoes"];
        t.rhs = xx["rhs"];
        t.upper = xx["upper"];
        t.lower = xx["lower"];
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

            row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="text" \
                    class="fObj form-control" onkeypress="return isNumberKey(event)" required  step="any" value="' + t.objetivo[i - 1] + '">';
        row.insertCell().innerHTML = '&nbsp;';
        row.insertCell().innerHTML = '&nbsp;';
        //add restricoes
        if (t.restricoes[0] === "n") {
            showAlert("danger", "Erro: O sistema não possui restrições");
        } else {
            var table = document.getElementById("myTableData");
            if (t.nRestri < 21) {

                for (j = 2; j < (t.nRestri + 2); j++) {

                    var row = table.insertRow(j);
                    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + (j - 1) + '</b>';
                    for (i = 1; i <= t.nVar; i++) {
                        row.insertCell(i).innerHTML = '<input id="x' + (j - 1) + '' + (i - 1) + '" type="text"  \
                    class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any" value="' + t.restricoes[j - 2][i - 1] + '">';
                    }

                    if (t.relacoes[j - 2] === "<=") {
                        row.insertCell().innerHTML = '<select id="relacao' + (j - 1) + '" class="relacao form-control">\
                <option value="<=" selected="selected"><=</option><option>=</option><option>>=</option></select>';
                    } else if (t.relacoes[j - 2] === "=") {
                        row.insertCell().innerHTML = '<select id="relacao' + (j - 1) + '" class="relacao form-control">\
                <option><=</option><option value="=" selected="selected">=</option><option>>=</option></select>';
                    } else if (t.relacoes[j - 2] === ">=") {
                        row.insertCell().innerHTML = '<select id="relacao' + (j - 1) + '" class="relacao form-control">\
                <option><=</option><option>=</option><option value=">=" selected="selected">>=</option></select>';
                    }

                    row.insertCell().innerHTML = '<input id="ladoDir' + (j - 1) + '" type="text" \
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any" value="' + t.rhs[j - 2] + '">';
                }
            } else {
                showAlert('warning', 'Limite máximo de restrições atingido: 20');
            }
        }

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
                    class="limSup form-control" onkeypress="return isInfinityKey(event)" required  step="any" value="' + t.upper[i - 1] + '">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++) {

            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" onkeypress="return isInfinityKey(event)" required  step="any" value="' + t.lower[i - 1] + '">';
        }
    };

    //Cria a tabela base de um novo modelo
    t.novo = function() {
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
            row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="text" \
                    class="fObj form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '&nbsp;';
        row.insertCell().innerHTML = '&nbsp;';
        //Insere primeira restricao
        //t.addRow();

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
                    class="limSup form-control" onkeypress="return isInfinityKey(event)" required value="inf" step="any">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" onkeypress="return isInfinityKey(event)" required value="0" step="any">';
    };

    //Adiciona restricoes ao modelo
    t.addRow = function() {
        if (t.nVar === 10) {
            showAlert('warning', 'Limite máximo de restrições atingido: 20');
            return;
        }

        t.nRestri++;
        var table = document.getElementById("myTableData");
        var row = table.insertRow(t.nRestri + 1);
        row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + t.nRestri + '</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="x' + t.nRestri + '' + (i - 1) + '" type="text"  \
                    class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '<select id="relacao' + t.nRestri + '" class="relacao form-control" \
                style="min-width: 70px;"><option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + t.nRestri + '" type="text" style="min-width: 90px;"\
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    };
	
	t.addVar = function() {
        if (t.nRestri === 20) {
            showAlert('warning', 'Limite máximo de restrições atingido: 20');
            return;
        }

        t.nRestri++;
        var table = document.getElementById("myTableData");
        var row = table.insertRow(t.nRestri + 1);
        row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + t.nRestri + '</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="x' + t.nRestri + '' + (i - 1) + '" type="text"  \
                    class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '<select id="relacao' + t.nRestri + '" class="relacao form-control" \
                style="min-width: 70px;"><option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + t.nRestri + '" type="text" style="min-width: 90px;"\
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    };
    //Remove restricoes do modelo
    t.deleteRow = function() {
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

leituraParametros = function(tipo) {
    /*
     * Le os dados informados na tabela de entrada e deixa no formato utilizado.
     * Parametros: 
     *      tipo = {
     *          1 - SIMPLEX
     *          2 - BRANCHBOUND
     *      }
     */

    var metodo = (tipo == 1) ? document.getElementById("metodo").value : "";
    var problema = document.getElementById("problema").value;
    var objetivo = [];
    var restricoes = [];
    var relacoes = [];
    var rhs = [];
    var upper = [];
    var lower = [];

    //Pegando dados da Tabela
    $(".fObj").each(function() {
        objetivo.push(parseFloat($(this).val()));
    });

    var i = 0;
    var nRest = 0;
    var nVar = objetivo.length;
    restricoes[0] = [];
    $(".xRest").each(function() {
        restricoes[nRest].push(parseFloat($(this).val()));
        i++;
        if (i === nVar) {
            i = 0;
            nRest++;
            restricoes[nRest] = [];
        }
    });
    restricoes.pop();

    $(".relacao").each(function() {
        relacoes.push($(this).val());
    });
    $(".ladoDir").each(function() {
        rhs.push(parseFloat($(this).val()));
    });
    $(".limSup").each(function() {
        upper.push($(this).val());
    });
    $(".limInf").each(function() {
        lower.push(parseFloat($(this).val()));
    });

    return {
        metodo: metodo,
        problema: problema,
        objetivo: objetivo,
        restricoes: restricoes,
        relacoes: relacoes,
        rhs: rhs,
        upper: upper,
        lower: lower
    };

}

verificaTabela = function() {
    var bool = false;
    $(".fObj").each(function() {
        bool = ($(this).val() === '' || $(this).val() === null);
    });
    if (!bool) {
        $(".xRest").each(function() {
            bool = ($(this).val() === '' || $(this).val() === null);
        });
        if (!bool) {
            $(".relacao").each(function() {
                bool = ($(this).val() === '' || $(this).val() === null);
            });
            if (!bool) {
                $(".ladoDir").each(function() {
                    bool = ($(this).val() === '' || $(this).val() === null);
                });
                if (!bool) {
                    $(".limSup").each(function() {
                        bool = ($(this).val() === '' || $(this).val() === null);
                    });
                    if (!bool) {
                        $(".limInf").each(function() {
                            bool = ($(this).val() === '' || $(this).val() === null);
                        });
                    }
                }
            }
        }
    }

    return bool;
}

//# sourceURL=tabelaProblema.js
