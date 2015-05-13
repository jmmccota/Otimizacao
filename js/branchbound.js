Nodo = function (id, pai, altura, modelo, z, x) {
    /* 
     * Classe que sera usada como elemento do heap.
     * Contem as informacoes necessarias para a execucao do metodo simplex
     * e as informacoes necessarias para desenha-lo na arvore.
     */

    this.id = id;
    this.pai = pai;
    this.altura = altura;
    this.problema = modelo["problema"];
    this.objetivo = modelo["objetivo"];
    this.restricoes = modelo["restricoes"];
    this.relacoes = modelo["relacoes"];
    this.rhs = modelo["rhs"];
    this.upper = modelo["upper"];
    this.lower = modelo["lower"];
    this.z = z;
    this.x = x;


    this.toSource = function () {
        var source = "";

        source = this.problema + '\n';
        source += "obj: ";
        for (var i = 0; i < this.objetivo.length; i++) {
            source += this.objetivo[i] >= 0 ? " +" : "";
            source += this.objetivo[i] + " x" + i + " ";
        }
        
        source += "\n\n" + "Subject To" + "\n";
        
        if(this.restricoes.length !== 0){
            for (i = 0; i < this.restricoes.length; i++) {
                source += "res_" + (i + 1) + ":";
                for (var j = 0; j < this.objetivo.length; j++) {
                    source += (this.restricoes[i][j] >= 0) ? " +" : " ";
                    source += this.restricoes[i][j] + " x" + j;
                }
                source += " " + this.relacoes[i] + " " + this.rhs[i];
            }
        } 
        else
            source += " +0 x0 = 0";
        source += "\n";
        

        source += "\nBounds\n";

        for (i = 0; i < this.objetivo.length; i++) {
            var aux = this.upper[i].toString().toUpperCase();
            source += (aux === "INF") ? "x" + i + ">=" + this.lower[i] :
                    this.lower[i] + "<=" + "x" + i + "<=" + this.upper[i];
            source += "\n";
        }

        source += "\nGenerals \n";

        for (i = 0; i < this.objetivo.length; i++)
            source += "x" + i + "\n";

        source += "\nEnd\n";

        return source;
    };
};


//////////////////////////////////////////////////////////////////////////////


Heap = function (nodo) {
    /*
     * Classe que sera usada como "arvore" para o metodo branch and bound.
     * h.array contem o vetor com o heap.
     * Obs: Indices do array comecam em 1.
     * Inicializa com Nodo como elemento raiz
     */

    this.array = new Array(0);
    this.array[1] = nodo;

    this.insereNodos = function (pai, esq, dir) {
        /*
         * pai eh o indice do elemento pai de esq e dir.
         * esq eh o nodo que sera o filho a esquerda de pai.
         * se esq for 'null' adiciona somente o elemento a direita.
         * dir eh o nodo que sera o filho a direita de pai.
         * se dir for 'null' adiciona somente o elemento a esquerda.
         */
        if (esq !== null) {
            esq.id = pai * 2;
            esq.pai = pai;
            esq.altura = this.array[pai].altura + 1;
            this.array[esq.id] = esq;
        }
        if (dir !== null) {
            dir.id = pai * 2 + 1;
            dir.pai = pai;
            dir.altura = this.array[pai].altura + 1;
            this.array[dir.id] = dir;
        }
    };
};


//////////////////////////////////////////////////////////////////////////////


