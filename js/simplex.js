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
        this.metodo = modelo["metodo"];
        this.problema = modelo["problema"];
        this.objetivo = modelo["objetivo"];
        this.restricoes = modelo["restricoes"];
        this.relacoes = modelo["relacoes"];
        this.rhs = modelo["rhs"];
        this.upper = modelo["upper"];
        this.lower = modelo["lower"];
        this.tabela = [[]];
        //Instanciar solver
        this.solver = new Solver();
        
        
        this.terminado = false;
        //Controla se o simplex vai ser executado mais de uma vez
        //True indica que e a ultima execucao
        this.execucaoFinal = true;
        //Controla se esta iniciando o simplex duas fases
        this.isDuasFases = false;
        if(this.metodo === "Duas Fases"){
            this.execucaoFinal = false;
            this.isDuasFases = true;
            this.solver.isDuasFases = true;
            this.duasFases();
        }
        else if(this.metodo === "Grande M"){
            this.grandeM();
        }
        else{
            this.generalizado();
        }
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
        
        //Determinando valor de M
        var max = this.objetivo[0];
        for(var i = 1; i < this.objetivo.length; i++)
            if (this.objetivo[i] > max)
                max = this.objetivo[i];
        var M = 99999 * max;
        
        //Criando tabela basica
        if(this.problema === "Maximize")
            for(var i = 0; i < this.objetivo.length; i++)
                this.tabela[0].push(-this.objetivo[i]);
        else
            this.tabela[0] = this.objetivo;
        for(var i = 0; i < this.restricoes.length; i++)
            this.tabela[i+1] = this.restricoes[i];
        
        //Adicionando limites superior e inferior
        for(var i = 0; i < this.lower.length; i++){
            //Limite inferior
            if(this.lower[i] !== 0){
                //Tratamento negativo
                /***********************/
                /***********************/
                /*******  TO DO  *******/
                /***********************/
                /***********************/
                
                this.tabela.push([]);
                for(var j = 0; j < this.lower.length; j++){
                    if(j === i)
                        this.tabela[this.tabela.length-1].push(1);
                    else
                        this.tabela[this.tabela.length-1].push(0);
                }
                this.relacoes.push(">=");
                this.rhs.push(this.lower[i]);
            }
            //Limite superior
            if(this.upper[i] !== "inf"){
                this.tabela.push([]);
                for(var j = 0; j < this.upper.length; j++){
                    if(j === i)
                        this.tabela[this.tabela.length-1].push(1);
                    else
                        this.tabela[this.tabela.length-1].push(0);
                }
                this.relacoes.push("<=");
                this.rhs.push(this.upper[i]);
            }
        }
        
        //Gerando modelo aumentado
        for(var i = 0; i < this.relacoes.length; i++){
            if(this.relacoes[i] === "<="){
                //Variaveis de folga
                for(var j = 0; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
            }
            else{
                //Variaveis artificiais
                this.tabela[0].push(M);
                for(var j = 1; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
                if(this.relacoes[i] === ">="){
                    //Variaveis de sobra
                    for(var j = 1; j < this.tabela.length; j++){
                        if(j === i + 1)
                            this.tabela[j].push(-1);
                        else
                            this.tabela[j].push(0);
                    }
                }
            }
        }
        
        //Adicionando coluna Solucao
        this.tabela[0].push(0);
        for(var i = 0; i < this.rhs.length; i++){
            this.tabela[i+1].push(this.rhs[i]);
        }
        
        this.solver.init({tabela : this.tabela, generalizado: false});
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
        
        //Checando se precisa ser feito pelo metodo duas fases
        isDuasFases = false;
        for(var i = 0; i < this.relacoes.length; i++)
            if(this.relacoes[i] !== "<="){
                isDuasFases = true;
                break;
            }
        if(!isDuasFases){
            this.execucaoFinal = true;
            this.grandeM();
            return;
        }
        
        //Criando tabela basica
        for(var i = 0; i < this.objetivo.length; i++)
            this.tabela[0].push(0);
        for(var i = 0; i < this.restricoes.length; i++)
            this.tabela[i+1] = this.restricoes[i];
        
        //Adicionando limites superior e inferior
        for(var i = 0; i < this.lower.length; i++){
            //Limite inferior
            if(this.lower[i] !== 0){
                this.tabela.push([]);
                for(var j = 0; j < this.lower.length; j++){
                    if(j === i)
                        this.tabela[this.tabela.length-1].push(1);
                    else
                        this.tabela[this.tabela.length-1].push(0);
                }
                this.relacoes.push(">=");
                this.rhs.push(this.lower[i]);
            }
            //Limite superior
            if(this.upper[i] !== "inf"){
                this.tabela.push([]);
                for(var j = 0; j < this.upper.length; j++){
                    if(j === i)
                        this.tabela[this.tabela.length-1].push(1);
                    else
                        this.tabela[this.tabela.length-1].push(0);
                }
                this.relacoes.push("<=");
                this.rhs.push(this.upper[i]);
            }
        }
        
        //Gerando modelo aumentado
        for(var i = 0; i < this.relacoes.length; i++){
            if(this.relacoes[i] === "<="){
                //Variaveis de folga
                for(var j = 0; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
            }
            else{
                //Variaveis artificiais
                this.tabela[0].push(1);
                for(var j = 1; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
                if(this.relacoes[i] === ">="){
                    //Variaveis de sobra
                    for(var j = 1; j < this.tabela.length; j++){
                        if(j === i + 1)
                            this.tabela[j].push(-1);
                        else
                            this.tabela[j].push(0);
                    }
                }
            }
        }
        
        //Adicionando coluna Solucao
        this.tabela[0].push(0);
        for(var i = 0; i < this.rhs.length; i++){
            this.tabela[i+1].push(this.rhs[i]);
        }
        
        this.solver.init({tabela : this.tabela, generalizado: false});
    };
    
    this.duasFases2 = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      nulo
         * Objetivo:
         *      Inicializar o simplex com os valores lidos da entrada do usuario
         *      adaptando para o modelo Duas Fases a ser jogado para o solver
         */
        
        //Recebe resultado da fase 1
        var tabela = this.solver.tabela;
        
        //Criando tabela basica
        if(this.problema === "Maximize")
            for(var i = 0; i < this.objetivo.length; i++)
                this.tabela[0].push(-this.objetivo[i]);
        else
            this.tabela[0] = this.objetivo;
        for(var i = 0; i < tabela.length; i++)
            for(var j = 0; j < this.restricoes[0].length; j++)
                this.tabela[i+1][j] = tabela[i+1][j];
        for(var i = 0; i < tabela.length; i++)
            this.tabela[i].push(tabela[i][tabela.length-1]);
        
        this.solver = new Solver();
        this.solver.init({tabela : this.tabela});
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
        
        /***********************/
        /***********************/
        /*******  TO DO  *******/
        /***********************/
        /***********************/
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
        
        if(this.terminou() && this.execucaoFinal)
            return this.solver.tabela;
        
        return this.solver.iteracao(entra, sai);
    };
    
    this.proximoPasso = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      tabela = Nova tabela simplex apos troca de variavel na base
         * Objetivo:
         *      Executa uma iteracao do algoritmo
         */
        var res = this.solver.escolheVariavel();
        return this.iteracao(res[0], res[1]);
    };
    
    this.terminou = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      Bool = True caso o simplex tenha terminado sua execucao, 
         *      False caso contrario
         * Objetivo:
         *      Informar a quem esta utilizando o algoritmo se ha mais iteracoes
         *      a serem executadas e faz a chamada caso precisa passar de fase (duas fases)
         */
        if(this.isDuasFases){
            this.isDuasFases = false;
            return false;
        }

        if(this.terminado || this.solver.terminou()){
            if(this.execucaoFinal){
                this.terminado = true;
            }
            else{
                this.duasFases2();
                this.terminado = false;
                this.execucaoFinal = true;
            }
        }
        return this.terminado;
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
        
        while(!this.terminou())
            this.solver.executa();
        
        return this.solver.tabela;
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
        
        //Booleano para indicar se e generalizado ou nao
        this.generalizado = modelo["generalizado"];
        
        //Permite saber rapidamente se o metodo terminou
        this.terminado = false;
        
        //Numero de iteracoes executadas
        this.nIteracoes = 0;
        
        /*
         * Limite de iteracoes para o metodo
         * Objetiva parar loops infinitos causados por ciclagem
         */
        this.limiteIteracoes = 1000;
        
        //Lista com os elementos que ainda nao foram tratados em degeneracao
        this.degenerados = [];

        //Controla se esta iniciando o simplex duas fases
        this.isDuasFases = false;
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
        if(this.isDuasFases){
            this.isDuasFases = false;
            return false;
        }

        var setou = false;
        
        if(this.terminado)
            return true;
        
        for(var i = 0; i < this.tabela[0].length-1; i++){
            if (this.tabela[0][i] < 0){
                setou = true;
                this.terminado = false;
                break;
            }
        }
        
        if(!setou){
            this.terminado = true;
        }
        
        return this.terminado;
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
        
        
        var idxEntra = -1;
        
        
        //VARIAVEL BASICA NAO ZERO NA F OBJ
        for (var j = 0; j < this.tabela[0].length-1; j++){
            //Se variavel for nao-basica idxBasica = -1
            //Caso seja idxBasica = linha da base
            idxEntra = -1;
            var um = false;
            var basica = true;
            for (var i = 1; i < this.tabela.length; i++){
                if(this.tabela[i][j] === 1 && !um)
                    um = true;
                else if(this.tabela[i][j] !== 0){
                    basica = false;
                    break;
                }
            }
            if(um && basica && this.tabela[0][j] !== 0){
                idxEntra = j;
                break;
            }
        }
        
        
        //SOLUCAO INVIAVEL
        if(this.generalizado){
            
        }
        
        
        //variavel que entra
        if(idxEntra === -1){
            idxEntra = 0;
            for(var i = 1; i < this.tabela[0].length-1; i++)
                if(this.tabela[0][i] < this.tabela[0][idxEntra])
                    idxEntra = i;
        }
        
        //variavel que sai da base
        var idxSai = 0;
        //NaN, usado como infinito
        var rmin = 0 / 0; 
        //Armazena o valor da razao que ocorreu mais de uma vez
        var degenerado = 0 / 0;
        for(var i = 1; i < this.tabela.length; i++){
            if (this.tabela[i][idxEntra] !== 0){
                var ri = this.tabela[i][this.tabela[i].length-1] / this.tabela[i][idxEntra];
                if ((ri < rmin || isNaN(rmin)) && ri > 0){
                    rmin = ri;
                    idxSai = i;
                }
                //Indica se houveram razoes iguais
                else if(ri === rmin){
                    degenerado = rmin;
                }
            }
        }
        
        
        //SOLUCAO DEGENERADA
        if(degenerado === rmin && rmin > 0){
            idxSai = [];
            for(var i = 1; i < this.tabela.length; i++){
                if (rmin === this.tabela[i][this.tabela[i].length-1] / this.tabela[i][idxEntra]){
                    idxSai.push(i);
                }
            }
        }
        
        
        //SOLUCAO ILIMITADA
        if(isNaN(rmin) || rmin < 0){
            idxSai = 0 / 0;
        }
        
        return [idxEntra, idxSai];
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
        
        //Caso tenha terminado a execucao
        if(this.terminado)
            return this.tabela;
        
        //Caso tenha acontecido uma solucao ilimitada ou um loop infinito
        if(isNaN(sai) || this.nIteracoes === this.limiteIteracoes){
            this.terminado = true;
            return this.tabela;
        }
        
        
        //Caso seja uma solucao inviavel
        if(this.generalizado){
            
        }
        
        
        //Degeneracao
        var zerarEntrada = false;
        if(Array.isArray(sai)){
            for(var i = 0; i < sai.length; i++){
                if(this.degenerados.indexOf(sai[i]) === -1){
                    this.degenerados.push(sai[i]);
                }
                if(i > 0){
                    this.tabela[sai[i]][this.tabela[0].length - 1] = 0;
                }
            }
            sai = sai[0];
            if(this.tabela[sai][this.tabela[0].length - 1] === 0){
                zerarEntrada = true;
            }
        }
        
        
        //Normalizando a linha de quem entra
        var razao = 1 / this.tabela[sai][entra];
        if(razao !== 1)
            for(var i = 0; i < this.tabela[sai].length; i++)
                this.tabela[sai][i] *= razao;
        
        
        //Escalonando as outras linhas
        for(var i = 0; i < this.tabela.length; i++){
            if (i !== sai && this.tabela[i][entra] !== 0){
                razao = this.tabela[i][entra];
                for(var j = 0; j < this.tabela[i].length; j++)
                    this.tabela[i][j] -= this.tabela[sai][j] * razao;
            }
        }
        
        
        //Caso tenha sido degenerado
        if(this.degenerados.indexOf(sai) !== -1){
            this.degenerados.splice(this.degenerados.indexOf(sai));
            if(zerarEntrada){
                this.tabela[sai][this.tabela[0].length - 1] = 0;
            }
        }
        
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

//# sourceURL=simplex.js