
////////////////////////////////////////////////////
//                FUNCOES DA ARVORE               //
////////////////////////////////////////////////////
Arvore = function() {

    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();

    this.adicionarNodo = function(nodo) {
        try {
            var estilo = 0;
            if (nodo.otimo) {
                estilo = "betterSolution";
            } else if (nodo.z === "-Inf" || nodo.z === "Inf" || !isNaN(nodo.z)) {
                estilo = 0;
            } else {
                estilo = "wrongSolution";
            }
            this.nodes.add({
                id: nodo.id,
                label: "" + nodo.numero,
                title: "<p>z: " + nodo.z + "</p>x: " + nodo.x + "</p>",
                level: nodo.altura,
                group: estilo
            });

        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    };

    this.adicionarAresta = function(nodo) {
        try {
            this.edges.add({
                to: nodo.pai,
                from: nodo.id
            });
        }
        catch (err) {
            showAlert("danger", "" + err);
        }
    };

    this.setContainer = function(container) {
        this.container = container;
    };

    this.definirOtimo = function(otimo) {
        this.network.selectNodes([otimo.id]);
        this.bestNode = otimo;
        exibirNodo(otimo, this.bestNode);
    };

    this.criarConexao = function(b) {
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
            },
            groups: {
                betterSolution: {
                    color: '#C2FABC'
                },
                wrongSolution: {
                    color: '#FB7E81'
                }
            }
        };

        this.network = new vis.Network(this.container, this.data, options);

        this.network.on('select', function(properties) {
            try {
                nodoSelecionado = properties.nodes;
                nodo = b.heap.array[properties.nodes];
                if (nodo.otimo) {
                    exibirNodo(nodo, nodo);
                } else {
                    exibirNodo(nodo, 0);
                }
                showAlert('info', 'Nó ' + nodo.numero + ' selecionado');
            }
            catch (err) {
                //showAlert("danger", "Você clicou na aresta. Clique no nó!");
            }
        });
    };
};

function exibirNodo(nodo, otimo) {

    addHead("../MathJax/MathJax.js?config=AM_HTMLorMML");
    addHead("../ASCIIMathML.js");

    $("#valorZ").empty();
    $("#tipoSol").empty();
    $("#novosX").empty();
    $("#modelo").empty();

    if (nodo.z === "-Inf") {
        $("#tipoSol").append("Solução não é inteira");
        $("#valorZ").append("`z = -\infty`");
    }
    else if (nodo.z === "Inf") {
        $("#tipoSol").append("Solução não é inteira");
        $("#valorZ").append("`z = \infty`");
    }
    else if (typeof (nodo.z) === "string") {
        $("#tipoSol").append(nodo.z);
        $("#valorZ").append("Não possui solução viável");
    }
    else if (nodo.otimo) {
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

};

////////////////////////////////////////////////////
//               FUNCOES DE INTERFACE             //
////////////////////////////////////////////////////
$(document).ready(function() {
    //Por padrao os botoes estao escondidos

    hideFormProblema();
    t = Tabela();

    //Novo problema de otimizacao
    $("#novo").click(function() {

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
                        callback: function() {
                            $("#panelResultado").fadeOut("fast");
                            $("#myTableData").empty();
                            $("#myTableData2").empty();
                            t.novo();
                            showAlert('success', 'Nova tabela gerada. ' + nVariaveis + ' vari&aacute;veis criadas');
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
                        $("#myTableData2").empty();
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
            var x = leituraParametros(2);
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
        $('#rowObsProximoPasso').hide('fast');
        if (!verificaTabela()) {
            try {
                a = new Arvore();
                b = new BranchBound();

                var res = new Array();
                res.push(b.resolveRaiz());

                while (!b.terminou()) {
                    temp = b.executar();
                    if (temp[0] != undefined) {
                        res.push(temp[0]);
                    }
                    if (temp[1] != undefined) {
                        res.push(temp[1]);
                    }
                }
                b.melhorSolucao();

                //Operações da arvore
                for (var i = 0; i < res.length; i++) {
                    a.adicionarNodo(res[i]);
                    a.adicionarAresta(res[i]);
                    if (res[i].otimo) {
                        otimo = res[i];
                    }
                }

                $("html, body").animate({ scrollTop: $(document).height() - 385 }, 1500);

                $("#panelResultado").show();

                a.setContainer(document.getElementById("resultTree"));
                a.criarConexao(b);

                if (otimo !== 0) {
                    a.definirOtimo(otimo);
                    showAlert("success", "Solução ótima encontrada. Z = " + otimo.z);
                }
                else {
                    showAlert("warning", "Não foi possivel obter uma solução ótima viável.")
                }
            }
            catch (err) {
                showAlert("danger", "" + err);
            }
        }
    });

    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function() {
        if (!verificaTabela()) {
            $("#proximoPasso").prop('disabled', false);
            a = new Arvore();
            b = new BranchBound();
            $("html, body").animate({ scrollTop: $(document).height() - 380 }, 1500);
            $("#panelResultado").show();
            nodos = [];

            var nodo = b.resolveRaiz();
            a.adicionarNodo(nodo);
            a.adicionarAresta(nodo);
            nodos.push(nodo);
            a.setContainer(document.getElementById("resultTree"));
            a.criarConexao(b);
            $('#proximoPasso').show('fast');
            $('#rowObsProximoPasso').show('fast');
        }
    });

    //Define botao para proximo passo
    $('#proximoPasso').click(function() {
        delete a;
        a = new Arvore();
        var res = b.executar();
        b.melhorSolucao()
        nodos.push(b.heap.array[res[0].id]);
        nodos.push(b.heap.array[res[1].id]);
        for (var i = 0; i < nodos.length; i++) {
            if (nodos[i] != undefined) {
                a.adicionarNodo(nodos[i]);
                a.adicionarAresta(nodos[i]);
            }
        }
        a.setContainer(document.getElementById("resultTree"));
        a.criarConexao(b);
        if (b.terminou()) {
            $("#proximoPasso").prop('disabled', true);
        }
    });

    //Analisar arquivo
    $('#analisarFile').click(function() {
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
                showAlert("success", "Arquivo analisado com sucesso");

            } else
                throw "Não foi possível analisar o arquivo";
        } catch (err) {
            showAlert("danger", "Erro: " + err);
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
    b.melhorSolucao()
    nodos.push(b.heap.array[res[0].id]);
    nodos.push(b.heap.array[res[1].id]);
    for (var i = 0; i < nodos.length; i++) {
        if (nodos[i] != undefined) {
            a.adicionarNodo(nodos[i]);
            a.adicionarAresta(nodos[i]);
        }
    }
    a.setContainer(document.getElementById("resultTree"));
    a.criarConexao(b);
}

//# sourceURL=interfaceBranchBound.js
