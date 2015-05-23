
//Varivel de controle para MathJax.js
mathCont = 0;
//Varivel para leitura do arquivo
var reader;
////////////////////////////////////////////////////
//                FUNCOES DA ARVORE               //
////////////////////////////////////////////////////
Arvore = function () {

    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();

    this.adicionarNodo = function (nodo) {
        try {
            this.nodes.add({
                id: nodo.id,
                label: "" + nodo.numero,
                title: "<p>z: " + nodo.z + "</p>x: " + nodo.x + "</p>",
                level: nodo.altura
            });
        }
        catch (err) {
            alert(err);
        }
    };
    this.adicionarAresta = function (nodo) {
        try {
            this.edges.add({
                to: nodo.pai,
                from: nodo.id
            });
        }
        catch (err) {
            alert(err);
        }
    };
    this.setContainer = function (container) {
        this.container = container;
    };
    this.definirOtimo = function (otimo) {
        this.network.selectNodes([otimo.id]);
        this.bestNode = otimo;
        exibirNodo(otimo, this.bestNode);
    };
    this.criarConexao = function (b) {
        this.data = {
            nodes: this.nodes,
            edges: this.edges
        };
        var options = {
            height: '400px',
            hover: true,
            dragNetwork: false,
            dragNodes: false,
            zoomable: false,
            smoothCurves: {
                roundness: 0
            },
            nodes: {
                radius: 30,
                borderWidth: 2
            },
            edges: {
                width: 2
            },
            physics: {
                hierarchicalRepulsion: {
                    centralGravity: 0.5,
                    springLength: 50,
                    springConstant: 0.05,
                    nodeDistance: 120,
                    damping: 0.09
                }
            },
            hierarchicalLayout: {
                enabled: true,
                levelSeparation: 50,
                nodeSpacing: 5,
                direction: "UD",
                layout: "direction"
            }

        };
        this.network = new vis.Network(this.container, this.data, options);

        this.network.on('select', function (properties) {
            try {
                nodoSelecionado = properties.nodes;
                nodo = b.heap.array[properties.nodes];
                exibirNodo(nodo, b.melhorSolucao());
                showAlert('info', 'Nó ' + nodo.numero + ' selecionado.');
            }
            catch (err) {
                //showAlert("danger", "Você clicou na aresta. Clique no nó!");
            }
        });
    };

};
//Funções auxiliares
function exibirNodo(nodo, otimo) {

    addHead("js/MathJax/MathJax.js?config=AM_HTMLorMML");
    addHead("js/ASCIIMathML.js");

    $("#valorZ").empty();
    $("#tipoSol").empty();
    $("#novosX").empty();
    $("#modelo").empty();


    if (nodo.z === "-Inf") {
        $("#tipoSol").append("Solução não é inteira");
        $("#valorZ").append("`z = -\infty`");
    }
    else if (nodo.z === "-Inf" || nodo.z === "Inf") {
        $("#tipoSol").append("Solução não é inteira");
        $("#valorZ").append("`z = \infty`");
    }
    else if (otimo === 0 || typeof (nodo.z) === "string") {
        $("#tipoSol").append(nodo.z);
        $("#valorZ").append("Não possui solução viável");
    }
    else if (nodo.id === otimo.id) {
        $("#tipoSol").append("Solução ótima");
        $("#valorZ").append("`z = " + nodo.z + "`");
    }
    else {
        $("#tipoSol").append("Não é a solução ótima");
        $("#valorZ").append("`z = " + nodo.z + "`");
    }

    var novosX = "";
    for (i = 0; i < nodo.x.length; i++) {
        novosX += '<div id="' + i + '" onclick="selecionaX(' + i + ')" class="';
        if (i === nodo.xi)
            novosX += 'destacaXi ';
        novosX += 'destacaXialt">`x_' + (i + 1) + ' = ' + nodo.x[i] + '`</div>';
    }
    if (novosX === "") {
        $("#novosX").append("Nenhum valor.");
    } else {
        $("#novosX").append(novosX);
    }
    $("#modelo").append(nodo.modelo());

}
;
////////////////////////////////////////////////////
//                FUNCOES DA TABELA               //
////////////////////////////////////////////////////
Tabela = function () {
    var t = {};
    t.reseta = function () {
        t.nRestri = 0;
        t.nVar = document.getElementById("variaveis").value;
    };
    t.carrega = function (xx) {
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
            row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="number" \
                    class="fObj form-control" onkeypress="return isNumberKey(event)" required  step="any" value="' + t.objetivo[i - 1] + '">';
        row.insertCell().innerHTML = '&nbsp;';
        row.insertCell().innerHTML = '&nbsp;';
        //add restricoes
        if (t.restricoes[0] === "n") {
            alert("Nao possui restricoes");
        } else {
            var table = document.getElementById("myTableData");
            if (t.nRestri < 21) {

                for (j = 2; j < (t.nRestri + 2); j++) {

                    var row = table.insertRow(j);
                    row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + (j - 1) + '</b>';
                    for (i = 1; i <= t.nVar; i++) {
                        row.insertCell(i).innerHTML = '<input id="x' + (j - 1) + '' + (i - 1) + '" type="number"  \
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

                    row.insertCell().innerHTML = '<input id="ladoDir' + (j - 1) + '" type="number" \
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any" value="' + t.rhs[j - 2] + '">';
                }
            } else {
                showAlert('warning', 'Limite máximo de restrições atingido: 20!');

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
    t.novo = function () {

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
            row.insertCell(i).innerHTML = '<input id="x0' + (i - 1) + '" type="number" \
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
                    class="limSup form-control" onkeypress="return isInfinityKey(event)" required  step="any">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" onkeypress="return isInfinityKey(event)" required  step="any">';
    };
    //Adiciona restricoes ao modelo
    t.addRow = function () {
        if (t.nRestri === 20) {
            showAlert('warning', 'Limite máximo de restrições atingido: 20!');
            return;
        }

        t.nRestri++;
        var table = document.getElementById("myTableData");
        var row = table.insertRow(t.nRestri + 1);
        row.insertCell(0).innerHTML = '<b>Restri&ccedil;&atilde;o' + t.nRestri + '</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="x' + t.nRestri + '' + (i - 1) + '" type="number"  \
                    class="xRest form-control" onkeypress="return isNumberKey(event)" required  step="any">';
        row.insertCell().innerHTML = '<select id="relacao' + t.nRestri + '" class="relacao form-control" \
                style="min-width: 70px;"><option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + t.nRestri + '" type="number" style="min-width: 90px;"\
                class="ladoDir form-control" onkeypress="return isNumberKey(event)" required  step="any">';
    };
    //Remove restricoes do modelo
    t.deleteRow = function () {
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

$(document).ready(function () {
    //Por padrao os botoes estao escondidos

    hideFormProblema();
    t = Tabela();
    //Verifica se a tabela está toda preenchida, evitando ficar mandando informção(submit)
    $("form").submit(function (event) {
        event.preventDefault();
    });
    //Novo problema de otimizacao
    $("#novo").click(function () {
        $("#div_mpl").fadeOut("fast");
        //se ja tem algum modelo aberto
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
                        callback: function () {
                            $("#panelResultado").fadeOut("fast");
                            $('#rowProgress').fadeOut('fast');
                            $("#myTableData").empty();
                            $("#myTableData2").empty();
                            t.novo();
                            showAlert('success', 'Nova tabela gerada com sucesso! ' + nVariaveis + ' vari&aacute;veis criadas.');
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
        $("#div_mpl").fadeOut("fast");
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
                        $('#rowProgress').fadeOut('fast');
                        $("#myTableData").empty();
                        $("#myTableData2").empty();
                        t.novo();
                        showAlert('success', 'Limpeza realizada com Sucesso!');
                    }
                }
            }
        });
    });
    //Salva em arquivo
    $('#salvar').click(function () {
        $("#div_mpl").fadeOut("fast");
        try {
            var source = "";
            var x = leituraParametros();
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
                var blob = new Blob([source], {type: "application/octet-stream;charset=utf-8"});
                saveAs(blob, "modelo.txt");
            }
        } catch (err) {
            console.error("biblioteca faltante, FileSaver.js" + err);
        }
    });
    //Analisar arquivo
    $('#analisarFile').click(function () {
        if (reader.result != null )  {
            t.reseta();
            showFormProblema2();
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
            showAlert("success", "Arquivo analisado com sucesso!");

        }else
            showAlert("danger", "Não foi possivel analisar o arquivo!");
    });
    //Executar Branch and Bound
    $('#executar').click(function () {
        if (!verificaTabela()) {
            try {
                a = new Arvore();
                b = new BranchBound();

                var res = b.resolveRaiz();
                //Adiciona nodo e aresta a arvore
                a.adicionarNodo(res);
                a.adicionarAresta(res);
                while (!b.terminou()) {
                    res = b.executar();
                    //Adiciona nodo e aresta a arvore
                    a.adicionarNodo(res[0]);
                    a.adicionarAresta(res[0]);
                    a.adicionarNodo(res[1]);
                    a.adicionarAresta(res[1]);
                }
                //Operações da arvore
                var otimo = b.melhorSolucao();
                $("html, body").animate({scrollTop: $(document).height() - 385}, 1500);

                $("#panelResultado").show();

                a.setContainer(document.getElementById("resultTree"));
                a.criarConexao(b);

                if (otimo !== 0) {
                    a.definirOtimo(otimo);
                    progressBar("success", 100);
                    showAlert("success", "Solução ótima encontrada com sucesso.")
                }
                else {
                    progressBar("warning", 100);
                    showAlert("warning", "Não foi possivel obter uma solução ótima viável.")
                }
            }
            catch (err) {
                showAlert("danger", err);
            }
        }
    });
    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function () {
        $("#div_mpl").fadeOut("fast");
        if (!verificaTabela()) {
            a = new Arvore();
            b = new BranchBound();
            $("html, body").animate({scrollTop: $(document).height() - 380}, 1500);
            $("#panelResultado").show();
            nodos = [];

            var nodo = b.resolveRaiz();
            a.adicionarNodo(nodo);
            a.adicionarAresta(nodo);
            nodos.push(nodo);
            a.setContainer(document.getElementById("resultTree"));
            a.criarConexao(b);
            $('#proximoPasso').show('fast');
        }
    });
    //Define botao para proximo passo
    $('#proximoPasso').click(function () {
        if (b.terminou())
            a.definirOtimo(b.melhorSolucao());
        delete a;
        a = new Arvore();
        var res = b.executar();
        nodos.push(res[0]);
        nodos.push(res[1]);
        for (var i = 0; i < nodos.length; i++) {
            a.adicionarNodo(nodos[i]);
            a.adicionarAresta(nodos[i]);
        }
        a.setContainer(document.getElementById("resultTree"));
        a.criarConexao(b);
    });
    //Ao rolar a pagina adiciona o botao de voltar ao topo
    $(document).on('scroll', function () {
        if ($(window).scrollTop() > 100)
            $('.scroll-top-wrapper').addClass('show');
        else
            $('.scroll-top-wrapper').removeClass('show');
    });
    //Ao clicar no botao volta para o topo
    $('.scroll-top-wrapper').on('click', function () {
        verticalOffset = typeof (verticalOffset) != 'undefined' ?
                verticalOffset :
                0;
        offset = $('body').offset();
        offsetTop = offset.top;
        $('html, body').animate({scrollTop: offsetTop}, 500, 'linear');
    });
    //Ao clicar no botão file aparecer o caminho
    $(document).on('change', '.btn-file :file', function () {
        var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });
    //Botão file
    $('.btn-file :file').on('fileselect', function (event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' arquivos selecionados' : label;
        if (input.length) {
            input.val(log);
        } else {
            if (log)
                alert(log);
        }
    });

    //Carregar, cria um evento de listener
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');

    fileInput.addEventListener('change', function (e) {
        var file = fileInput.files[0];
        var textType = /text.*/;

        $("#rowFileDisplayArea").show();
        if (file.type.match(textType)) {
            reader = new FileReader();

            reader.onload = function (e) {
                fileDisplayArea.innerText = reader.result;
            }
            $('#analisarFile').prop('disabled', false);
            showAlert("success", "Arquivo carregado com sucesso!");
            reader.readAsText(file);
        } else {
            $('#analisarFile').prop('disabled', true);
            fileDisplayArea.innerText = "Arquivo não suportado! ";
            showAlert("danger", "Arquivo não suportado!");
        }
    });
});

