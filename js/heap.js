function Nodo(pai, z, x, rhs){
    /* 
        Classe que sera usada como elemento do heap.
        Contem as informacoes necessarias para a execucao do metodo simplex.
        ...
    */

    this.pai = pai;
    this.z = z;
    this.x = x;
    this.rhs = rhs;

    return this;
}

function Heap(){
    /*
        Classe que sera usada como "arvore" para o metodo branch and bound.
        this.array contem o vetor com o heap.
            Obs: Indices do array comecam em 1.
        ...
    */
    this.array = new Array(0);
    
    this.insereElementos = function(pai, esq, dir){
        /*
            pai eh o indice do elemento pai de esq e dir.
            esq eh o objeto tipo nodo que sera o filho a esquerda de pai.
            dir eh o objeto tipo nodo que sera o filho a direita de pai.
        */
        this.array[pai*2] = esq;
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
    
    return this;
}