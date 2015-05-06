function Nodo(pai, modelo){
    /* 
        Classe que sera usada como elemento do heap.
        Contem as informacoes necessarias para a execucao do metodo simplex.
        ...
    */

    this.pai = pai;
    this.problema = modelo["problema"];
    this.restricoes = modelo["restricoes"];
    this.relacoes = modelo["relacoes"];
    this.rhs = modelo["rhs"];
    this.upper = modelo["upper"];
    this.lower = modelo["lower"];
    
    
    this.source = function(){
            var source = "";
            

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
            
            return source;
    };
    
    return this;
}

function Heap(Nodo){
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