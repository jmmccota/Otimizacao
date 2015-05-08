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
            source += "res_" + (i+1) + ":";
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

    //EXCLUIR ?????
    this.insereModelos = function (pai, mEsq, mDir) {
        /*
         * pai eh o indice do elemento pai de esq e dir.
         * esq eh o modelo que sera o filho a esquerda de pai.
         * se esq for 'null' adiciona somente o elemento a direita.
         * dir eh o modelo que sera o filho a direita de pai.
         * se dir for 'null' adiciona somente o elemento a esquerda.
         */
        
        if (mEsq != null){
            var esq = Nodo(pai*2, pai, array[pai].altura+1, mEsq, 0, 0);
            this.array[esq.id] = esq;
        }
        if (mDir != null){
            var dir = Nodo(pai*2+1, pai, array[pai].altura+1, mDir, 0, 0);
            this.array[dir.id] = dir;
        }
    };

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

    this.busca = function (nodo) {
        /*
         * Retorna o indice em que o objeto 'nodo' esta no heap.
         * Retorna 0 caso nao esteja.
         * 
         * SUBSTITUIR POR INDEX OF ?????
         * 
         */
        for (var i = 1; i < this.array.length; i++)
            if (i in this.array && this.array[i] === nodo)
                return i;
        return 0;
    };

    this.substitui = function (velho, novo) {
        /*
         * Substitui o objeto 'velho' pelo objeto 'novo'.
         */
        var indice = this.busca(velho);
        if (indice !== 0)
            this.array[indice] = novo;
    };

    this.getPai = function (nodo) {
        /*
         * Nodo e o indice de um elemento
         * Retorna o indice do pai do elemento
         */
        return Math.floor(nodo / 2);
    };

    return this;
};

BranchBound = function () {
    /*
     * Classe que controla a chamada do simplex
     * Usa um heap para simular a arvore de possibilidades
     */


    this.inicializa = function () {
        /*
         * "Construtor" da classe BranchBound
         * Resolve o simplex para o modelo inicial e retorna o nodo
         */
        var modelo = leituraParametros();

        var nodo = Nodo(1, 1, 0, modelo, 0, 0);
        this.heap = Heap(nodo);
        this.atual = 1;
        this.fila = [];
        
        var res = simplex(this.heap.array[1]);

        this.heap.array[1].z = res['z'];
        this.heap.array[1].x = res['x'];

        return this.heap.array[1];
    };

    this.terminou = function () {
        //se a fila de proximo nodo a analisar estiver vazia a execucao terminou
        return heap.fila === [];
    };

    this.proximoPasso = function (xi) {
        /*
         * xi eh o id do x que sera alterado
         * executa uma iteracao do branch and bound:
         *     gera os proximos branchs e resolve o proximo da fila
         *     retorna o nodo que foi resolvido
         */
        //se heap[atual].x[xi] for fracionario
        var x = heap.array[atual].x[xi];
        if (x != Math.floor(x)) {
            //adiciona restricao de heap[atual].x[xi], gerando 2 modelos
            if(heap.array[atual].problema == "Maximize")
                heap.array[atual].z = "-Inf";
            else
                heap.array[atual].z = "Inf";
            var esq = jQuery.extend(true, {}, heap.array[atual]);
            var dir = jQuery.extend(true, {}, heap.array[atual]);
            
            dir.lower[xi] = Math.ceil(x);
            esq.upper[xi] = Math.floor(x);
            
            //insere 2 nodos no heap e na fila
            heap.insereNodos(atual, esq, dir);
            fila.push(atual * 2);
            fila.push(atual * 2 + 1);
        }

        var nodo = null;

        //se nao terminou
        if (!terminou()) {
            //retira o 1o da fila
            nodo = heap.array[fila.shift()];
            //atual = 1o da fila
            atual = nodo.id;
            //resolve o simplex
            var res = simplex(nodo);
            //completa o nodo e retorna
            nodo.x = res["x"];
            nodo.z = res["z"];
        }

        return nodo;
    };

    this.passoAPasso = function () {
        //le variavel q o usuario clicou
        return proximoPasso(/*indice do x q o usuario escolheu*/);
    };
    
    this.executar = function (){
        return proximoPasso(escolheVariavel(heap.array[atual].x));
    };

    this.escolheVariavel = function (x) {
        /*
         * Retorna o indice da variavel mais fracionaria de x
         */
        var mini = 0;
        var minval = 1;
        for (var i = 0; i < x.lenght; i++) {
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
    
    this.melhorSolucao = function (){
        //retornar o nodo com maior/menor Z se numero
        var otimVal = heap.array[1].z;
        var otimi = 1;
        for(var i = 2; i<heap.array.length; i++){
            if(heap.array[1].problema === 'Maximize' && 
               !isNaN(heap.array[i].z) &&
               heap.array[i].z > otimVal){
                otimVal= heap.array[i].z;
                otimi = i;
            }
            else if(heap.array[1].problema === 'Minimize' &&
                    !isNaN(heap.array[i].z) &&
                    heap.array[i].z < otimVal){
                otimVal= heap.array[i].z;
                otimi = i;
            }
        }
        return heap.array[otimi];
    };

    return this;
};

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
        switch (r) {
            case GLP_EBADB:
                alert("Número de variáveis básicas não é o mesmo que o número de linhas do objeto do problema. ");
                break;

            case GLP_ESING:
                alert("O modelo contém apenas uma matriz base dentro do modelo. ");
                break;

            case GLP_ECOND:
                alert("Número de condição muito grande para a matriz base inicial. ");
                break;

            case GLP_EBOUND:
                alert("Variáveis limitadas reais com limites incorretos. ");
                break;

            case GLP_EFAIL:
                alert("A busca da resposta foi encerrada devido a falha do solver. ");
                break;

            case GLP_EOBJLL:
                alert("A função objetivo que era pra ser maximizada atingiu seu menor valor e continua diminuindo. ");
                break;

            case GLP_EOBJUL:
                alert("A função objetivo que era pra ser minimizada atingiu seu maior valor e continua aumentando. ");
                break;

            case GLP_EITLIM:
                alert("A iteração do simplex excedeu o limite. ");
                break;

            case GLP_ETMLIM:
                alert("O tempo limite foi excedido. ");
                break;

            case GLP_ENOPFS:
                alert("Não tem solução viável primal. ");
                break;

            case GLP_ENODFS:
                alert("Não tem solução viável dual. ");
        }

        return {z: "erro",
            x: []};
    }
//    }
    /*else {
     
     var iocp = new IOCP({presolve: GLP_ON});
     r = glp_intopt(lp, iocp);
     if (r === 0) {
     alert("Solução Ótima encontrada por método Branch-and-Cut");
     z = glp_mip_obj_val(lp);
     x = [];
     for (var i = o; i < glp_get_num_cols(lp); i++) {
     alert(glp_mip_col_val(lp, i));
     }
     }
     else {
     
     switch (r) {
     
     case GLP_EBOUND:
     alert("Algumas variáveis reais ou inteiras estão com os limites incorretos. ");
     case GLP_EROOT:
     alert("Base ideal para o problema de PL não é fornecido. ");
     
     case GLP_ENOPFS:
     alert("Não tem solução viável primal. ");
     
     case GLP_ENODFS:
     alert("Não tem solução viável dual, há pelo menos uma solução viável primitiva, a solução é ilimitada. ");
     
     case GLP_EFAIL:
     alert("Falha do solver. ");
     
     case GLP_EMIPGAP:
     alert("");
     
     case GLP_ETMLIM:
     alert("");
     
     case GLP_ESTOP:
     alert("");
     }
     }
     }*/
};

