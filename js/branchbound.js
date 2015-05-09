Nodo = function (id, pai, altura, modelo, z, x) {
    /* 
     * Classe que sera usada como elemento do heap.
     * Contem as informacoes necessarias para a execucao do metodo simplex
     * e as informacoes necessarias para desenha-lo na arvore.
     * ...
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

        for (i = 0; i < restricoes.length; i++) {
            source += "res_" + (i + 1) + ":";
            for (var j = 0; j < objetivo.length; j++) {
                source += (this.restricoes[i][j] >= 0) ? " +" : " ";
                source += this.restricoes[i][j] + " x" + j;
            }
            source += " " + this.relacoes[i] + " " + this.rhs[i];
            source += "\n";
        }

        source += "\nBounds\n";

        for (i = 0; i < objetivo.length; i++) {
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

    return this;
};


//////////////////////////////////////////////////////////////////////////////


Heap = function (nodo) {
    /*
     * Classe que sera usada como "arvore" para o metodo branch and bound.
     * this.array contem o vetor com o heap.
     * Obs: Indices do array comecam em 1.
     * ...
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
        if (esq != null) {
            esq.id = pai * 2;
            esq.pai = pai;
            esq.altura = this.array[pai].altura + 1;
            this.array[esq.id] = esq;
        }
        if (dir != null) {
            dir.id = pai * 2 + 1;
            dir.pai = pai;
            dir.altura = this.array[pai].altura + 1;
            this.array[dir.id] = dir;
        }
    };

    return this;
};


//////////////////////////////////////////////////////////////////////////////


BranchBound = function () {
    /*
     * Classe que controla a chamada do simplex
     * Usa um heap para simular a arvore de possibilidades
     */
    var modelo = leituraParametros();

    var nodo = Nodo(1, 1, 0, modelo, 0, 0);
    this.heap = Heap(nodo);
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
        nodo = this.heap.array[fila.shift()];
        //atual = 1o da fila
        this.atual = nodo.id;
        //resolve o simplex
        var res = simplex(nodo);
        //completa o nodo
        nodo.x = res["x"];
        nodo.z = res["z"];

        //escolhe qual variavel vai sair
        xi = escolhaVariavel();

        //se heap[atual].x[xi] for viavel e fracionario
        var x = this.heap.array[atual].x[xi];
        if (!isNaN(this.heap.array[atual].z) &&
                x !== Math.floor(x)) {

            //gera 2 copias do objeto
            var esq = jQuery.extend(true, {}, this.heap.array[atual]);
            var dir = jQuery.extend(true, {}, this.heap.array[atual]);

            //se possui solucao fracionaria altera o valor de Z
            if (this.heap.array[atual].problema === "Maximize")
                this.heap.array[atual].z = "-Inf";
            else
                this.heap.array[atual].z = "Inf";

            //adiciona restricao de heap[atual].x[xi] nos 2 modelos
            dir.lower[xi] = Math.ceil(x);
            esq.upper[xi] = Math.floor(x);

            //insere 2 nodos no heap e na fila
            this.heap.insereNodos(atual, esq, dir);
            this.fila.push(atual * 2);
            this.fila.push(atual * 2 + 1);
        }

        return nodo;
    };

    this.passoAPasso = function () {
        //le variavel q o usuario clicou
        return proximoPasso(/*indice do x q o usuario escolheu*/);
    };

    this.executar = function () {
        return proximoPasso(this.escolheVariavel);
    };

    this.escolheVariavel = function () {
        /*
         * Retorna o indice da variavel mais fracionaria do x do nodo atual
         */
        x = this.heap.array[this.atual].x;
        
        var mini = 0;
        var minval = 1;

        //x.length retorna undefined
        len = 0;
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
        var i = 0;
        while(this.heap.array[i] === undefined ||
              isNaN(this.heap.array[i].z))
            i++;
        if(i > this.heap.array.length)
            return null;
        
        var otim = this.heap.array[i];
        
        //para cada solucao
        for(nodo in this.heap.array){
            //se solucao eh viavel
            if(!isNaN(nodo.z)){
                //e for melhor que a otima
                if(nodo.problema === "Maximize" && nodo.z > otim.z ||
                   nodo.problema === "Minimize" && nodo.z < otim.z)
                    // passa a ser a nova otima
                    otim = nodo;
            }
        }
        
        return otim;
    };

    return this;
};


//////////////////////////////////////////////////////////////////////////////


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

    var smcp = new SMCP({presolve: GLP_ON});
    var r = glp_simplex(lp, smcp);

    if (r === 0) {
        //Caso tenha encontrado uma solucao otima
        //alert("Solução Ótima encontrada por Simplex");
        var z = glp_get_obj_val(lp);
        var x = [];
        for (var i = 0; i < glp_get_num_cols(lp); i++) {
            x[i] = glp_get_col_prim(lp, i + 1);
        }
        return {z: z,
            x: x};
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

        return {z: z,
            x: []};
    }
};

leituraParametros = function () {
    var contObj = 0;
    var contRel = 0;
    var contRhs = 0;
    var contUp = 0;
    var contLow = 0;
    var contRes = 0;

    var problema = document.getElementById("problema").value;

    objetivo = [];
    restricoes = [];
    relacoes = [];
    rhs = [];
    upper = [];
    lower = [];

    //Pegando dados da Tabela
    $(".fObj").each(function () {
        objetivo[contObj] = $(this).val();
        contObj++;
    });
    $(".xRest").each(function () {
        restricoes[contRes] = $(this).val();
        contRes++;
    });
    $(".relacao").each(function () {
        relacoes[contRel] = $(this).val();
        contRel++;
    });
    $(".ladoDir").each(function () {
        rhs[contRhs] = $(this).val();
        contRhs++;
    });
    $(".limSup").each(function () {
        upper[contUp] = $(this).val();
        contUp++;
    });
    $(".limInf").each(function () {
        lower[contLow] = $(this).val();
        contLow++;
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

$('#salvar').bind('click', function () {
    try {
        var source = "";
        source = Nodo(0, 0, 0, leituraParametros(), 0, 0).toSource();
        var blob = new Blob([source], { type: "application/octet-stream;charset=utf-8" });
        saveAs(blob, "modelo.txt");
    } catch (err) {
        console.write("biblioteca faltante, FileSaver.js")
    }
});
