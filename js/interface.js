$('#executar').bind('click', function(){
    solver = BranchBound(leituraParametros());
    solver.executar();
});


leituraParametros = function(){
    //Determinando qtd de variaveis e restricoes
    var nvariaveis = $('#variaveis').val();
    var nrestricoes;
    for(i = 1; i <= 100; i++){
        if($("x" + i + "0").length)
            nrestricoes = i;
        else
            break;
    }
    
    //Lendo dados do modelo
    problema = $('problema').val();
    objetivo = [];
    restricoes = [];
    relacoes = [];
    rhs = [];
    upper = [];
    lower = [];
    for(i = 0; i < nvariaveis; i++){
        
        objetivo[i] = $('x0' + i).val();
        
        for(j = 1; j <= nrestricoes; j++){
            restricoes[j] = [];
            if(!isNaN($('x' + j + i).val()))
                restricoes[j][i] =  $('x' + j + i).val();
            else{
                alert("Restricoes devem conter somente numeros");
                return;
            }
            
            relacoes[j] = $('relacao' + j).val();
            
            rhs[j] = $('ladoDir' + j).val();
        }
        
        upper[i] = $('limSupx' + i).val();
        lower[i] = $('limInfx' + i).val();
    }
    
    return {
        problema: problema,
        objetivo: objetivo,
        restricoes: restricoes,
        relacoes: relacoes,
        rhs: rhs,
        upper: upper,
        lower: lower
    };
};