BranchBound = function () {
    /*
     * Classe que controla a chamada do simplex
     * Usa um heap para simular a arvore de possibilidades
     */

    var modelo = leituraParametros();

    var nodo = new Nodo(1, 0, 0, modelo, 0, 0);
    this.heap = new Heap(nodo);
    this.atual = 1;
    this.fila = [1];

    this.terminou = function () {
        //se a fila de proximo nodo a analisar estiver vazia a execucao terminou
        return (this.fila.length == undefined || this.fila.length == 0);
    };

    this.proximoPasso = function (escolhaVariavel) {
        /*
         * escolhaVariavel eh uma funcao para escolher qual xi sofrera a bifurcacao.
         *     para executar normalmente se passa this.escolheVariavel.
         *     para executar passo a passo se passa uma funcao que retorna o indice
         *         do xi que o usuario escolheu.
         * executa uma iteracao do branch and bound:
         *     gera os proximos branchs e resolve o proximo da fila
         *     retorna o nodo que foi resolvido
         */

        //retira o 1o da fila
        var nodo = this.heap.array[this.fila.shift()];
        //atual = 1o da fila
        this.atual = nodo.id;
        //resolve o simplex
        var res = simplex(nodo);
        //completa o nodo
        nodo.x = res["x"];
        nodo.z = res["z"];

        //escolhe qual variavel vai sair
        var xi = escolhaVariavel(this);

        //se heap[atual].x[xi] for viavel e fracionario
        var x = this.heap.array[this.atual].x[xi];
        if (!isNaN(this.heap.array[this.atual].z) &&
                x !== Math.floor(x)) {

            //gera 2 copias do objeto
            var esq = jQuery.extend(true, {}, this.heap.array[this.atual]);
            var dir = jQuery.extend(true, {}, this.heap.array[this.atual]);

            //se possui solucao fracionaria altera o valor de Z
            if (this.heap.array[this.atual].problema === "Maximize")
                this.heap.array[this.atual].z = "-Inf";
            else
                this.heap.array[this.atual].z = "Inf";

            //adiciona restricao de heap[atual].x[xi] nos 2 modelos
            dir.lower[xi] = Math.ceil(x);
            esq.upper[xi] = Math.floor(x);

            //insere 2 nodos no heap e na fila
            this.heap.insereNodos(this.atual, esq, dir);
            this.fila.push(this.atual * 2);
            this.fila.push(this.atual * 2 + 1);
        }

        return nodo;
    };

    this.executar = function () {
        return this.proximoPasso(this.escolheVariavel);
    };

    this.escolheVariavel = function (b) {
        /*
         * Retorna o indice da variavel mais fracionaria do x do nodo atual
         */
        var x = b.heap.array[b.atual].x;

        var mini = 0;
        var minval = 1;

        //x.length retorna undefined
        var len = 0;
        while (x[len] !== undefined)
            len++;

        for (var i = 0; i < len; i++) {
            if (x[i] !== Math.floor(x[i])) {
                //Se for fracionario
                if (Math.abs(x[i] - Math.floor(x[i]) - 0.5) < minval) {
                    mini = i;
                    minval = Math.abs(x[i] - Math.floor(x[i]) - 0.5);
                }
            }
        }
        return mini;
    };

    this.melhorSolucao = function () {
        /*
         * retorna o nodo com maior/menor Z
         * retorna null caso nao haja solucao inteira viavels
         */

        //procura a 1a solucao inteira viavel
        //    se nao houver nenhuma retorna null
        //    se encontrar seta como otima
        var i = 1;
        while (i<=this.heap.array.length){
            if (i == this.heap.array.length)
                return null;
            else if(isNaN(this.heap.array[i].z))
                i++;
            else
                break;
        }

        var otim = this.heap.array[i];

        //para cada solucao
        for (nodo in this.heap.array) {
            //se solucao eh viavel
            if (!isNaN(nodo.z)) {
                //e for melhor que a otima
                if (nodo.problema === "Maximize" && nodo.z > otim.z ||
                        nodo.problema === "Minimize" && nodo.z < otim.z)
                    // passa a ser a nova otima
                    otim = nodo;
            }
        }

        return otim;
    };
};


////////////////////////////////////////////////////
//                FUNCOES AUXILIARES              //
////////////////////////////////////////////////////