//Define proximo passo a partir de selecao da variavel
function selecionaX(xi) {
    if (b.terminou())
        a.definirOtimo(b.melhorSolucao());
    delete a;
    a = new Arvore();
    var res = b.resolveNodos(nodoSelecionado, xi);
    nodos.push(res[0]);
    nodos.push(res[1]);
    for (var i = 0; i < nodos.length; i++) {
        a.adicionarNodo(nodos[i]);
        a.adicionarAresta(nodos[i]);
    }
    a.setContainer(document.getElementById("resultTree"));
    a.criarConexao(b);
}

// Proibe a digitação de letras e simbolos especiais
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 44 && charCode <= 46)
            return true;
        return false;
    }
    return true;
}

function isInfinityKey(evt) {

    var valida = false;
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (charCode >= 44 && charCode <= 46)
            valida = true;
        else
        //inf minuscuto
        if (charCode == 105 || charCode == 110 || charCode == 102)
            valida = true;
        else
        //INF maiusculo
        if (charCode == 70 || charCode == 73 || charCode == 78)
            valida = true;
        else
            valida = false;
    }
    else
        valida = true;

    return valida;
}

//Cria um alert bootstrap
function showAlert(type, message) {
    $('#alert').removeClass();
    $('#alert').addClass('alert alert-' + type).html(message).fadeIn();
    window.setTimeout(closeAlert, 3000);
}

