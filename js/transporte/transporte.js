//Formato	-	Tabela n x n
//Tabela[0][0] a Tabela[n-1][n-1]
//  Recebe custo da celula
//	Retorna { custo: custo da celula, qtd: quantidade alocada para celula, visitado: se foi visitado pelo algoritmo }
//Tabela[0][n] a Tabela[n-1][n]
//	Recebe suprimento de cada linha
//	Retorna suprimento restante em cada linha
//Tabela[n][0] a Tabela[n-1][n]
//	Recebe demanda em cada coluna
//	Retorna demanda restante em cada coluna
//Tabela[n][n]
//	Recebe 0
//	Retorna custo total das alocacoes
__global__executando__ = "transporte";
Transporte = function(){
	
	this.init = function(modelo){

		this.tabela = modelo.problema;
		this.metodo = modelo.metodo;

		this.iteracoes = [];

		//Convertendo tabela entrada para modelo
		for(var i = 0; i < this.tabela.length-1; i++)
			for(var j = 0; j < this.tabela[0].length-1; j++)
				this.tabela[i][j] = { qtd: 0, custo: this.tabela[i][j], visitado: false };

		if(this.metodo === "Canto Noroeste")
			this.solver = new CantoNoroeste(this.tabela);
		else if(this.metodo === "Menor Custo")
			this.solver = new MenorCusto(this.tabela);
		else
			this.solver = new MAV(this.tabela);

		//Inserindo tabela original em iteracoes
		this.iteracoes.push(copiaTabela(this.tabela));
	};
	
	this.proximoPasso = function(){
		this.iteracoes.push(copiaTabela(this.solver.proximoPasso()));
		return this.iteracoes;
	};

	this.executa = function(){
		while(!this.terminou())
			this.proximoPasso();
		return this.iteracoes;
	};

	this.terminou = function(){
		return this.solver.terminou();
	};

	this.pivo = function(nIteracao){
		return this.solver.escolhidos[nIteracao];
	};

	this.custo = function(nIteracao){
		var t = this.iteracoes[nIteracao];
		var res = 0;
		for(var i = 0; i < t.length-1; i++){
			for(var j = 0; j < t[i].length-1; j++){
				res += t[i][j].custo * t[i][j].qtd;
			}
		}

		return res;
	};
	
	this.modelo = function () {
        var source = "";
        
        console.log(this.tabela);
		
		

        return source.replace(/\n/g, '<br>');
    };
};



SolverTransporte = function(tabela, funcaoEscolha){
	this.atual = undefined;
	this.tabela = tabela;
	this.escolhidos = [];
	//Funcao de escolha de celula para iteracao
	//Varia de acordo com o metodos
	SolverTransporte.prototype.escolheCelula = funcaoEscolha;
};
SolverTransporte.prototype.terminou = function() {
	var supZerou = true, demZerou = true;
	
	for(var i = 0; i < this.tabela.length-1; i++){
		if(this.tabela[i][this.tabela[i].length-1] != 0){
			supZerou = false;
			break;
		}
	}
	for(var j = 0; j < this.tabela[this.tabela.length-1].length; j++){
		if(this.tabela[this.tabela.length-1][j] != 0){
			demZerou = false;
			break;
		}
	}
	return supZerou || demZerou;
};
SolverTransporte.prototype.proximoPasso = function() {
	var celula = this.escolheCelula();
	copia = {};
	copia.i = celula.i;
	copia.j = celula.j;
	this.escolhidos.push(copia);
	var i = celula.i, j = celula.j;

	this.tabela[i][j].visitado = true;

	var tamI = this.tabela.length-1;
	var tamJ = this.tabela[0].length-1;
	var sup = this.tabela[i][tamJ];
	var dem = this.tabela[tamI][j];
	
	//Aloca maximo possivel
	this.tabela[i][j].qtd = sup > dem ? dem : sup;
	
	//Calcula quantidades restantes
	this.tabela[i][tamJ] = sup > dem ? sup-dem : 0;
	this.tabela[tamI][j] = sup > dem ? 0 : dem-sup;

	return this.tabela;
};

CantoNoroeste.prototype = new SolverTransporte();
CantoNoroeste.prototype.constructor = CantoNoroeste;
function CantoNoroeste (tabela){
	SolverTransporte.prototype.constructor.call(this, tabela, function(){
		if(!this.atual){
			this.atual = {i: 0, j: 0};
		}
		else{
			//Se fornecimento esgotou vai para proxima linha
			if(this.tabela[this.atual.i][this.tabela[0].length-1] === 0){
				this.atual.i++;
			}
			//Se demanda esgotou vai para proxima coluna
			else if(this.tabela[this.tabela.length-1][this.atual.j] === 0){
				this.atual.j++;
			}
		}

		return this.atual;
	});
};

