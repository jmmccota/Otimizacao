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
                label: "" + nodo.id,
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
    }

    this.criarConexao = function () {
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
        network.on('select', function (properties) {
            showAlert('success','ID: '+properties.nodes);
        });
    };
    //Somente para testes
    this.nodes.subscribe('*', function () {
        $('#nodes').html(toJSON(nodes.get()));
    });
    this.edges.subscribe('*', function () {
        $('#edges').html(toJSON(edges.get()));
    });
    //---------------------------------------------------

    return this;
};
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
            if (t.nRestri < 20) {

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
                alert("Mais de 20 restriçoes...ERRO!!!! ");
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
                    class="limSup form-control" required  step="any" value="' + t.upper[i - 1] + '">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++) {

            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" required  step="any" value="' + t.lower[i - 1] + '">';
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
                    class="limSup form-control" required  step="any">';
        }
        row = table.insertRow(rowCount + 1);
        row.insertCell(0).innerHTML = '<b>Limite Inferior</b>';
        for (i = 1; i <= t.nVar; i++)
            row.insertCell(i).innerHTML = '<input id="limiInfx' + (i) + '" type="text" \
                    class="limInf form-control" required  step="any">';
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
//Somente para testes
function toJSON(obj) {
    return JSON.stringify(obj, null, 4);
}
//----------------------------------
$(document).ready(function () {

//Por padrao os botoes estao escondidos
    hideFormProblema();
    t = Tabela();
    //Instancia de objeto da classe Arvore  
    a = Arvore();
    //Verifica se a tabela está toda preenchida, evitando ficar mandando informção(submit)
    $("form").submit(function (event) {
        if (!verificaTabela()) {
            return;
        }
        event.preventDefault();
    });
    //Novo problema de otimizacao
    $("#novo").click(function () {

        $("#div_mpl").fadeOut("fast");
        //se ja tem algum modelo aberto
        if (t.existe) {
            var nVariaveis = document.getElementById("variaveis").value;
            bootbox.dialog({
                title: '<center><b>Aviso</b></center>',
                message: '<center><p>Todas as informa&ccedil;&otilde;es ser&atilde;o perdidas.</p></center>' +
                        '<center><p>Ser&aacute; criado uma nova tabela com<b> ' + nVariaveis + ' </b>vari&aacute;veis</p></center>' +
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
                        $("#myTableData").empty();
                        $("#myTableData2").empty();
                        t.novo();
                        showAlert('success', 'Limpeza realizada com Sucesso!')
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
            var verifica = verificaTabela();
            if (!verifica) {
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
            } else {
                source += "\r\n\r\n";
                var blob = new Blob([source], {type: "application/octet-stream;charset=utf-8"});
                saveAs(blob, "modelo.txt");
            }
        } catch (err) {
            console.error("biblioteca faltante, FileSaver.js" + err);
        }
    });
    //Carrega de arquivo
    $('#carregar').click(function () {
//como esconder as sections e verificar se ta certo...
        t.reseta();
        var xx = CarregaFile();
        showFormProblema2();
        //alert("botao");
        //alert("obj " + x['objetivo']);
        //showFormProblema2();
        t.carrega(xx);
        var c = document.getElementById("problema");
        for (var i = 0; i < c.options.length; i++) {
            if (c.options[i].value === xx["problema"]) {
                c.options[i].selected = true;
                break;
            }
        }
        var d = document.getElementById("variaveis");
        for (var k = 1; k <= d.options.length; k++) {
            if (k === xx["nVariaveis"]) {
                d.options[k - 1].selected = true;
                break;
            }
        }
//dar um jeito de mostrar sectionA com as tabelas carregadas
//showFormProblema2();
    });
    //Executar Branch and Bound
    $('#executar').click(function () {
        $("#panelResultado").show();
        b = new BranchBound();
        a.setContainer(document.getElementById("resultTree"));
        while (!b.terminou()) {
            nodo = b.executar();
            //funcao de desenhar
            a.adicionarNodo(nodo);
            a.adicionarAresta(nodo);
        }
        a.criarConexao();
        otimo = b.melhorSolucao();
        //faz alguma coisa com o otimo
        progressBar("primary", 100);
    });
    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function () {
        $("#div_mpl").fadeOut("fast");
        b = new BranchBound();
        while (!b.terminou()) {
            nodo = b.proximoPasso(function (branchBound/*precisa do BranchBound como parametro,
             mesmo que nao seja usado*/) {
//funcao que retorna o indice do x que o usuario escolheu
            });
            //funcao de desenhar
        }

        otimo = b.melhorSolucao();
        //faz alguma coisa com o otimo
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
                log = numFiles > 1 ? numFiles + ' files selected' : label;
        if (input.length) {
            input.val(log);
        } else {
            if (log)
                alert(log);
        }

    });
});
;
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
    $("#a").removeClass()
    $("#a").addClass("active");
    $("#b").removeClass()

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

// ??????????
CarregaFile = function upload() {
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
    var fileInput = document.getElementById('inputFile');
    //fileInput.addEventListener('change', function (e) {
    var file = fileInput.files[0];
    var textType = /text.*/;
    //alert("entrou fileinput");
    if (file.type.match(textType)) {

        var reader = new FileReader();
        reader.onload = function (e) {
            //alert("entrou fileinput2");
            source = reader.result;
            //alert("source "+source);
            var linha = 1;
            var cont = 1;
            var tam = 0;
            //var iRest = 0;
            var p = 1; //qual parte
            //var nVariaveis = 0;
            //var iObj = 0;
            //var problema;
            while (cont < source.length) {
                if (p === 1) {//qual problema...p=1 Ã© pra saber se Ã© max ou min
                    if (source[1] === "a") {
                        problema = "Maximize";
                    } else if (source[1] === "i") {
                        problema = "Minimize";
                    } else {
                        alert("Arquivo estÃ¡ errado!!!");
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
                        alert("Erro!!!");
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
                        cont++
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
        };
        reader.readAsText(file);
    } else {
        alert("Erro no Carregamento");
    }
    alert("Valores carregados");
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
//Remover script Dinamico
function removeHead(src) {
    $("script[src='" + src + "']").remove()
}
;
//Função para verificar a existencia de um script
function exiteHead(src) {
    var head = $('head');
    head = head.find('script');
    for (i = 0; i < head.length; i++) {
        scriptSrc = head[i].src.split("/");
        srcLocal = src.split("/");
        //alert(scriptSrc[scriptSrc.length - 1] + "\n " + srcLocal[srcLocal.length - 1] + "\n" + (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]));
        if (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]) {
            return true;
        }

    }
}
;
//Remover script Dinamico
function removeHead(src) {
    $("script[src='" + src + "']").remove()
}
;
//Função para verificar a existencia de um script
function exiteHead(src) {
    var head = $('head');
    head = head.find('script');
    for (i = 0; i < head.length; i++) {
        scriptSrc = head[i].src.split("/");
        srcLocal = src.split("/");
        //alert(scriptSrc[scriptSrc.length - 1] + "\n " + srcLocal[srcLocal.length - 1] + "\n" + (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]));
        if (scriptSrc[scriptSrc.length - 1] == srcLocal[srcLocal.length - 1]) {
            return true;
        }

    }
}
;
//Adiciona script dinamico
function addHead(src) {
    if (exiteHead(src)) {
        removeHead(src);
        removeStyle();
        //alert("Removido co sucesso");
    }
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script)
}
;
function removeStyle() {
    $('style').empty();
}