//Apaga um alert bootstrap
function closeAlert() {
    $('#alert').fadeOut();
}

//Mostra os botoes de controle da tabela
function showFormProblema() {
    $('#addRow').show('fast');
    $('#delRow').show('fast');
    $('#executar').show('fast');
    $('#passoAPasso').show('fast');
    $('#salvar').show('fast');
    $('#limpar').show('fast');
}

function showFormProblema2() {
    //Da active no <li> section A
    $("#a").removeClass();
    $("#a").addClass("active");
    $("#b").removeClass();

    //Muda de Aba para section A
    $secA = $("#sectionA");
    $secB = $("#sectionB");
    $secB.removeClass();
    $secB.addClass("tab-pane fade");
    $secA.removeClass();
    $secA.addClass("tab-pane fade in active");
    showFormProblema();
}
//Esconde os botoes de controle da tabela
function hideFormProblema() {
    $('#addRow').hide('fast');
    $('#delRow').hide('fast');
    $('#executar').hide('fast');
    $('#passoAPasso').hide('fast');
    $('#salvar').hide('fast');
    $('#limpar').hide('fast');
    $('#esconde').hide('fast');
    $('#proximoPasso').hide('fast');
}

//Progress Bar
function progressBar(type, percent) {
    //Progress bar
    var $pb = $('#progress-bar');
    $('#rowProgress').show('fast');
    $pb.removeClass();
    $pb.addClass('progress-bar progress-bar-' + type + ' active');
    $pb.width(percent + "%");
}

