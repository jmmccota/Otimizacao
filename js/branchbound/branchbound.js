__global__executando__ = "branchbound";

Nodo = function (id, pai, altura, modelo, z, x) {
    /* 
     * Classe que sera usada como elemento do heap.
     * Contem as informacoes necessarias para a execucao do metodo simplex
     * e as informacoes necessarias para desenha-lo na arvore.
     */

    this.numero = 0;
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
    this.otimo = false;


    this.toSource = function () {
        var source = "";

        source = this.problema + '\n';
        source += "obj: ";
        for (var i = 0; i < this.objetivo.length; i++) {
            source += this.objetivo[i] >= 0 ? " +" : "";
            source += this.objetivo[i] + " x" + i + " ";
        }

        source += "\n\n" + "Subject To" + "\n";

        if (this.restricoes.length !== 0) {
            for (i = 0; i < this.restricoes.length; i++) {
                source += "Restricao" + (i + 1) + ":";
                for (var j = 0; j < this.objetivo.length; j++) {
                    source += (this.restricoes[i][j] >= 0) ? " +" : " ";
                    source += this.restricoes[i][j] + " x" + j;
                }
                source += " " + this.relacoes[i] + " " + this.rhs[i];
                source += "\n";
            }
        }
        else
            source += " +0 x0 = 0\n";


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

    this.modelo = function () {
        var source = "";

        if (this.problema === "Maximize")
            source = 'Maximizar';
        else if (this.problema === "Minimize")
            source = 'Minimizar';
        source += "\n`z = ";
        var primeiro = true;
        for (var i = 0; i < this.objetivo.length; i++) {
            if (this.objetivo[i] == 0)
                continue;
            if (!primeiro)
                source += (this.objetivo[i] > 0) ? " + " : " ";
            else
                primeiro = false;
            source += (this.objetivo[i] == 1) ?
                        (" x_" + (i + 1) + " ") :
                        ((this.objetivo[i] == -1) ?
                            (" -x_" + (i + 1) + " ") :
                            this.objetivo[i] + "x_" + (i + 1) + " ");
        }
        source += "`";

        source += "\n" + "Sujeito a:" + "\n";

        if (this.restricoes.length !== 0) {
            for (i = 0; i < this.restricoes.length; i++) {
                var primeiro = true;
                source += "`";
                for (var j = 0; j < this.objetivo.length; j++) {
                    if (this.restricoes[i][j] == 0)
                        continue;
                    if (!primeiro)
                        source += (this.restricoes[i][j] > 0) ? " + " : " ";
                    else
                        primeiro = false;
                    source += (this.restricoes[i][j] == 1) ?
                                (" x_" + (j + 1) + " ") :
                                ((this.restricoes[i][j] == -1) ?
                                    (" -x_" + (j + 1) + " ") :
                                    this.restricoes[i][j] + "x_" + (j + 1) + " ");
                }
                source += this.relacoes[i] + " " + this.rhs[i];
                source += "`\n";
            }
        }

        for (i = 0; i < this.objetivo.length; i++) {
            source += "`";
            var aux = this.upper[i].toString().toUpperCase();
            if (this.upper[i] == this.lower[i])
                source += "x" + (i + 1) + "=" + this.lower[i];
            else
                source += (aux === "INF") ? "x" + (i + 1) + ">=" + this.lower[i] :
                        this.lower[i] + "<=" + "x_" + (i + 1) + "<=" + this.upper[i];
            source += "`\n";
        }
		
		if(this.objetivo.length > 0){
			source += "`";
		}
		for (i = 0; i < this.objetivo.length; i++) {
			source += 'x_' + (i+1);
			if(i != this.objetivo.length-1){
				source += ', ';
			}
		}
		if(this.objetivo.length > 0){
			source += " \in \mathbb{Z}`";
		}
        //MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

        return source.replace(/\n/g, '<br>');
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
    this.contador = 1;
    nodo.numero = 1;
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
            this.contador++;
            esq.numero = this.contador;
            this.array[esq.id] = esq;
        }
        if (dir !== null) {
            dir.id = pai * 2 + 1;
            dir.pai = pai;
            dir.altura = this.array[pai].altura + 1;
            this.contador++;
            dir.numero = this.contador;
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
    
    this.melhor = "";
    this.exec = [];

    this.resolveRaiz = function () {
        var nodo = new Nodo(1, 0, 0, leituraParametros(2), 0, 0);
        this.heap = new Heap(nodo);
        this.borda = [];

        //resolve o simplex
        var res = simplex(nodo);
        //completa o nodo
        nodo.x = res["x"];
        //remocao de erro de ponto flutuante
        for (var i = 0; i < nodo.x.length; i++)
            if(nodo.x[i] < Math.round(nodo.x[i]) + 0.0000000001 && nodo.x[i] > Math.round(nodo.x[i]) - 0.0000000001)
                nodo.x[i] = Math.round(nodo.x[i]);
        nodo.z = res["z"];
        nodo.apareceu = true;

        //Olha se nodo vai gerar filhos
        var tudoInteiro = true;
        for (var i = 0; i < nodo.x.length; i++)
            tudoInteiro &= parseFloat(nodo.x[i]) == Math.floor(nodo.x[i]);

        if (!tudoInteiro) {
            //cria 2 nodos filhos
            if (!isNaN(nodo.z)) {
                this.heap.insereNodos(1, jQuery.extend(true, {}, nodo),
                        jQuery.extend(true, {}, nodo));
                this.borda.push(2);
                this.borda.push(3);
            }

            //altera o valor de Z
            if (nodo.problema === "Maximize")
                nodo.z = "-Inf";
            else
                nodo.z = "Inf";
        }
        
        this.exec.push(1);

        return nodo;
    };

    this.terminou = function () {
        //se a fila de proximo nodo a analisar estiver vazia a execucao terminou
        return (this.borda.length == undefined || this.borda.length == 0);
    };

    this.resolveNodos = function (id, xi) {
        if (  this.borda.indexOf(id * 2) === -1
            &&this.borda.indexOf(id * 2 + 1) === -1)
            return undefined;

        if (Math.floor(this.heap.array[id].x[xi]) == this.heap.array[id].x[xi])
            return [undefined, undefined];
        //?
        /*
        if (this.heap.array[id].x.length === 0){
            this.borda.splice(this.borda.indexOf(dir.id), 1);
            return [undefined, undefined];
        }
        */
        this.heap.array[id].xi = xi;

        //RESOLVENDO NO DA ESQUERDA
        var esq = this.heap.array[id * 2];
        esq.id = id * 2;
        esq.otimo = false;
        esq.apareceu = true;
        //adiciona restricao
        esq.upper[xi] = Math.floor(this.heap.array[id].x[xi]);
        //resolve o simplex
        var res = simplex(esq);
        //completa o nodo
        esq.x = res["x"];
        //remocao de erro de ponto flutuante
        for (var i = 0; i < esq.x.length; i++)
            if(esq.x[i] < Math.round(esq.x[i]) + 0.0000000001 && esq.x[i] > Math.round(esq.x[i]) - 0.0000000001)
                esq.x[i] = Math.round(esq.x[i]);
        esq.z = res["z"];

        //RESOLVENDO NO DA DIREITA
        var dir = this.heap.array[id * 2 + 1];
        dir.id = id * 2 + 1;
        dir.otimo = false;
        dir.apareceu = true;
        //adiciona restricao
        dir.lower[xi] = Math.ceil(this.heap.array[id].x[xi]);
        //resolve o simplex
        var res = simplex(dir);
        //completa o nodo
        dir.x = res["x"];
        //remocao de erro de ponto flutuante
        for (var i = 0; i < dir.x.length; i++)
            if(dir.x[i] < Math.round(dir.x[i]) + 0.0000000001 && dir.x[i] > Math.round(dir.x[i]) - 0.0000000001)
                dir.x[i] = Math.round(dir.x[i]);
        dir.z = res["z"];



        var tudoInteiroEsq = false, tudoInteiroDir = false;
        //Olha se nodo esq vai gerar filhos (para saber se vai terminar)
        if(!isNaN(esq.z)){
            tudoInteiroEsq = true;
            for (var i = 0; i < esq.x.length; i++)
                tudoInteiroEsq &= parseFloat(esq.x[i]) == Math.floor(esq.x[i]);
        }
        //Olha se nodo dir vai gerar filhos (para saber se vai terminar)
        if(!isNaN(dir.z)){
            tudoInteiroDir = true;
            for (var i = 0; i < dir.x.length; i++)
                tudoInteiroDir &= parseFloat(dir.x[i]) == Math.floor(dir.x[i]);
        }
        
        
        //Olha se esq melhor ate agora
        if(tudoInteiroEsq
           &&(  (esq.problema === "Maximize" && esq.z)
              ||(esq.problema === "Minimize" && esq.z)
              ||this.melhor !== "")){
           this.melhor = esq.z;
        }
        //Olha se dir melhor ate agora
        if(tudoInteiroDir
           &&(  (esq.problema === "Maximize" && dir.z > this.melhor)
              ||(esq.problema === "Minimize" && dir.z < this.melhor)
              ||this.melhor !== "")){
           this.melhor = dir.z;
        }
        
        if (!tudoInteiroEsq && !isNaN(esq.z)) {
            //cria 2 nodos filhos
            if (  (esq.problema == "Maximize" && esq.z >= this.melhor)
                ||(esq.problema == "Minimize" && esq.z <= this.melhor)
                ||this.melhor == "") {
                this.heap.insereNodos(esq.id, jQuery.extend(true, {}, esq),
                        jQuery.extend(true, {}, esq));
                this.borda.push(esq.id * 2);
                this.borda.push(esq.id * 2 + 1);
            }
            
            //altera o valor de Z
            if (esq.problema === "Maximize")
                esq.z = "-Inf";
            else
                esq.z = "Inf";
        }
        if (!tudoInteiroDir && !isNaN(dir.z)) {
            //cria 2 nodos filhos
            if (  (dir.problema == "Maximize" && dir.z >= this.melhor)
                ||(dir.problema == "Minimize" && dir.z <= this.melhor)
                ||this.melhor == "") {
                this.heap.insereNodos(dir.id, jQuery.extend(true, {}, dir),
                        jQuery.extend(true, {}, dir));
                this.borda.push(dir.id * 2);
                this.borda.push(dir.id * 2 + 1);
            }

            //altera o valor de Z
            if (dir.problema === "Maximize")
                dir.z = "-Inf";
            else
                dir.z = "Inf";
        }

        if (esq != undefined)
            this.borda.splice(this.borda.indexOf(esq.id), 1);
        if (dir != undefined)
            this.borda.splice(this.borda.indexOf(dir.id), 1);
        
        this.exec.push(esq.id);
        this.exec.push(dir.id);

        return [esq, dir];
    };

    this.executar = function () {
        var id = Math.floor(this.borda[0] / 2);
        return this.resolveNodos(id, this.escolheVariavel(id));
    };

    this.escolheVariavel = function (id) {
        /*
         * Retorna o indice da variavel mais fracionaria do x do nodo atual
         */
        var x = this.heap.array[id].x;

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
         * procura os nos com solucao otima e altera seu atributo
         * otimo para true
         */
        
        for (var i = 1; i < this.heap.array.length; i++)
            if(this.heap.array[i] != undefined)
                this.heap.array[i].otimo = false;

        //procura a 1a solucao inteira viavel
        //    se nao houver nenhuma interrompe execucao
        //    se encontrar seta como otima
        var i = 0;
        while (this.exec[i] != undefined) {
            var j = this.exec[i];
            if (j === this.heap.array.length)
                return;
            if (!(this.heap.array[j] == undefined ||
                  isNaN(this.heap.array[j].z))){
                var otim = this.heap.array[j].z;
                break;
            }
            i++;
        }

        //para cada solucao
        var i = 0;
        while (this.exec[i] != undefined) {
            var j = this.exec[i];
            if (this.heap.array[j] == undefined)
                continue
            //se solucao eh viavel
            else if (!isNaN(this.heap.array[j].z)) {
                //e for melhor que a otima
                if (((this.heap.array[j].problema === "Maximize" &&
                        this.heap.array[j].z > otim) ||
                    (this.heap.array[j].problema === "Minimize" &&
                        this.heap.array[j].z < otim))
                    && this.heap.array[j].apareceu)
                    // passa a ser a nova otima
                    otim = this.heap.array[j].z;
            }
            i++
        }
        
        var id = 0;
        //para cada solucao
        var i = 0;
        while (this.exec[i] != undefined) {
            var j = this.exec[i];
            if (this.heap.array[j] == undefined)
                continue
            //se solucao eh otima
            else if (this.heap.array[j].z === otim) {
                id = j;
                this.heap.array[j].otimo = true;
            }
            i++;
        }
        
        return id;
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
                z = "Número de condições muito grande para a matriz base inicial. ";
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
                z = "Não existe solução viável primal. ";
                break;

            case GLP_ENODFS:
                z = "Não existe solução viável dual. ";
        }

        return {
            z: z,
            x: []
        };
    }
};

//# sourceURL=branchbound.js