MenorCusto.prototype = new SolverTransporte();
MenorCusto.prototype.constructor = MenorCusto;
function MenorCusto (tabela){
	SolverTransporte.prototype.constructor.call(this, tabela, function(){
		//Calcula celula com menor custo
		var minimo = 0 / 0;
		this.atual = undefined;
		for(var i = 0; i < this.tabela.length - 1; i++){
			for(var j = 0; j < this.tabela[0].length - 1; j++){
				if(    (this.tabela[i][j].custo < minimo
					 ||
					   isNaN(minimo))
				   &&
				     !this.tabela[i][j].visitado
				   &&
				   	 this.tabela[i][this.tabela[i].length-1] !== 0
				   &&
				   	 this.tabela[this.tabela.length-1][j] !== 0){

					minimo = this.tabela[i][j].custo;
					this.atual = { "i": i, "j": j };
				}
			}
		}

		return this.atual;
	});
};

MAV.prototype = new SolverTransporte();
MAV.prototype.constructor = MAV;
function MAV (tabela){
	SolverTransporte.prototype.constructor.call(this, tabela, function(){
		var multaLinha = [], multaColuna = [];
		var t = this.tabela;

		//Calculando multa por linhas
		for(var i = 0; i < t.length-1; i++){
			//Caso linha ja tenha sido feita - multa "infinita"
			if(t[i][t[i].length-1] === 0){
				multaLinha.push({"multa": -1, "idx": 0})
				continue;
			}
			var menor = undefined, sMenor = undefined, idx = undefined;
			for(var j = 0; j < t[i].length-1; j++){
				if(t[i][j].qtd === 0 && t[t.length-1][j] > 0 && (sMenor === undefined || t[i][j].custo < sMenor)) {
					if(menor === undefined || t[i][j].custo < menor){
						sMenor = menor;
						menor = t[i][j].custo;
						idx = j;
					}
					else{
						sMenor = t[i][j].custo;
					}
				}
			}
			multaLinha.push({"multa": sMenor === undefined ? menor : sMenor - menor, "idx": idx});
		}

		//Calculando multa por colunas
		for(var j = 0; j < t[0].length-1; j++){
			//Caso coluna ja tenha sido feita - multa "infinita"
			if(t[t.length-1][j] === 0){
				multaColuna.push({"multa": -1, "idx": 0})
				continue;
			}
			var menor = undefined, sMenor = undefined, idx = undefined;
			for(var i = 0; i < t.length-1; i++){
				if(t[i][j].qtd === 0 && t[i][t[i].length-1] > 0 && (sMenor === undefined || t[i][j].custo < sMenor)) {
					if(menor === undefined || t[i][j].custo < menor){
						sMenor = menor;
						menor = t[i][j].custo;
						idx = i;
					}
					else{
						sMenor = t[i][j].custo;
					}
				}
			}
			multaColuna.push({"multa": sMenor === undefined ? menor : sMenor - menor, "idx": idx});
		}

		//Encontra maior multa
		var maiorLinha = multaLinha[0], maiorColuna = multaColuna[0];
		var idxL = 0, idxC = 0;

		for(var i = 1; i < multaLinha.length; i++){
			if(maiorLinha.multa < multaLinha[i].multa){
				idxL = i;
				maiorLinha = multaLinha[i];
			}	
		}

		for(var i = 1; i < multaColuna.length; i++){
			if(maiorColuna.multa < multaColuna[i].multa){
				idxC = i;
				maiorColuna = multaColuna[i];
			}	
		}

		var res = maiorLinha.multa > maiorColuna.multa ? {i: idxL, j: maiorLinha.idx} : {i: maiorColuna.idx, j: idxC};
		return res;
	});
};

function copiaTabela(tabela){
	var copia = [];
	for(var i = 0; i < tabela.length; i++){
		copia.push([]);
		for(var j = 0; j < tabela[i].length; j++){
			if(i < tabela.length - 1 && j < tabela[i].length - 1){
				var x = {};
				x.custo = tabela[i][j].custo;
				x.qtd = tabela[i][j].qtd;
				x.visitado = tabela[i][j].visitado;
				copia[i].push(x);
			}
			else{
				copia[i].push(tabela[i][j]);
			}
		}
	}
	return copia;
};

//# sourceURL=transporte.js
