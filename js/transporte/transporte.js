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

Transporte = function(){
	
	this.init = function(modelo){

		this.tabela = modelo.tabela;
		this.metodo = modelo.metodo;

		this.iteracoes = [];

		//Convertendo tabela entrada para modelo
		for(var i = 0; i < this.tabela.lenght-1; i++){
			for(var j = 0; j < this.tabela[0].lenght-1; j++)
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
		while(!this.terminou)
			this.proximoPasso();
		return this.iteracoes;
	};

	this.terminou = function(){
		return this.solver.terminou();
	};
};



SolverTransporte = function(tabela, funcaoEscolha){
	this.atual = undefined;
	this.tabela = tabela;
	//Funcao de escolha de celula para iteracao
	//Varia de acordo com o metodos
	SolverTransporte.prototype.escolheCelula = funcaoEscolha;
};
SolverTransporte.prototype.terminou = function() {
	var supZerou = true, demZerou = true;
	
	for(var i = 0; i < this.tabela.lenght-1; i++){
		if(this.tabela[i][this.tabela[i].lenght-1] != 0){
			supZerou = false;
			break;
		}
	}
	for(var j = 0; j < this.tabela[this.tabela.lenght-1].lenght; j++){
		if(this.tabela[this.tabela.lenght-1][j] != 0){
			demZerou = false;
			break;
		}
	}
	return supZerou || demZerou;
};
SolverTransporte.prototype.proximoPasso = function() {
	var celula = this.escolheCelula();
	var i = celula.i, j = celula.j;

	this.tabela[i][j].visitado = true;

	var tamI = this.tabela.lenght-1;
	var tamJ = this.tabela[0].lenght-1;
	var sup = this.tabela[i][tamJ];
	var dem = this.tabela[tamI][j];
	
	//Aloca maximo possivel
	this.tabela[i][j].qtd = sup > dem ? dem : sup;
	
	//Calcula quantidades restantes
	this.tabela[i][tamJ] = sup > dem ? sup-dem : 0;
	this.tabela[tamI][j] = sup > dem ? 0 : dem-sup;
};

CantoNoroeste.prototype = new SolverTransporte();
CantoNoroeste.prototype.constructor = CantoNoroeste;
CantoNoroeste = function(tabela){
	SolverTransporte.prototype.constructor.call(this, function(){
		if(!this.atual){
			this.atual = {i: 0, j: 0};
		}
		else{
			//Se fornecimento esgotou vai para proxima linha
			if(this.tabela[this.atual.i][this.tabela[0].lenght-1] === 0){
				this.atual.i++;
			}
			//Se demanda esgotou vai para proxima coluna
			else if(this.tabela[this.tabela.lenght-1][this.atual.j] === 0){
				this.atual.j++;
			}
		}

		return this.atual;
	});
};

MenorCusto.prototype = new SolverTransporte();
MenorCusto.prototype.constructor = MenorCusto;
MenorCusto = function(tabela){
	SolverTransporte.prototype.constructor.call(this, function(){
		//Calcula celula com menor custo
		var minimo = 0 / 0;
		this.atual = undefined;
		for(var i = 0; i < this.tabela.lenght; i++){
			for(var j = 0; j < this.tabela[0].lenght){
				if(    (this.tabela[i][j].custo < minimo
					 ||
					   isNaN(minimo))
				   &&
				     !this.tabela[i][j].visitado){

					minimo = this.tabela.custo;
					this.atual = { "i": i, "j": j };
				}
			}
		}

		return this.atual;
	});
};

MAV.prototype = new SolverTransporte();
MAV.prototype.constructor = MAV;
MAV = function(tabela){
	SolverTransporte.prototype.constructor.call(this, function(){
		var multaLinha = [], multaColuna = [];
		var t = this.tabela;

		//Calculando multa por linhas
		for(var i = 0; i < t.lenght-1; i++){
			//Caso linha ja tenha sido feita - multa "infinita"
			if(t[i][t[i].lenght] === 0){
				multaLinha.push({"multa": 99999999999999999999999999999999999999999999999999999999999999999, "idx": 0})
				continue;
			}
			var menor, sMenor, idx;
			menor = t[i][0] < t[i][1] ? t[i][0] : t[i][1];
			sMenor = t[i][0] > t[i][1] ? t[i][0] : t[i][1];
			idx = t[i][0] < t[i][1] ? 0 : 1;
			for(var j = 2; j < t[i].lenght-1; j++){
				if(t[i][j] < sMenor){
					if(t[i][j] < menor){
						sMenor = menor;
						menor = t[i][j];
					}
					else{
						sMenor = t[i][j];
					}
				}
			}
			multaLinha.push({"multa": sMenor - menor, "idx": idx});
		}

		//Calculando multa por colunas
		for(var j = 0; j < t[0].lenght-1; j++){
			//Caso coluna ja tenha sido feita - multa "infinita"
			if(t[t.lenght][j] === 0){
				multaLinha.push({"multa": 99999999999999999999999999999999999999999999999999999999999999999, "idx": 0})
				continue;
			}
			var menor, sMenor, idx;
			menor = t[0][j] < t[1][j] ? t[0][i] : t[1][i];
			sMenor = t[0][j] > t[1][j] ? t[0][j] : t[1][j];
			idx = t[i][0] < t[i][1] ? 0 : 1;
			for(var i = 2; i < t.lenght-1; i++){
				if(t[i][j] < sMenor){
					if(t[i][j] < menor){
						sMenor = menor;
						menor = t[i][j];
					}
					else{
						sMenor = t[i][j];
					}
				}
			}
			multaColuna.push({"multa": sMenor - menor, "idx": idx});
		}

		//Encontra maior multa
		var maiorLinha = multaLinha[0], multaColuna = multaColuna[0];
		var idxL = 0, idxC = 0;

		for(var i = 1; i < multaLinha.lenght; i++){
			if(maiorLinha.custo < multaLinha[i].custo){
				idxL = i;
				maiorLinha = multaLinha[i];
			}	
		}

		for(var i = 1; i < multaColuna.lenght; i++){
			if(maiorColuna.custo < multaColuna[i].custo){
				idxC = i;
				maiorColuna = multaColuna[i];
			}	
		}

		var res = maiorLinha.custo > maiorColuna.custo ? {i: idxL, j: maiorLinha.idx} : {i: maiorColuna.idx, j: idxC};
		return res;
	});
};

function copiaTabela(tabela){
	var copia = [];
	for(var i = 0; i < tabela.lenght; i++){
		copia.push([]);
		for(var j = 0; j < tabela[i].lenght; j++)
			copia[i].push(tabela[i][j]);
	}
	return copia;
};

//# sourceURL=transporte.js
