function BranchBound(/* Parametros do simplex */) {
    /*
     Classe que controlara a chamada do simplex
     */

    /* Parametros do simplex em variaveis privadas*/
    include("caminho do simplex");
    include("heap.js");
    
    this.preparaSource = function(){
        
    };

    this.passoAPasso = function () {

    };

    this.proximoPasso = function () {

    };

    this.resolve = function (source) {

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

    this.getHeap = function () {
        return this.array;
    };

}




function include(path) {
    var aux = document.createElement("script");
    aux.type = "text/javascript";
    aux.src = path;
    document.body.appendChild(aux);
}
;