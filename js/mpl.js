
function getTableValues() {
    var contObj = 0;
    var contRel = 0;
    var contRhs = 0;
    var contUp = 0;
    var contLow = 0;
    var contRes = 0;

    var problema = document.getElementById("problema").value;

    objetivo = [];
    restricoes = [];
    relacoes = [];
    rhs = [];
    upper = [];
    lower = [];

    //Pegando dados da Tabela
    $(".fObj").each(function () {
        objetivo[contObj] = $(this).val();
        contObj++;
    });
    $(".xRest").each(function () {
        restricoes[contRes] = $(this).val();
        contRes++;
    });
    $(".relacao").each(function () {
        relacoes[contRel] = $(this).val();
        contRel++;
    });
    $(".ladoDir").each(function () {
        rhs[contRhs] = $(this).val();
        contRhs++;
    });
    $(".limSup").each(function () {
        upper[contUp] = $(this).val();
        contUp++;
    });
    $(".limInf").each(function () {
        lower[contLow] = $(this).val();
        contLow++;
    });

    return {
        problema: problema,
        objetivo: objetivo,
        restricoes: restricoes,
        relacoes: relacoes,
        rhs: rhs,
        upper: upper,
        lower: lower
    };
}
function mpl() {
    var body;
    var bodyContent;
    var x = getTableValues();
    var obj = "";
    var lim = "";


    var myWindow = window.open("", "_blank", " scrollbars=yes, resizable=yes,width=600, height=400, top=200px, left=200px");
    //myWindow.document.title = "Modelo de Programação Linear";

    bodyContent = '<div class="row">'
    bodyContent += '<div class="col-xs-1">';
    if (x["problema"] == "Maximize") {
        bodyContent += '<span>max:</span>';
    } else {
        bodyContent += '<span>min:</span>';
    }
    bodyContent += '</div>'
    bodyContent += '<div class="col-xs-10">';
    for (i = 1; i <= x["objetivo"].length; i++) {
        var num = x["objetivo"][i - 1];
        if (num.length > 0) {
            if (num >= 0 && i != 1) {
                obj += " + " + num + "x_" + i;
            }
            else {
                obj += num + "x_" + i;
            }
        }
    }

    bodyContent += "` " + obj + " `";
    bodyContent += '</div>'
    bodyContent += '</div>'


    bodyContent += '<div class="row" style="padding-top: 5px;">'
    bodyContent += '<div class="col-xs-3">';
    bodyContent += "<span>sujeito a:</span>";
    bodyContent += '</div>';
    bodyContent += '<div class="col-xs-9">';


    //for (i = 1; i <= x["restricoes"].length; i++) {



    //}

    bodyContent += '</div>';

    bodyContent += '</div>';
    bodyContent += '<div class="row" style="padding-top: 5px;">'
    bodyContent += '<div class="col-xs-1">'
    bodyContent += "<span>e:</span>";
    bodyContent += '</div>';
    bodyContent += '<div class="col-xs-10" >';

    for (i = 1; i <= x["lower"].length; i++) {
        var numL = x["lower"][i - 1];
        var numUp = x["upper"][i - 1];
        if (numL.length > 0 && numUp > 0) {
            lim += numL + " <= " + "x_" + i + " <= " + numUp + ";";
        }
        else {
            if (numL.length > 0) {
                lim += "x_" + i + " >= " + numL + "; ";
            }
            if (numUp.length > 0) {
                lim += "x_" + i + " <= " + numUp + "; ";
            }
        }
    }
    bodyContent += "`" + lim + "`";
    bodyContent += '</div>';
    bodyContent += '</div>';

    //Painel para criar nova pagina

    body = '<head><link href="css/bootstrap.css" rel="stylesheet">'
            + ' <script type="text/javascript" src="js/jquery.min.js"></script>'
+ '<script>(function () {'
   + ' var script = document.createElement("script");'
+ 'script.type = "text/javascript";'
 + 'script.src  = "js/MathJax/MathJax.js?config=AM_HTMLorMML";'
  + 'document.getElementsByTagName("head")[0].appendChild(script);'

    + ' var script2 = document.createElement("script");'
+ 'script2.type = "text/javascript";'
 + 'script2.src  = "js/ASCIIMathML.js";'
  + 'document.getElementsByTagName("head")[0].appendChild(script2);'
  + '})();</script>'
            + '</head>';
    body += '<div class="panel panel-primary">' +
      '<div class="panel-heading">' +
        '<h3 class="panel-title" id="panel-title">Modelo de Programação Linear<a class="anchorjs-link" href="#panel-title"><span class="anchorjs-icon"></span></a></h3>' +
      '</div>' +
      '<div class="panel-body">' +
       bodyContent +
      '</div>' +
   ' </div>';


    myWindow.document.write(body);
    //myWindow.opener.document.write("<p>This is the source window!</p>");
}