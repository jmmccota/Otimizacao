Simplex = function(){
        /*
         * Objetivos:
         *      Manipular as entradas do usuario para o formato utilizado pelo
         *      solver para determinada tecnica.
         *      Agir como intermediador entre o usuario e o solver
         */
    
    this.init = function(modelo){
        /*
         * Argumentos:
         *      modelo = {
         *          problema = "Maximize" | "Minimize";
         *          objetivo = Vetor com coeficientes da f obj;
         *          restricoes = Matriz com coeficientes das restricoes;
         *          relacoes = Vetor com relacao entre restricao e 
         *                  lado direito (>=, =, <=);
         *          rhs = vetor com lado direito das restricoes;
         *          upper = vetor com limite superior das variaveis;
         *          lower = vetor com limite inferior das variaveis;
         *      }
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o simplex com os valores lidos da entrada do usuario
         */
        
        //Realizar leitura tabela
        this.problema = modelo["problema"];
        this.objetivo = modelo["objetivo"];
        this.restricoes = modelo["restricoes"];
        this.relacoes = modelo["relacoes"];
        this.rhs = modelo["rhs"];
        this.upper = modelo["upper"];
        this.lower = modelo["lower"];
        //Instanciar solver
        this.solver = new Solver();
    };
    
    this.grandeM = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o simplex com os valores lidos da entrada do usuario
         *      adaptando para o modelo Grande M a ser jogado para o solver
         */
        this.init();
        
        /////////////////////////////
        //          TO DO          //
        // Ajuste modelo grande M  //
        // Chamada Solver          //
        /////////////////////////////
    };
    
    this.duasFases = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o simplex com os valores lidos da entrada do usuario
         *      adaptando para o modelo Duas Fases a ser jogado para o solver
         */
        this.init();
        
        /////////////////////////////
        //          TO DO          //
        // Ajuste modelo fase 1    //
        // Chamada Solver          //
        // Ajuste modelo fase 2    //
        // Chamada Solver          //
        /////////////////////////////
    };
    
    this.generalizado = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o simplex com os valores lidos da entrada do usuario
         *      adaptando para o modelo generalizado a ser jogado para o solver
         */
        this.init();
        
        
        /////////////////////////////
        //          TO DO          //
        // Ajuste modelo           //
        // Chamada Solver          //
        /////////////////////////////
        
    };
    
};