leituraParametros = function () {
    /*
     * Le as informacoes da pagina de entrada de dados
     */
//    
//     //Determinando qtd de variaveis e restricoes
//     var nvariaveis = $('#variaveis').val();
//     var nrestricoes;
//     for (i = 1; i <= 100; i++) {
//     if ($("x" + i + "0").length)
//     nrestricoes = i;
//     else
//     break;
//     }
//     
//     //Lendo dados do modelo
//     problema = $('problema').val();
//     objetivo = [];
//     restricoes = [];
//     relacoes = [];
//     rhs = [];
//     upper = [];
//     lower = [];
//     for (i = 0; i < nvariaveis; i++) {
//     
//     objetivo[i] = $('x0' + i).val();
//     
//     for (j = 0; j < nrestricoes; j++) {
//     restricoes[j] = [];
//     restricoes[j][i] = $('x' + (j+1) + i).val();
//     
//     relacoes[j] = $('relacao' + (j+1)).val();
//     
//     rhs[j] = $('ladoDir' + (j+1)).val();
//     }
//     
//     upper[i] = $('limSupx' + i).val();
//     lower[i] = $('limInfx' + i).val();
//     }
//     
//     //retornando modelo [formato gurobi]
//     return {
//     problema: problema,
//     objetivo: objetivo,
//     restricoes: restricoes,
//     relacoes: relacoes,
//     rhs: rhs,
//     upper: upper,
//     lower: lower
//     };
//     
    return {
        problema: 'Maximize',
        objetivo: [4, -1],
        restricoes: [[7, -2], [0, 1], [2, -2]],
        relacoes: ['<=', '<=', '<='],
        rhs: [14, 3, 3],
        upper: ['Inf', 'Inf'],
        lower: [0, 0]
    };
};

$('#salvar').bind('click', function () {
    try {
        var source = "";
        source = Nodo(0, 0, 0, leituraParametros(), 0, 0).toSource();
        var blob = new Blob([source], {type: "application/octet-stream;charset=utf-8"});
        saveAs(blob, "modelo.txt");
    } catch (err) {
        console.write("biblioteca faltante, FileSaver.js")
    }
});
