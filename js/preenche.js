var controle = -1;
            var row;
            function addRow1() {
                var qVariaveis = document.getElementById("variaveis");
                controle++;
                if (controle < 20) {
                    var table = document.getElementById("myTableData");
                    var rowCount = table.rows.length;
                    row = table.insertRow(rowCount);
                    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o'+(controle+1)+'</b>';
                    for (i = 1; i <= qVariaveis.value; i++) {
                        row.insertCell(i).innerHTML = '<input type="number" class="form-control">';
                    }
                    row.insertCell().innerHTML = '<select class="form-control" id="operacao"><option><=</option><option>=</option><option>>=</option></select>';
                    row.insertCell().innerHTML = '<input type="number" class="form-control">';
                }
                else{
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
                        row.insertCell(i).innerHTML = '<b>x' + (i) + '</b>';
                    }
                    row.insertCell().innerHTML = '<b>Rela&ccedil;&atilde;o</b>';
                    row.insertCell().innerHTML = '<b>Lado Direito</b>';
                }
                controle++;
                    //var qVariaveis = document.getElementById("variaveis");
                    var table = document.getElementById("myTableData");
                    var rowCount = table.rows.length;
                    row = table.insertRow(rowCount);

                    row.insertCell(0).innerHTML = '<b>Objetivo</b>';
                    for (i = 1; i <= qVariaveis.value; i++) {
                        row.insertCell(i).innerHTML = '<input type="number" class="form-control">';
                    }
                    row.insertCell().innerHTML = '&nbsp;';
                    row.insertCell().innerHTML = '&nbsp;';
                    row = table.insertRow(rowCount + 1);
                    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o'+(controle+1)+'</b>';
                    for (i = 1; i <= qVariaveis.value; i++) {
                        row.insertCell(i).innerHTML = '<input type="number" class="form-control" >';
                    }
                    row.insertCell().innerHTML = '<select class="form-control" id="operacao"><option><=</option><option>=</option><option>>=</option></select>';
                    row.insertCell().innerHTML = '<input type="number" class="form-control" >';

            }
            function load() {

                console.log("Prestricoes load finished");
            }
            $(document).ready(function () {
            $('#add1').hide('fast');
            $("#add").click(function () {
                $('#add1').show('fast');
            });
        });