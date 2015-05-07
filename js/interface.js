$('#executar').bind('click', function(){
    
});

Nodo = function(id, pai, altura, modelo){
    /* 
        Classe que sera usada como elemento do heap.
        Contem as informacoes necessarias para a execucao do metodo simplex
            e as informacoes necessarias para desenha-lo na arvore.
        ...
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
    
    
    this.toSource = function(){
            var source = "";
            
            source = problema + "\n";
            source += "obj: ";
            for (i = 0; i < objetivo.length; i++) {
                source += objetivo[i] >= 0 ? " +" : "";
                source += objetivo[i] + " x" + i;
            }
            source += "\n\n" + "Subject To" + "\n";

            for (i = 1; i <= restricoes.length; i++) {
                source += "res_" + i + ": ";
                for (j = 0; j < objetivo.length; j++) {
                    source += (restricoes[i][j] >= 0) ? " + " : "";
                    source += restricoes[i][j] + " x" + j;
                }
                source += " " + relacoes[j] + " " + rhs[j];
                source += "\n";
            }

            source += "\nBounds\n";

            for (i = 0; i <= objetivo.length; i++) {
                source += (upper[i].toString().toUpperCase() == "INF") ? "x" + i + ">=" + lower[i] : 
                                                                         lower[i] + "<=" + "x" + i + "<=" + upper[i];
                source += "\n";
            }

            source += "\nGenerals \n";

            for (i = 0; i <= objetivo.length; i++)
                    source += "x" + i + "\n";

            source += "\nEnd";
            
            return source;
    };
    
    return this;
}

Heap = function(Nodo){
    /*
        Classe que sera usada como "arvore" para o metodo branch and bound.
        this.array contem o vetor com o heap.
            Obs: Indices do array comecam em 1.
        ...
        Inicializa com Nodo como elemento raiz
    */
    this.array = new Array(0);
    this.array[1] = Nodo;
    
    this.insereElementos = function(pai, esq, dir){
        /*
            pai eh o indice do elemento pai de esq e dir.
            esq eh o objeto tipo nodo que sera o filho a esquerda de pai.
                se esq for 'null' adiciona somente o elemento a direita.
            dir eh o objeto tipo nodo que sera o filho a direita de pai.
                se dir for 'null' adiciona somente o elemento a esquerda.
        */
        if(esq != null)
            this.array[pai*2] = esq;
        if(dir != null)
            this.array[pai*2 + 1] = dir;
    };
    
    this.busca = function(nodo){
        /*
            Retorna o indice em que o objeto 'nodo' esta no heap.
            Retorna 0 caso nao esteja.
        */
        for(i=1; i<this.array.length; i++)
            if(i in this.array && this.array[i] === nodo)
                return i;
        return 0;
    };
    
    this.substitui = function(velho, novo){
        /*
            Substitui o objeto 'velho' pelo objeto 'novo'.
        */
        var indice = this.busca(velho);
        if(indice !== 0)
            this.array[indice] = novo;
    };
    
    this.getNodosAltura = function(altura){
        /*
            Retorna um vetor contendo os nodos do heap a uma certa 'altura'
        */
        
    };
    
    this.getPai = function(nodo){
        /*
            Nodo e o indice de um elemento
            Retorna o indice do pai do elemento
        */
       return Math.floor(nodo/2);
    };
   
    return this;
}

include("glpk.min.js");
include("heap.js");

function BranchBound(modelo) {
    /*
        Classe que controlara a chamada do simplex
    */
    
    
    this.heap = Heap(Nodo(0, modelo));

    this.passoAPasso = function (nodo) {

    };

    this.proximoPasso = function () {

    };

    this.executar = function (source) {

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
    };
};


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
            restricoes[j][i] =  $('x' + j + i).val();
            
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


include = function(path) {
    var aux = document.createElement("script");
    aux.type = "text/javascript";
    aux.src = path;
    document.body.appendChild(aux);
};