//Remover script Dinamico
function removeHead(src) {
    $("script[src='" + src + "']").remove();
}

//Função para verificar a existencia de um script
function existeHead(src) {
    var head = $('head');
    head = head.find('script');
    for (i = 0; i < head.length; i++) {
        scriptSrc = head[i].src.split("/");
        srcLocal = src.split("/");
        if (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]) {
            return true;
        }
    }
    return false;
}
//Adiciona script dinamico - modificado para o MathJax
function addHead(src) {
    if (mathCont > 1) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    } else {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        document.getElementsByTagName("head")[0].appendChild(script);
        mathCont++;
    }

}

function removeStyle() {
    $('style').empty();
}

function analisarFile() {
    var source = "";
    var restricoes = [];
    var relacoes = [];
    var rhs = [];
    var upper = [];
    var lower = [];
    var objetivo = [];
    var problema = "";
    var nVariaveis = 0;
    var iRest = 0;

    source = reader.result;
    var linha = 1;
    var cont = 1;
    var tam = 0;
    var p = 1; //qual parte
    while (cont < source.length) {
        if (p === 1) {//qual problema...p=1 Ã© pra saber se Ã© max ou min
            if (source[1] === "a") {
                problema = "Maximize";
            } else if (source[1] === "i") {
                problema = "Minimize";
            } else {
                alert("Arquivo está errado!!!");
            }
            //alert(problema);
            while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9") {
                cont++;
            }
            p++;
        }
        if (p === 2) { //saber funÃ§ao objetivo
            var linha = "";
            //alert("cont "+source[cont]);
            while (source[cont] !== "\n") { //pega a linha inteira 

                linha += source[cont];
                cont++;
            }

            for (i = 0; i < linha.length; i++) { //o numero de | Ã© o numero de variaveis
                if (linha[i] === "|") {
                    nVariaveis++;
                }
            }
            //alert("linha2 inteira "+linha);
            objetivo = linha.split("|", nVariaveis); //funÃ§ao objetivo
            //alert("tamanho obj "+objetivo.length);
            //                                                for(k=0;k<objetivo.length;k++){
            //                                                    alert("obj " + objetivo[k]);
            //                                                }
            //alert(objetivo);

            p++;
            //var n=0;
            while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9" && source[cont] !== "n") {//avanÃ§a ate as restriÃ§oes


                cont++;
            }
            if (source[cont] === "n") {
                //alert("cont saida " + source[cont]);
                restricoes.push("n");
                p = 4;
                //n=1;

            }
        }
        if (p === 3) { //pega restriÃ§oes
            //alert("entrou p3");
            linha = "";
            //alert("cont3 "+source[cont]);
            while (source[cont] !== ">" && source[cont] !== "<" && source[cont] !== "=") { //pega ate a relacao
                linha += source[cont];
                cont++;
            }
            //alert("linha3 inteira "+linha);
            restricoes[iRest] = linha.split("|", nVariaveis);
            //                    for (k = 0; k < restricoes[iRest].length; k++) {
            //                        alert("rest " + restricoes[iRest][k]);
            //                    }
            iRest++;
            //cont++;
            if (source[cont] === ">") { //pega a relacao
                relacoes.push(">=");
                cont += 2;
            } else if (source[cont] === "<") {
                relacoes.push("<=");
                cont += 2;
            } else if (source[cont] === "=") {
                relacoes.push("=");
                cont++;
            } else {
                alert("Erro!!! Sentido da expressão inexistente");
            }
            //                    alert("relacao " + relacoes[iRest - 1]);
            var ld = "";
            cont++;
            while (source[cont] !== "|") { //pega o lado direito
                ld += source[cont];
                cont++;
            }
            //alert("linha d "+ld);
            //var lld=ld.split("|");
            //alert("lld = "+lld);
            rhs.push(ld);
            //                    alert("direita " + rhs[iRest - 1]);
            cont += 2;
            if (source[cont + 2] === "\n") { //se tiver acabado restriÃ§oes pula pro proximo p
                p++;
            } else { //se nao tiver pula pra proxima linha

                cont++;
            }
        }
        if (p === 4) { //pega lower
            //alert("entrou p4");
            while (source[cont] !== "-" && source[cont] !== "0" && source[cont] !== "1" && source[cont] !== "2"
                    && source[cont] !== "3" && source[cont] !== "4" && source[cont] !== "5" && source[cont] !== "6"
                    && source[cont] !== "7" && source[cont] !== "8" && source[cont] !== "9") {
                cont++;
            }
            linha = "";
            //alert("cont4 "+source[cont]);
            while (source[cont] !== "\n") { //pega a linha com os minimos
                linha += source[cont];
                cont++;
            }
            //alert("linha3 inteira "+linha);
            var lw = linha.split("|", nVariaveis); //separa valores
            for (i = 0; i < nVariaveis; i++) {
                lower.push(lw[i]);
                //alert("lower " + lower[i]);
            }
            p++;
            cont += 3;
        }
        if (p === 5) {//pega uppers
            //alert("entrou p5");
            //alert("cont5 "+source[cont]);
            linha = "";
            var cb = 0;
            while (source[cont] !== "\n" && cb < nVariaveis) { //vai ate a linha
                linha += source[cont];
                if (source[cont] === "|") {
                    cb++;
                    if (cb === nVariaveis) {
                        break;
                    }

                }
                cont++;
            }
            //alert("linha5 inteira "+linha);
            var up = linha.split("|", nVariaveis); //separa valores
            //                        for(j = 0; j < nVariaveis; j++){
            //                            //upper.push(up[j]);
            //                            //alert("linha split " + up[j]);
            //                        }
            for (j = 0; j < nVariaveis; j++) {
                upper.push(up[j]);
                //alert("upper " + upper[j]);
            }
            p++;
            //alert("Pegou os valores, falta mandar pra tabela");
        }
        if (p === 6) {//termina
            cont = source.length;
        }
    }

    return {
        problema: problema,
        objetivo: objetivo,
        restricoes: restricoes,
        relacoes: relacoes,
        rhs: rhs,
        upper: upper,
        lower: lower,
        nVariaveis: nVariaveis,
        iRest: iRest
    };
};
    
//# sourceURL=interface.js