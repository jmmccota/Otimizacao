Tabela = function () {
    var t = {};

    t.reseta = function () {
        t.nRestri = 0;
        t.nVar = document.getElementById("variaveis").value;
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
        if (t.nRestri == 20) {
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
        row.insertCell().innerHTML = '<select id="relacao' + t.nRestri + '" class="relacao form-control">\
                <option><=</option><option>=</option><option>>=</option></select>';
        row.insertCell().innerHTML = '<input id="ladoDir' + t.nRestri + '" type="number" \
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

    //Novo problema de otimizacao
    $("#novo").click(function () {

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
        if (t.nRestri == 0) {
            showAlert("warning", "Não há mais restrições para excluir!")
        }
        else {
            t.deleteRow();
        }
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

    });

    //Carrega de arquivo
    $('#carregar').click(function () {

    });

    //Executar Branch and Bound
    $('#executar').click(function () {
        b = BranchBound();

        while (!b.terminou()) {
            nodo = b.executar();
            //funcao de desenhar
        }

        otimo = b.melhorSolucao();
        //faz alguma coisa com o otimo
    });

    //Executar Branch and Bound Passo a Passo
    $('#passoAPasso').click(function () {
        b = BranchBound();

        while (!b.terminou()) {
            nodo = b.proximoPasso(function () {
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
});

// ??????????
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
                var restricoes = [];
                var relacoes = [];
                var rhs = [];
                var upper = [];
                var lower = [];
                var objetivo = [];
                var linha = 1;
                var cont = 1;
                var tam = 0;
                var problema = "";
                var iRest = 0;
                var p = 1; //qual parte
                var nVariaveis=0;
                //var iObj = 0;
                //var problema;
                while (cont < source.length) {
                    if (p === 1) {//qual problema
                        if (source[1] === "a") {
                            problema = "Maximização";
                        } else if (source[1] === "i") {
                            problema = "Minimização";
                        } else {
                            alert("Arquivo está errado!!!");
                        }
                        //alert(problema);
                        while(source[cont]!=="-" && source[cont]!=="+" && source[cont]!=="0"){
                            cont++;
                        }
                        p++;
                    }
                    if (p === 2) {
                        var linha = "";
                        //alert("cont "+source[cont]);
                        while (source[cont] !== "\n") {
                            
                            linha += source[cont];
                            cont++;
                        }
                        
                        for(i=0;i<linha.length;i++){
                            if(linha[i]==="|"){
                                nVariaveis++;
                            }
                        }
                        //alert("linha2 inteira "+linha);
                        objetivo = linha.split("|",nVariaveis);
                        //alert("tamanho obj "+objetivo.length);
//                        for(k=0;k<objetivo.length;k++){
//                            alert("obj " + objetivo[k]);
//                        }
                        //alert(objetivo);
                        
                        p++;
                        while(source[cont]!=="-" && source[cont]!=="+" && source[cont]!=="0"){
                            //alert("cont saida "+source[cont]);
                            cont++;
                        }
                    }
                    if (p === 3) {
                        //alert("entrou p3");
                        linha = "";
                        //alert("cont3 "+source[cont]);
                        while (source[cont] !== ">" && source[cont] !== "<" && source[cont] !== "=") {
                            linha += source[cont];
                            cont++;
                        }
                        //alert("linha3 inteira "+linha);
                        restricoes[iRest] = linha.split("|",nVariaveis);
//                        for(k=0;k<restricoes[iRest].length;k++){
//                            alert("rest " + restricoes[iRest][k]);
//                        }
                        iRest++;
                        //cont++;
                        if(source[cont]===">"){
                            relacoes.push(">=");
                            cont+=2;
                        }else if(source[cont]==="<"){
                            relacoes.push("<=");
                            cont+=2;
                        }else if(source[cont]==="="){
                            relacoes.push("=");
                            cont++;
                        }else{
                            alert("Erro!!!");
                        }
                        //alert("relacao "+relacoes[iRest-1]);
                        var ld="";
                        cont++;
                        while(source[cont]!=="|"){
                            ld+=source[cont];
                            cont++;
                        }
                        //alert("linha d "+ld);
                        //var lld=ld.split("|");
                        //alert("lld = "+lld);
                        rhs.push(ld);
                        //alert("direita "+rhs[iRest-1]);
                        cont+=2;
                        if(source[cont+2]==="\n"){
                            p++;
                            
                        }else{
                            
                            cont++;
                        }
                    }
                    if(p===4){
                        //alert("entrou p4");
                        while(source[cont]!=="-" && source[cont]!=="+" && source[cont]!=="0"){
                            cont++;
                        }
                        linha="";
                        //alert("cont4 "+source[cont]);
                        while(source[cont]!=="\n"){
                            linha+=source[cont];
                            cont++
                        }
                        //alert("linha3 inteira "+linha);
                        var lw=linha.split("|",nVariaveis);
                        for(i = 0; i < nVariaveis; i++){
                            lower.push(lw[i]);
                            //alert("lower " + lower[i]);
                        }
                        p++;
                        cont+=3;
                    }
                    if(p===5){
                        //alert("entrou p5");
                        //alert("cont5 "+source[cont]);
                        linha="";
                        while(source[cont]!=="\n"){
                            linha+=source[cont];
                            cont++
                        }
                        //alert("linha5 inteira "+linha);
                        var up=linha.split("|",nVariaveis);
//                        for(j = 0; j < nVariaveis; j++){
//                            //upper.push(up[j]);
//                            //alert("linha split " + up[j]);
//                        }
                        for(j = 0; j < nVariaveis; j++){
                            upper.push(up[j]);
                            //alert("upper " + upper[j]);
                        }
                        p++;
                    }
                    if(p===6){
                        cont=source.length;
                    }



                }
//                var source = "";
//
//                source = this.problema + '\n';
//                source += "obj: ";
//                for (var i = 0; i < this.objetivo.length; i++) {
//                    source += this.objetivo[i] >= 0 ? " +" : "";
//                    source += this.objetivo[i] + " x" + i + " ";
//                }
//                source += "\n\n" + "Subject To" + "\n";
//
//                for (i = 0; i < restricoes.length; i++) {
//                    source += "res_" + (i + 1) + ":";
//                    for (var j = 0; j < objetivo.length; j++) {
//                        source += (this.restricoes[i][j] >= 0) ? " +" : " ";
//                        source += this.restricoes[i][j] + " x" + j;
//                    }
//                    source += " " + this.relacoes[i] + " " + this.rhs[i];
//                    source += "\n";
//                }
//
//                source += "\nBounds\n";
//
//                for (i = 0; i < objetivo.length; i++) {
//                    var aux = this.upper[i].toString().toUpperCase();
//                    source += (aux === "INF") ? "x" + i + ">=" + this.lower[i] :
//                            this.lower[i] + "<=" + "x" + i + "<=" + this.upper[i];
//                    source += "\n";
//                }
//
//                source += "\nGenerals \n";
//
//                for (i = 0; i < this.objetivo.length; i++)
//                    source += "x" + i + "\n";
//
//                source += "\nEnd\n";
                /* var lp = glp_create_prob();
                 glp_read_lp_from_string(lp, null, source);
                 row = glp_get_num_rows(lp);
                 col = glp_get_num_cols(lp); */
                //alert(lp);
                //alert(col);
                //run(source);
            };

            reader.readAsText(file);

        } else {
            alert("Erro no Carregamento");
        }
    });
    //document.getElementById('start#sectionA').click();
};

////////////////////////////////////////////////////
//                FUNCOES DA ARVORE               //
////////////////////////////////////////////////////


//MAGIA DO ANDRE


////////////////////////////////////////////////////
//                FUNCOES AUXILIARES              //
////////////////////////////////////////////////////

// ??????????
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
//Esconde os botoes de controle da tabela
function hideFormProblema() {
    $('#addRow').hide('fast');
    $('#delRow').hide('fast');
    $('#executar').hide('fast');
    $('#passoAPasso').hide('fast');
    $('#salvar').hide('fast');
    $('#limpar').hide('fast');
}
