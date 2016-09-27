__global__executando__ = "simplex";

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
        //Armazena todas as iteracoes do simplex
        this.iteracoes = [[]];
        //Instanciar solver
        this.solver = new Solver();
        
        
        this.terminado = false;
        //Controla se o simplex vai ser executado mais de uma vez
        //True indica que e a ultima execucao
        this.execucaoFinal = true;
        //Controla se esta iniciando o simplex duas fases

        this.artificiais = [];

        if(this.metodo === "Duas Fases"){
            this.execucaoFinal = false;
            this.duasFases();
        }
        else if(this.metodo === "Grande M"){
            this.grandeM();
        }
        else if(this.metodo === "Generalizado"){
            this.generalizado();
        }
        else{
            return;
        }

        //Insere tabela original na lista de iteracoes
        var i = 0;
        while(i < this.tabela.length){
            this.iteracoes[0].push([]);
            for(var j = 0; j < this.tabela[0].length; j++){
                this.iteracoes[0][i].push(this.tabela[i][j]);
            };
            i++;
        };
    };

    this.modelo = function () {
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      String contendo modelo em notacao TeX
         * Objetivo:
         *      Fazer o modelo MathJax do problema
         */
        var source = "";

        if (this.problema === "Maximize")
            source = 'Maximizar';
        if (this.problema === "Minimize")
            source = 'Minimizar';
        source += "\n`z = ";
        var primeiro = true;
        for (var i = 0; i < this.objetivo.length; i++) {
            if (this.objetivo[i] === "0")
                continue;
            if (!primeiro)
                source += (this.objetivo[i] > 0) ? " + " : " ";
            else
                primeiro = false;
            source += (this.objetivo[i] === "1") ?
                         (" x_" + (i + 1) + " ") :
                         ((this.objetivo[i] === "-1") ?
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
                    if (this.restricoes[i][j] === "0")
                        continue;
                    if (!primeiro)
                        source += (this.restricoes[i][j] > 0) ? " + " : " ";
                    else
                        primeiro = false;
                    source += (this.restricoes[i][j] === "1") ?
                                 (" x_" + (j + 1) + " ") :
                                 ((this.restricoes[i][j] === "-1") ?
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
            source += " \in \mathbb{R}`";
        }
        //MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

        return source.replace(/\n/g, '<br>');
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
                //if(this.problema === "Maximize")
                    this.tabela[0].push(M);
                //else
                //    this.tabela[0].push(-M);
                for(var j = 1; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
                if(this.relacoes[i] === ">="){
                    //Variaveis de sobra
                    this.tabela[0].push(0);
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
                //Variaveis armazenartificiais
                this.tabela[0].push(1);
                this.artificiais.push(this.tabela[0].length-1);
                for(var j = 1; j < this.tabela.length; j++){
                    if(j === i + 1)
                        this.tabela[j].push(1);
                    else
                        this.tabela[j].push(0);
                }
                if(this.relacoes[i] === ">="){
                    //Variaveis de sobra
                    this.tabela[0].push(0);
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

        //Ajustando modelo da primeira fase
        while(this.solver.terminou()){
            var base = this.solver.escolheVariavel();
            this.solver.terminado = false;
            var res = this.solver.iteracao(base[0], base[1]);
            var copia = [];
            //Copia tabela
            for(var i = 0; i < res.length; i++){
                copia.push([]);
                for(var j = 0; j < res[0].length; j++){
                    if(i === 0 && this.problema === "Minimize")
                        copia[i].push(-res[i][j]);
                    else
                        copia[i].push(res[i][j]);
                }
            }
            this.iteracoes.push(copia);
        }
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

        //Teste para saber se e viavel
        var terminou = false;
        if(tabela[0][tabela[0].length-1] !== 0){
            terminou = true;
        }
        else{
            for(var idx = 0; idx < this.artificiais.length; idx++){
                var j = this.artificiais[idx];
                var um = -1;
                var basica = true;
                for (var i = 1; i < this.tabela.length; i++){
                    if(this.tabela[i][j] === 1 && um === -1)
                        um = i;
                    else if(this.tabela[i][j] !== 0){
                        basica = false;
                        break;
                    }
                }
                if(um !== -1 && basica && this.tabela[0][j] !== 0){
                    //Se artificial da base maior que zero
                    if(tabela[um][tabela[um].length] > 0){
                        terminou = true;
                    }
                    //Se artificial da base zero
                    else if(tabela[um][tabela[um].length] === 0){
                        for(var j = 0; j < tabela[0].length; j++){
                            if(tabela[0][j] === 0){
                                var umLinha = -1;
                                var basica = true;
                                for (var i = 1; i < this.tabela.length; i++){
                                    if(this.tabela[i][j] === 1 && umLinha === -1)
                                        umLinha = i;
                                    else if(this.tabela[i][j] !== 0){
                                        basica = false;
                                        break;
                                    }
                                }
                                //Se nao e basica
                                if(umLinha === -1 || !basica){
                                    this.solver.iteracao(j, um);
                                    //Reinicia a funcao
                                    this.duasFases2();
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        if(terminou){
            this.solver.tipoRes += "Solução inexistente. ";
            this.terminado = true;
            this.execucaoFinal = true;
        }
        
        //Criando tabela basica
        //Funcao objetivo original
        for(var i = 0; i < this.objetivo.length; i++)
            if(this.problema === "Maximize")
                this.tabela[0][i] = -this.objetivo[i];
            else
                this.tabela[0][i] = this.objetivo[i];
        var tam = this.tabela[0].length;
        for(var i = this.objetivo.length; i < tam; i++)
                this.tabela[0][i] = 0;

        //Restricoes da fase 1
        for(var i = 0; i < this.restricoes.length; i++)
            for(var j = 0; j < this.restricoes[0].length; j++)
                this.tabela[i+1][j] = tabela[i+1][j];
        /*
        for(var i = 0; i < tabela.length; i++)
            this.tabela[i][this.tabela[0].length-1] = tabela[i][tabela.length-1];
        */

        //Removendo variaveis artificiais
        for(var idx = this.artificiais.length - 1; idx >= 0; idx--)
            for(var i = 0; i < this.tabela.length; i++)
                this.tabela[i].splice(this.artificiais[idx], 1);    


        //Insere tabela da fase 2 na lista de iteracoes
        var pos = this.iteracoes.length;
        this.iteracoes.push([]);
        for(var i = 0; i < this.tabela.length; i++){
            this.iteracoes[pos].push([]);
            for(var j = 0; j < this.tabela[0].length; j++){
                this.iteracoes[pos][i].push(this.tabela[i][j]);
            }
        }
        
        this.solver = new Solver();
        this.solver.init({tabela : this.tabela, generalizado: false});
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
        
        //Criando tabela basica
        if(this.problema === "Maximize")
            for(var i = 0; i < this.objetivo.length; i++)
                this.tabela[0].push(-this.objetivo[i]);
        else
            this.tabela[0] = this.objetivo;

        //Adiciona as restricoes
        for(var i = 0; i < this.restricoes.length; i++){

            //Transforma as igualdades em duas desigualdades
            if(this.relacoes[i] === "="){
                this.restricoes.splice(i+1, 0, []);
                for(var j = 0; j < this.restricoes[i].length; j++){
                    this.restricoes[i+1].push(-this.restricoes[i][j]);
                }
                this.relacoes[i] = "<=";
                this.relacoes.splice(i+1, 0, "<=");
                this.rhs.splice(i+1, 0, -this.rhs[i]);
            }
            else if(this.relacoes[i] === ">="){
                for(var j = 0; j < this.restricoes[i].length; j++){
                    this.restricoes[i][j] = -this.restricoes[i][j];
                }
                this.relacoes[i] = "<=";
                this.rhs[i] = -this.rhs[i];
            }
            
            this.tabela[i+1] = this.restricoes[i];
        }
        
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
            //Variaveis de folga
            for(var j = 0; j < this.tabela.length; j++){
                if(j === i + 1)
                    this.tabela[j].push(1);
                else
                    this.tabela[j].push(0);
            }
        }
        
        //Adicionando coluna Solucao
        this.tabela[0].push(0);
        for(var i = 0; i < this.rhs.length; i++){
            this.tabela[i+1].push(this.rhs[i]);
        }
        
        this.solver.init({tabela : this.tabela, generalizado: true});
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
        var res;
        if(this.terminou() && this.execucaoFinal)
            res = this.solver.tabela;
        else
            res = this.solver.iteracao(entra, sai);

        //Copia tabela
        var copia = [];
        for(var i = 0; i < res.length; i++){
            copia.push([]);
            for(var j = 0; j < res[0].length; j++){
                if(i === 0 && this.problema === "Minimize")
                    copia[i].push(-res[i][j]);
                else
                    copia[i].push(res[i][j]);
            }
        }
        
        return copia;
    };
    
    this.proximoPasso = function(){
        /*
         * Argumentos:
         *      nulo
         * Retorno:
         *      iteracoes = Vetor com todas as iteracoes, incluindo a nova tabela simplex apos troca de variavel na base
         * Objetivo:
         *      Executa uma iteracao do algoritmo
         */
        var res = this.solver.escolheVariavel();
        this.iteracoes.push(this.iteracao(res[0], res[1]))
        return this.iteracoes;
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
         *      tabela = Vetor com todas as iteracoes simplex apos execucao completa do algoritmo
         * Objetivo:
         *      Realizar iteracoes sucessivas ate encontrar a solucao otima ou
         *      um "erro" no modelo
         */
        
        do{
            this.proximoPasso();
        }while(!this.terminou())

        //Copia lista de iteracoes, deixando no formato de saida
        var copia = [];
        for(var k = 0; k < this.iteracoes.length; k++){
            copia.push([]);
            for(var i = 0; i < this.iteracoes[k].length; i++){
                copia[k].push([]);
                for(var j = 0; j < this.iteracoes[k][i].length; j++){
                        copia[k][i].push(this.iteracoes[k][i][j]);
                }
            }
        }
        
        return copia;
    };

    this.resultado = function(nIteracao){
        var tabela = this.iteracoes[nIteracao];

        var lin = tabela.length, col = tabela[0].length;

        //Valor da funcao objetivo
        var res = {};
        res["FuncaoObjetivo"] = tabela[0][col-1];
        //Indice das variaveis basicas e nao basicas
        res["VariaveisBasicas"] = [];
        res["VariaveisNaoBasicas"] = [];
        //Vetor contendo o valor das variaveis
        res["Variaveis"] = [];

        for(var j = 0; j < this.tabela[0].length-1; j++){
            var linhaBase = -1;
            var basica = true;
            for(var i = 0; i < lin; i++){
                if(tabela[i][j] === 1)
                    if(linhaBase === -1)
                        linhaBase = i;
                    else
                        basica = false;
                else if(tabela[i][j] !== 0)
                    basica = false;
            }
            if(basica && linhaBase !== -1){
                res["VariaveisBasicas"].push(j);
                res["Variaveis"][j] = tabela[linhaBase][col-1];
            }
            else{
                res["VariaveisNaoBasicas"].push(j);
                res["Variaveis"][j] = 0;
            }
        }

        res["TipoResultado"] = this.solver.tipoRes;

        return res;
    };

    this.pivo = function(nIteracao){

        //Copia tabela
        var copia = [];
        for(var i = 0; i < this.solver.tabela.length; i++){
            copia.push([]);
            for(var j = 0; j < this.solver.tabela[0].length; j++){
                copia[i].push(this.solver.tabela[i][j]);
            }
        }

        this.solver.tabela = this.iteracoes[nIteracao];

        if(this.problema === "Minimize")
            for(var i = 0; i < this.solver.tabela[0].length; i++)
                this.solver.tabela[0][i] = -this.solver.tabela[0][i];

        var res = this.solver.escolheVariavel();
        this.solver.tabela = copia;

        return res;
    };

    this.base = function(nIteracao){
        var tabela = this.iteracoes[nIteracao];
        var base = [];

        for (var j = 0; j < tabela[0].length-1; j++){
            var um = false;
            var basica = true;
            var pos;
            for (var i = 1; i < tabela.length; i++){
                if(tabela[i][j] === 1 && !um){
                    um = true;
                    pos = i;
                }
                else if(tabela[i][j] !== 0){
                    basica = false;
                    break;
                }
            }
            if(um && basica){
                base[pos] = j;
            }
        }

        return base;
    };
    
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



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
        this.limiteIteracoes = 70;
        
        //Lista com os elementos que ainda nao foram tratados em degeneracao
        this.degenerados = [];

        //Controla se esta iniciando o simplex duas fases
        
        //Controla se a execucao foi interrompida ou nao
        this.tipoRes = "";
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
        var setou = false;
        
        if(this.terminado)
            return true;

        //VARIAVEL BASICA NAO ZERO NA F OBJ
        for (var j = 0; j < this.tabela[0].length-1; j++){
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
                setou = true;
                this.terminado = false;
                break;
            }
        }
        
        //Otimalidade
        for(var i = 0; i < this.tabela[0].length-1 && !setou; i++){
            if (this.tabela[0][i] < 0){
                setou = true;
                this.terminado = false;
                break;
            }
        }

        //Viabilidade
        for(var i = 1; i < this.tabela.length && !setou; i++){
            if (this.tabela[i][this.tabela[0].length-1] < 0){
                setou = true;
                this.terminado = false;
                break;
            }
        }
        
        if(!setou){
            this.terminado = true;
        }

        if(this.terminado &&
           this.tipoRes.indexOf("Solução ilimitada. ") === -1 &&
           this.tipoRes.indexOf("Solução dual inexistente. ") === -1 &&
           this.tipoRes.indexOf("Limite de iterações atingido. ") === -1)
            this.tipoRes += "Solução Ótima. "
        
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
         *      Em caso de solucao inviavel retornara:
         *          [-idxSai, -idxEntra] = [int, int]
         *          idxSai = indice da linha que ira sair da base
         *          idxEntra = indice da coluna que ira entrar na base
         *      Em caso de haver terminado retornara:
         *          [-idxSai, -idxEntra] = [NaN, NaN]
         *          idxSai = NaN indica que nenhuma linha sai da base
         *          idxEntra = NaN indica que nenhuma linha entra na base
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
        if(this.generalizado && idxEntra === -1){
            var menor = 0, idxSai = -1;
            for(var i = 1; i < this.tabela.length; i++) {
                if(this.tabela[i][this.tabela[i].length - 1] < menor) {
                    idxSai = i;
                    menor = this.tabela[i][this.tabela[i].length - 1];
                }
            }

            if(idxSai !== -1){
                var razao;
                idxEntra = -1;
                //Encontra a primeira possivel variavel a entrar
                for(var j = 0; j < this.tabela[0].length-1; j++) {
                    if(this.tabela[idxSai][j] < 0){
                        razao = Math.abs(this.tabela[0][j] / this.tabela[idxSai][j]);
                        idxEntra = j;
                        break;
                    }
                }

                //Se solucao dual inviavel
                if(idxEntra === -1){
                    return []
                }

                //Melhor variavel para entrar
                for(var j = idxEntra; j < this.tabela[0].length-1; j++) {
                    var r = Math.abs(this.tabela[0][j] / this.tabela[idxSai][j]);
                    if(this.tabela[idxSai][j] < 0 && r < razao){
                        razao = r;
                        idxEntra = j;
                    }
                }

                return [idxEntra, idxSai];
            }
        }
        
        
        //variavel que entra
        if(idxEntra === -1){
            for(var i = 0; i < this.tabela[0].length-1; i++)
                if(this.tabela[0][i] < this.tabela[0][idxEntra] || 
                   (idxEntra === -1 && this.tabela[0][i] < 0))
                    idxEntra = i;
        }
        
        if(idxEntra !== -1){
            //variavel que sai da base
            var idxSai = -1;
            //NaN, usado como infinito
            var rmin = 0 / 0; 
            //Armazena o valor da razao que ocorreu mais de uma vez
            var degenerado = 0 / 0;
            for(var i = 1; i < this.tabela.length; i++){
                if (this.tabela[i][idxEntra] > 0){
                    var ri = this.tabela[i][this.tabela[i].length-1] / this.tabela[i][idxEntra];
                    if ((ri < rmin || isNaN(rmin)) && ri >= 0){
                        rmin = ri;
                        idxSai = i;
                    }
                    //Indica se houveram razoes iguais
                    else if(ri === rmin){
                        degenerado = rmin;
                    }
                }
            }
        }
        else{
            return [0/0, 0/0];
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

        this.nIteracoes++;
        
        //Caso tenha acontecido uma solucao ilimitada ou um loop infinito
        if((isNaN(sai) && !Array.isArray(sai)) || this.nIteracoes === this.limiteIteracoes || isNaN(entra)){
            if((isNaN(sai) && !Array.isArray(sai)) && this.tipoRes.indexOf("Solução ilimitada. ") === -1 )
                this.tipoRes += "Solução ilimitada. ";
            if(isNaN(entra) && this.tipoRes.indexOf("Solução inexistente. ") === -1 )
                this.tipoRes += "Solução inexistente. ";
            if(this.nIteracoes === this.limiteIteracoes && this.tipoRes.indexOf("Limite de iterações atingido. ") === -1 )
                this.tipoRes += "Limite de iterações atingido. ";
            this.terminado = true;
            return this.tabela;
        }
        
        
        //Degeneracao
        var zerarEntrada = false;
        outrosDegenerados = [];
        if(Array.isArray(sai)){
            if(this.tipoRes.indexOf("Solução degenerada. ") === -1 )
                this.tipoRes += "Solução degenerada. ";
            for(var i = 0; i < sai.length; i++){
                if(this.degenerados.indexOf(sai[i]) === -1){
                    this.degenerados.push(sai[i]);
                }
            }
            outrosDegenerados = sai;
            sai = Number(outrosDegenerados.splice(0, 1));
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
            this.degenerados.splice(this.degenerados.indexOf(sai), 1);
            if(zerarEntrada){
                this.tabela[sai][this.tabela[0].length - 1] = 0;
            }
            for(var i = 0; i < outrosDegenerados.length; i++){
                this.tabela[outrosDegenerados[i]][this.tabela[0].length - 1] = 0;
            }
        }


        //==================================
        //Remocao de erro de ponto flutuante
        for(var i = 0; i < this.tabela.length; i++)
            for(var j = 0; j < this.tabela[i].length; j++)
                if(this.tabela[i][j] < Math.round(this.tabela[i][j]) + 0.0000000001 && 
                   this.tabela[i][j] > Math.round(this.tabela[i][j]) - 0.0000000001)
                    this.tabela[i][j] = Math.round(this.tabela[i][j]);
        
        return this.tabela;
    };
    
};

//# sourceURL=simplex.js