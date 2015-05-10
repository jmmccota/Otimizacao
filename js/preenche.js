var controle = -1;
var row;
function deleteRow1() {
    var obj = document.getElementById("myTableData").rows[controle];
    var index = obj.parentNode.parentNode.rowIndex;
    var table = document.getElementById("myTableData");
    if (controle < 1) {
        showAlert('warning', 'O problema deve haver pelo menos uma restrição!')
    } else {
        table.deleteRow(controle + 2);
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
            row.insertCell(i).innerHTML = '<input id="x' + (controle + 1) + '' + (i - 1) + '" type="number"  class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        }
        row.insertCell().innerHTML = '<select id="relacao' + (controle + 1) + '" class="relacao form-control"><option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + (controle + 1) + '" type="number" class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    }
    else {
        controle--;
        showAlert('warning', 'Limite máximo de restrições atingido: 20!')
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
    var table = document.getElementById("myTableData");
    var rowCount = table.rows.length;
    row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML = '<b>Objetivo</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="number" class="fObj form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    }
    row.insertCell().innerHTML = '&nbsp;';
    row.insertCell().innerHTML = '&nbsp;';
    row = table.insertRow(rowCount + 1);
    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + (controle + 1) + '</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="x' + (controle + 1) + '' + (i - 1) + '" type="number" class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    }
    row.insertCell().innerHTML = '<select id="relacao' + (controle + 1) + '" class="relacao form-control" style="min-width: 70px;"><option><=</option><option>=</option><option>>=</option></select>';
    row.insertCell().innerHTML = '<input id="ladoDir' + (controle + 1) + '" type="number" class="ladoDir form-control" style="min-width: 90px;" onkeypress="return isNumberKey(event)" required  step="any">';

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
        row.insertCell(i).innerHTML = '<input id="limiSupx' + (i) + '" type="text" class="limSup form-control" required  step="any">';
    }
    row = table.insertRow(rowCount + 1);
    row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
    for (i = 1; i <= qVariaveis.value; i++) {
        row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" class="limInf form-control" required  step="any">';
    }

}

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 44 && charCode <= 46) {
            return true;
        }
        return false;

    }
    return true;
}

function showAlert(type, message) {
    $('#alert').removeClass();
    $('#alert').addClass('alert alert-' + type).html(message).fadeIn();
    window.setTimeout(closeAlert, 3000);
}
function closeAlert() {
    $('#alert').fadeOut();
}
function hideFormProblema() {
    $('#add2').hide();
    $('#add1').hide();
    $('#sub1').hide();
    $('#executar').hide();
    $('#salvar').hide();
    $('#executarPasso').hide();
    $('#limpar').hide();
    $('#excluir1').hide();
}

$(document).ready(function () {
    hideFormProblema();
    $("#limpar").click(function () {
        bootbox.dialog({
            title: '<center><b>Aviso</b></center>',
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
                        showAlert('success', 'Limpeza realizada com Sucesso!')
                    }
                }
            }
        }
    );
    });


    $("#add").click(function () {

        if (controle != -1) {
            var qVariaveis = document.getElementById("variaveis").value;
            bootbox.dialog({
                title: '<center><b>Aviso</b></center>',
                message: '<center><p>Todas as informações serão perdidas.</p></center>' +
                         '<center><p>Será criado uma nova tabela com<b> ' + qVariaveis + ' </b>variáveis</p></center>' +
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
                            showAlert('success', 'Nova tabela gerada com sucesso! ' + qVariaveis + ' variáveis criadas.');
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
            $('#executarPasso').show('fast');
            $('#salvar').show('fast');
            $('#limpar').show('fast');
            $('#excluir1').show('fast');
        }
    });
});

$(function () {

    $(document).on('scroll', function () {

        if ($(window).scrollTop() > 100) {
            $('.scroll-top-wrapper').addClass('show');
        } else {
            $('.scroll-top-wrapper').removeClass('show');
        }
    });
});

$(function () {

    $(document).on('scroll', function () {

        if ($(window).scrollTop() > 100) {
            $('.scroll-top-wrapper').addClass('show');
        } else {
            $('.scroll-top-wrapper').removeClass('show');
        }
    });

    $('.scroll-top-wrapper').on('click', scrollToTop);
});

function scrollToTop() {
    verticalOffset = typeof (verticalOffset) != 'undefined' ? verticalOffset : 0;
    element = $('body');
    offset = element.offset();
    offsetTop = offset.top;
    $('html, body').animate({ scrollTop: offsetTop }, 500, 'linear');
}


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
            }

            reader.readAsText(file);

        } else {
            alert("Erro no Carregamento");
        }
    });
    //document.getElementById('start#sectionA').click();
};