simplex = function (Nodo) {
    /*
     * Funcao que chama o GLPK e o resolve o simplex para o 
     * modelo de um determinado nodo
     */

    var source = Nodo.toSource();

    var lp = glp_create_prob();
    glp_read_lp_from_string(lp, null, source);

    glp_scale_prob(lp, GLP_SF_AUTO);

    //    if (glp_get_num_int(lp) === 0 && glp_get_num_bin(lp) === 0) {

    var smcp = new SMCP({ presolve: GLP_ON });
    var r = glp_simplex(lp, smcp);

    if (r === 0) {
        //Caso tenha encontrado uma solucao otima
        //alert("Solução Ótima encontrada por Simplex");
        var z = glp_get_obj_val(lp);
        var x = [];
        for (var i = 0; i < glp_get_num_cols(lp) ; i++) {
            x[i] = glp_get_col_prim(lp, i + 1);
        }
        return {
            z: z,
            x: x
        };
    }
    else {
        //Caso tenha acontecido algum erro
        var z = "";
        switch (r) {
            case GLP_EBADB:
                z = "Número de variáveis básicas não é o mesmo que o número de linhas do objeto do problema. ";
                break;

            case GLP_ESING:
                z = "O modelo contém apenas uma matriz base dentro do modelo. ";
                break;

            case GLP_ECOND:
                z = "Número de condição muito grande para a matriz base inicial. ";
                break;

            case GLP_EBOUND:
                z = "Variáveis limitadas reais com limites incorretos. ";
                break;

            case GLP_EFAIL:
                z = "A busca da resposta foi encerrada devido a falha do solver. ";
                break;

            case GLP_EOBJLL:
                z = "A função objetivo que era pra ser maximizada atingiu seu menor valor e continua diminuindo. ";
                break;

            case GLP_EOBJUL:
                z = "A função objetivo que era pra ser minimizada atingiu seu maior valor e continua aumentando. ";
                break;

            case GLP_EITLIM:
                z = "A iteração do simplex excedeu o limite. ";
                break;

            case GLP_ETMLIM:
                z = "O tempo limite foi excedido. ";
                break;

            case GLP_ENOPFS:
                z = "Não tem solução viável primal. ";
                break;

            case GLP_ENODFS:
                z = "Não tem solução viável dual. ";
        }

        return {
            z: z,
            x: []
        };
    }
};


verificaTabela = function () {
    var bool;
    $(".fObj").each(function () {
        bool = $(this).val() == '';
    });
    $(".xRest").each(function () {
        bool = $(this).val() == '';
    });
    $(".relacao").each(function () {
        bool = $(this).val() == '';
    });
    $(".ladoDir").each(function () {
        bool = $(this).val() == '';
    });
    $(".limSup").each(function () {
        bool = $(this).val() == '';
    });
    $(".limInf").each(function () {
        bool = $(this).val() == '';
    });

    return bool;
}


leituraParametros = function () {
    /*
     * Le os dados informados na tabela de entrada e deixa no formato utilizado
     * em Nodo.
     */
    var problema = document.getElementById("problema").value;

    var objetivo = [];
    var restricoes = [];
    var relacoes = [];
    var rhs = [];
    var upper = [];
    var lower = [];

    //Pegando dados da Tabela
    $(".fObj").each(function () {
        objetivo.push(parseFloat($(this).val()));
    });

    var i = 0;
    var nRest = 0;
    var nVar = objetivo.length;
    restricoes[0] = [];
    $(".xRest").each(function () {
        restricoes[nRest].push(parseFloat($(this).val()));
        i++;
        if (i === nVar) {
            i = 0;
            nRest++;
            restricoes[nRest] = [];
        }
    });
    restricoes.pop();

    $(".relacao").each(function () {
        relacoes.push($(this).val());
    });
    $(".ladoDir").each(function () {
        rhs.push(parseFloat($(this).val()));
    });
    $(".limSup").each(function () {
        upper.push($(this).val());
    });
    $(".limInf").each(function () {
        lower.push(parseFloat($(this).val()));
    });

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