Solver = function(){
        /*
         * Objetivos:
         *      Resover o modelo passado seguindo o algoritmo simplex para
         *      programacao linear
         */
    
    this.init = function(modelo){
        /*
         * Argumentos:
         *      modelo = Matriz do modelo simplex a ser resolvido
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o solver com o modelo e armazenar localmente a tabela
         */
        
        /*
         * Tabela do simplex tabular
         * Linha 0 = Funcao objetivo
         * Coluna n-1 = Solucao
         */
        this.tabela = modelo["tabela"];
    };
    
    this.terminou = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      Bool = True caso o simplex tenha terminado sua execucao, 
         *      False caso contrario
         * Objetivo:
         *      Informar a quem esta utilizando o solver se ha mais iteracoes
         *      a serem executadas
         */
        for(var i = 0; i < this.tabela[0].lenght-1; i++)
            if (this.tabela[0][i] < 0) return false;
        return true;
    };
    
    this.escolheVariavel = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      [idxSai, idxEntra] = [int, int]
         *      idxSai = indice da linha que ira sair da base
         *      idxEntra = indice da coluna que ira entrar na base
         *      Em caso de degeneracao retornara:
         *          [idxSai, idxEntra] = [[int, int, ...], int]
         *          idxSai = lista com indice das linhas degeneradas
         *          idxEntra = indice da coluna que ira entrar na base
         *      Em caso de solucao ilimitada retornara:
         *          [idxSai, idxEntra] = [NaN, int]
         *          idxSai = NaN indica que nenhuma linha sai da base
         *          idxEntra = indice da coluna que ira entrar na base
         * Objetivo:
         *      Determinar quais variaveis do modelo entrarao e sairam
         *      da base
         */
        
        //VARIAVEL BASICA NAO ZERO NA F OBJ
        for (var j = 0; j < this.tabela[0].lenght-1; j++){
            //Se variavel for nao-basica idxBasica = -1
            //Caso seja idxBasica = linha da base
            var idxBasica = -1;
            var um = false;
            for (var i = 1; i < this.tabela.lenght; i++){
                if(this.tabela[i][j] === 1 && !um) 
                    um = true;
                else if (this.tabela !== 0){
                    idxBasica = i;
                    break;
                }
            }
            //Se for basica e tiver valor nao zero na f obj
            if (idxBasica !== -1 && this.tabela[0][j] !== 0)
                return [idxBasica, j];
        }
        
        
        //SOLUCAO NAO OTIMA
        //variavel que entra
        var idxEntra = 0;
        for(var i = 1; i < this.tabela[0].lenght-1; i++)
            if(this.tabela[0][i] < this.tabela[0][idxEntra])
                idxEntra = i;
        
        //variavel que sai da base
        var idxSai = 0;
        //NaN, usado como infinito
        var rmax = 0 / 0; 
        //Armazena o valor da razao que ocorreu mais de uma vez
        var degenerado = 0 / 0;
        for(var i = 1; i < this.tabela.lenght; i++){
            if (this.tabela[i][idxEntra] !== 0){
                var ri = this.tabela[i][this.tabela[i].lenght-1] / this.tabela[i][idxEntra];
                if ((ri < rmax || isNaN(rmax)) && ri > 0){
                    rmax = ri;
                    idxSai = i;
                }
                //Indica se houveram razoes iguais
                else if(ri === rmax){
                    degenerado = rmax;
                }
            }
        }
        
        
        //SOLUCAO DEGENERADA
        if(degenerado === rmax && rmax > 0){
            idxSai = [];
            for(var i = 1; i < this.tabela.lenght; i++){
                if (rmax === this.tabela[i][this.tabela[i].lenght-1] / this.tabela[i][idxEntra]){
                    idxSai.push(i);
                }
            }
        }
        
        
        //SOLUCAO ILIMITADA
        if(isNaN(rmax) || rmax < 0){
            idxSai = 0 / 0;
        }
        
        return [idxSai, idxEntra];
    };
    
    this.iteracao = function(entra, sai){
        /*
         * Argumentos:
         *      entra = indice da coluna que ira entrar na base
         *      sai = 
         *          Caso comum: indice da linha que ira sair da base
         *          Caso degenerado: lista com indices das linhas degeneradas
         *          Caso ilimitado: NaN
         * Retorno:
         *      tabela = Nova tabela simplex apos troca de variavel na base
         * Objetivo:
         *      Trocar uma variavel da base e ajustar a tabela, escalonando para
         *      manter a consistencia dos dados
         */
        
        //Normalizando a linha de quem entra
        var razao = 1 / this.tabela[sai][entra];
        for(var i = 0; i < this.tabela[sai].lenght; i++)
            this.tabela[sai][i] *= razao;
        
        //Escalonando as outras linhas
        for(var i = 0; i < this.tabela.lenght; i++)
            if (i !== sai && this.tabela[i][entra] !== 0)
                for(var j = 0; j < this.tabela[i].lenght; j++)
                    this.tabela[i][j] -= this.tabela[sai][j] * this.tabela[i][entra];
        
        return this.tabela;
    };
    
    this.executa = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      tabela = Nova tabela simplex apos execucao completa do algoritmo
         * Objetivo:
         *      Realizar iteracoes sucessivas ate encontrar a solucao otima ou
         *      um "erro" no modelo
         */
        while(!this.terminou()){
            var res = this.escolheVariavel();
            this.iteracao(res[0], res[1]);
        }
        return this.tabela;
    };
    
};