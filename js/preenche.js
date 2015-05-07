var controle = -1;
var row;
function deleteRow1() {
    var obj = document.getElementById("myTableData").rows[controle];
    var index = obj.parentNode.parentNode.rowIndex;
    var table = document.getElementById("myTableData");
    if (controle < 1) {
        alert("O problema deve haver pelo menos uma restrição!")
    } else {
        if(controle<=19)
            table.deleteRow(controle + 2);
        if(controle==20)
            table.deleteRow(controle + 1);
        controle--;
    }


}
function addRow1() {
    var qVariaveis = document.getElementById("variaveis");
    controle++;
    if (controle < 20) {
        var table = document.getElementById("myTableData");
        var rowCount = table.rows.length;
        row = table.insertRow(rowCount);
        row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + (controle + 1) + '</b>';
        for (i = 1; i <= qVariaveis.value; i++) {
            row.insertCell(i).innerHTML = '<input id="x' + (controle + 1) + '' + (i - 1) + '" type="number" class="form-control" >';
        }
        row.insertCell().innerHTML = '<select id="relacao' + (controle + 1) + '" class="form-control"><option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + (controle + 1) + '" type="number" class="form-control" >';
    }
    else {
        controle--;
        alert("Estorou limite de Restricoes!")
    }
}
function addRow() {
    var qVariaveis = document.getElementById("variaveis");
    if (controle == -1) {
        var table = document.getElementById("myTableData");
        var rowCount = table.rows.length;
        row = table.insertRow(rowCount);
        row.insertCell(0).innerHTML = '&nbsp;';
        for (i = 1; i <= qVariaveis.value; i++) {
            row.insertCell(i).innerHTML = '<center><b>x' + (i) + '</b></center>';
        }
        row.insertCell().innerHTML = '<center><b>Rela&ccedil;&atilde;o&nbsp;&nbsp;</b></center>';
        row.insertCell().innerHTML = '<center><b>Lado Direito</b></center>';
    }
    controle++;
    //var qVariaveis = document.getElementById("variaveis");
    var table = document.getElementById("myTableData");
    var rowCount = table.rows.length;
    row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML = '<b>Objetivo</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="number" class="form-control">';
    }
    row.insertCell().innerHTML = '&nbsp;';
    row.insertCell().innerHTML = '&nbsp;';
    row = table.insertRow(rowCount + 1);
    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + (controle + 1) + '</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="x' + (controle + 1) + '' + (i - 1) + '" type="number" class="form-control" >';
    }
    row.insertCell().innerHTML = '<select id="relacao' + (controle + 1) + '" class="form-control" style="min-width: 70px;"><option><=</option><option>=</option><option>>=</option></select>';
    row.insertCell().innerHTML = '<input id="ladoDir' + (controle + 1) + '" type="number" class="form-control" style="min-width: 90px;" >';

}
function addRow2() {
    var qVariaveis = document.getElementById("variaveis");
    var table = document.getElementById("myTableData2");
    var rowCount = table.rows.length;
    row = table.insertRow(rowCount);
    row.insertCell(0).innerHTML = '&nbsp;';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<center><b>x' + (i) + '</b></center>';
    }

    var rowCount = table.rows.length;
    row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML = '<b>Limite Superior</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="limiSupx' + (i) + '" type="text" class="form-control">';
    }
    row = table.insertRow(rowCount + 1);
    row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" class="form-control" >';
    }

}
function load() {

    console.log("Prestricoes load finished");
}
$(document).ready(function () {
    $('#add2').hide('fast');
    $('#add1').hide('fast');
    $('#sub1').hide('fast');
    $('#executar').hide('fast');
    $('#limpar').hide('fast');
    $('#excluir1').hide('fast');
    $("#add").click(function () {

        if (controle != -1) {
            bootbox.dialog({
                title: 'Aviso',
                message: '<center><p>Todas as informações serão perdidas.</p></center>' +
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
                            controle = -1;
                            addRow();
                            addRow2();
                            $('#add1').show('fast');
                            $('#sub1').show('fast');
                            $('#executar').show('fast');
                            $('#limpar').show('fast');
                            $('#excluir1').show('fast');
                        }
                    }
                }
            }
        );

        }
        else {
            addRow();
            addRow2();
            $('#add2').show('fast');
            $('#add1').show('fast');
            $('#sub1').show('fast');
            $('#executar').show('fast');
            $('#limpar').show('fast');
            $('#excluir1').show('fast');
        }
    });
});