$(function () {

    $(document).ready(function () {

        var start;
        var logNode = document.getElementById("log");
        var log = glp_print_func = function (value) {
            var now = new Date();
            var d = (now.getTime() - start.getTime()) / 1000;
            logNode.appendChild(document.createTextNode(value + "\n"));
            if (d > 60)
                throw new Error("timeout");
            console.log(value);
        };


        function run(source) {

            start = new Date();
            logNode.innerText = "";
            var lp = glp_create_prob();
            glp_read_lp_from_string(lp, null, source);

            glp_scale_prob(lp, GLP_SF_AUTO);

            if (glp_get_num_int(lp) == 0 && glp_get_num_bin(lp) == 0) {

                var smcp = new SMCP({presolve: GLP_ON});
                r = glp_simplex(lp, smcp);

                if (r == 0) {
                    log("Solução Ótima encontrada por Simplex");
                    log("obj = " + glp_get_obj_val(lp));
                    for (var i = 1; i <= glp_get_num_cols(lp); i++) {
                        log(glp_get_col_name(lp, i) + " = " + glp_get_col_prim(lp, i));
                    }
                }
                else {
                    switch (r) {
                        case GLP_EBADB:
                            log("Número de variáveis básicas não é o mesmo que o número de linhas do objeto do problema. ");
                            break;

                        case GLP_ESING:
                            log("O modelo contém apenas uma matriz base dentro do modelo. ");
                            break;

                        case GLP_ECOND:
                            log("Número de condição muito grande para a matriz base inicial. ");
                            break;

                        case GLP_EBOUND:
                            log("Variáveis limitadas reais com limites incorretos. ");
                            break;

                        case GLP_EFAIL:
                            log("A busca da resposta foi encerrada devido a falha do solver. ");
                            break;

                        case GLP_EOBJLL:
                            log("A função objetivo que era pra ser maximizada atingiu seu menor valor e continua diminuindo. ");
                            break;

                        case GLP_EOBJUL:
                            log("A função objetivo que era pra ser minimizada atingiu seu maior valor e continua aumentando. ");
                            break;

                        case GLP_EITLIM:
                            log("A iteração do simplex excedeu o limite. ");
                            break;

                        case GLP_ETMLIM:
                            log("O tempo limite foi excedido. ");
                            break;

                        case GLP_ENOPFS:
                            log("Não tem solução viável primal. ");
                            break;

                        case GLP_ENODFS:
                            log("Não tem solução viável dual. ");
                            break;

                    }
                }

            } else {

                var iocp = new IOCP({presolve: GLP_ON});
                r = glp_intopt(lp, iocp);
                if (r == 0) {
                    log("Solução Ótima encontrada por método Branch-and-Cut");
                    log("obj = " + glp_mip_obj_val(lp));
                    for (var i = 1; i <= glp_get_num_cols(lp); i++) {
                        log(glp_get_col_name(lp, i) + " = " + glp_mip_col_val(lp, i));
                    }
                }
                else {

                    switch (r) {

                        case GLP_EBOUND:
                            log("Algumas variáveis reais ou inteiras estão com os limites incorretos. ");
                        case GLP_EROOT:
                            log("Base ideal para o problema de PL não é fornecido. ");

                        case GLP_ENOPFS:
                            log("Não tem solução viável primal. ");

                        case GLP_ENODFS:
                            log("Não tem solução viável dual, há pelo menos uma solução viável primitiva, a solução é ilimitada. ");

                        case GLP_EFAIL:
                            log("Falha do solver. ");

                        case GLP_EMIPGAP:
                            log("");

                        case GLP_ETMLIM:
                            log("");

                        case GLP_ESTOP:
                            log("");

                    }
                }
            }
        }

        function $_GET(q) {
            loc = window.location.href.toString();
            qS = loc.substring(loc.indexOf('?') + 1, loc.length);
            sqS = qS.split('&');
            fGV = sqS;
            rA = new Array();
            for (i = 0; i < fGV.length; i++) {
                nowEd = fGV[i];
                ioE = nowEd.indexOf('=');
                a = nowEd.substring(0, ioE);
                d = nowEd.substring(ioE + 1, nowEd.length);
                rA[a] = d;
            }
            return rA[q];
        }


        $('#confirmar').bind('click', function () {
            $("form:eq(0)").submit();
        });

        $('#resetar').bind('click', function () {
            var novaURL = "wsorp.php";
            $(window.document.location).attr('href', novaURL);
        });

        $('#sol').bind('click', function () {

        });

        function AbreArquivo(arq) {
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
            var fileInput = document.getElementById('loadFile');
            fileInput.addEventListener('change', function (e) {
                var file = fileInput.files[0];
                var textType = /text.*/;

                if (file.type.match(textType)) {
                    var reader = new FileReader();


                    reader.onload = function (e) {

                        source = reader.result;
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
        };

        function download(filename, text) {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);
            pom.click();
        }

        $('#save').bind('click', function () {
            var i, j;
            var objetivo = [];
            var restricoes = [];
            var lower = [];
            var upper = [];

            var variaveis = $_GET("variaveis");
            var tipo = $_GET("operacao");
            var restricoesGet = $_GET("restricoes");

            var source = "";

            //-------------Funcao Objetivo------------//
            i = 0;
            $(".obj td").each(function (index, element) {
                if (i < variaveis) {
                    objetivo[i] = $(this).text();
                    i++;
                }
            });
            //--------------------------------------//

            //-------------Restricoes--------------//
            i = 0;
            j = 0;
            $(".res").each(function (index, element) {
                var $this = $(this);
                var $item = $this.find("td");
                restricoes[i] = [];
                $.each($item, function (n, e) {
                    var valor = $(this).text()
                    if (!isNaN($(this).text())) {
                        restricoes[i][j] = $(this).text();
                    } else {
                        restricoes[i][j] = $(this).find("#magiclist").val();
                    }
                    j++;
                });
                i++;
                j = 0;
            });
            //-----------------------------------//

            //-----------Lower Bound-------------//
            i = 0;
            $(".lower td").each(function (index, element) {
                if (i < variaveis) {
                    lower[i] = $(this).text();
                    i++;
                }
            });

            //----------------------------------//


            //-----------Upper Bound-------------//
            i = 0;
            $(".upper td").each(function (index, element) {
                if (i < variaveis) {
                    upper[i] = $(this).text();
                    i++;
                }
            });

            //----------------------------------//

            //----------Funcao Source-----------//

            source = tipo + "\n";
            source += "obj: ";
            for (i = 0; i < variaveis; i++) {
                source += (objetivo[i] >= 0) ? " + " + objetivo[i] + " x" + (i + 1) : objetivo[i] + " x" + (i + 1);
            }
            source += "\n\n" + "Subject To" + "\n";

            for (i = 0; i < restricoesGet; i++) {
                source += "res_" + (i + 1) + ": ";
                for (j = 0; j < variaveis; j++) {
                    source += (restricoes[i][j] >= 0) ? " + " + restricoes[i][j] + " x" + (j + 1) : restricoes[i][j] + " x" + (j + 1);
                }
                source += " " + restricoes[i][j] + " " + restricoes[i][j + 1];
                source += "\n";
            }

            source += "\nBounds\n";

            for (i = 0; i < variaveis; i++) {
                source += (upper[i] == "inf") ? "x" + (i + 1) + ">=0" : lower[i] + "<=" + "x" + (i + 1) + "<=" + upper[i];
                source += "\n";
            }

            source += "\nGenerals \n";

            for (i = 0; i < variaveis; i++)
                if ($('TipoVar' + i).val() == 'Real')
                    source += "x" + (i + 1) + "\n";

            source += "\nBinaries \n";

            for (i = 0; i < variaveis; i++)
                if ($('TipoVar' + i).val() == 'Binaria')
                    source += "x" + (i + 1) + "\n";

            source += "\nend";
            download('test.txt', source);

        });

        $('#run').bind('click', function () {

            var i, j;
            var objetivo = [];
            var restricoes = [];
            var lower = [];
            var upper = [];

            var variaveis = $_GET("variaveis");
            var tipo = $_GET("operacao");
            var restricoesGet = $_GET("restricoes");

            var source = "";

            //-------------Funcao Objetivo------------//
            i = 0;
            $(".obj td").each(function (index, element) {
                if (i < variaveis) {
                    objetivo[i] = $(this).text();
                    i++;
                }
            });
            //--------------------------------------//

            //-------------Restricoes--------------//
            i = 0;
            j = 0;
            $(".res").each(function (index, element) {
                var $this = $(this);
                var $item = $this.find("td");
                restricoes[i] = [];
                $.each($item, function (n, e) {
                    var valor = $(this).text();
                    if (!isNaN($(this).text())) {
                        restricoes[i][j] = $(this).text();
                    } else {
                        restricoes[i][j] = $(this).find("#magiclist").val();
                    }
                    j++;
                });
                i++;
                j = 0;
            });
            //-----------------------------------//

            //-----------Lower Bound-------------//
            i = 0;
            $(".lower td").each(function (index, element) {
                if (i < variaveis) {
                    lower[i] = $(this).text();
                    i++;
                }
            });

            //----------------------------------//


            //-----------Upper Bound-------------//
            i = 0;
            $(".upper td").each(function (index, element) {
                if (i < variaveis) {
                    upper[i] = $(this).text();
                    i++;
                }
            });

            //----------------------------------//

            //----------Funcao Source-----------//

            source = tipo + "\n";
            source += "obj: ";
            for (i = 0; i < variaveis; i++) {
                source += (objetivo[i] >= 0) ? " + " + objetivo[i] + " x" + (i + 1) : objetivo[i] + " x" + (i + 1);
            }
            source += "\n\n" + "Subject To" + "\n";

            for (i = 0; i < restricoesGet; i++) {
                source += "res_" + (i + 1) + ": ";
                for (j = 0; j < variaveis; j++) {
                    source += (restricoes[i][j] >= 0) ? " + " + restricoes[i][j] + " x" + (j + 1) : restricoes[i][j] + " x" + (j + 1);
                }
                source += " " + restricoes[i][j] + " " + restricoes[i][j + 1];
                source += "\n";
            }

            source += "\nBounds\n";

            for (i = 0; i < variaveis; i++) {
                source += (upper[i] == "inf") ? "x" + (i + 1) + ">=0" : lower[i] + "<=" + "x" + (i + 1) + "<=" + upper[i];
                source += "\n";
            }

            source += "\nGenerals \n";

            for (i = 0; i < variaveis; i++)
                if (document.getElementById('TipoVar' + i).value == 'Inteira')
                    source += "x" + (i + 1) + "\n";

            source += "\nBinaries \n";

            for (i = 0; i < variaveis; i++)
                if (document.getElementById('TipoVar' + i).value == 'Binaria')
                    source += "x" + (i + 1) + "\n";

            source += "\nend";
            var str = source;
            var pos = str.indexOf("undefined");
            if (pos == -1) {
                run(source);
            }
            else {
                alert("Apenas Números são Aceitos!!!");
            }
        });
    });
});

