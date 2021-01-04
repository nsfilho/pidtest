var board = {
    comprimento: 400, // px
    largura: 1000, // px
    barra: {
        tamanho: 0.8, // %,
        espessura: 0.05, // %
        angulo: 0, // graus
    },
    grafico: {
        altura: 200, // px
        reticulas: 100, // numero de movimento
    },
    triangulo: {
        altura: 0.4, // %
        largura: 0.05, // %
    },
    bolinha: {
        tamanho: 10, // px
        posicao: 0.1, // %
    },
    contexto: {},

    jogo: {
        iniciado: false,
        fimJogo: false,
        frameRate: 100, // 10ms
        gravidade: 9.807 / 10000, // gravidade da terra
        aceleracao: 0, // qual o fator de aceleração atual
        frequenciaTempo: 1, // numero de saltos entre cada chamada a função
        tempo: 10, // qual o contador atual para chamada
        codigo: function (distancia) {
            console.log("NÃO DEFINIDO: ", distancia);
        },
        distanciaMinimaBorda: 3, // proporção minima de distancia da bolinha da borda
        ultimaResposta: 0,
        delay: 10,
        lastDelay: 0,
    },
};

function desenhaTriangulo() {
    const baseDesenho = board.comprimento - board.grafico.altura;
    const alturaTriangulo = board.triangulo.altura * baseDesenho;
    const larguraTriangulo = board.triangulo.largura * board.largura;
    const centroTela = board.largura / 2;
    const x1 = centroTela - larguraTriangulo / 2;
    const x2 = centroTela;
    const x3 = centroTela + larguraTriangulo / 2;
    const y1 = baseDesenho;
    const y2 = baseDesenho - alturaTriangulo;
    const y3 = baseDesenho;

    stroke(0);
    triangle(x1, y1, x2, y2, x3, y3);
}

function desenhaBarra() {
    const baseDesenho = board.comprimento - board.grafico.altura;
    const alturaTriangulo = board.triangulo.altura * baseDesenho;
    const tamanhoBarra = board.largura * board.barra.tamanho;
    const espessuraBarra = (board.comprimento - board.grafico.altura) * board.barra.espessura;
    const centroBarraX = board.largura / 2;
    const centroBarraY = baseDesenho - alturaTriangulo - espessuraBarra / 2;
    const angulo1 = board.barra.angulo;
    const angulo2 = board.barra.angulo;
    const anguloX1Ref = cos(angulo1 * (PI / 180)) * (tamanhoBarra / 2);
    const anguloY1Ref = sin(angulo1 * (PI / 180)) * (tamanhoBarra / 2);
    const x1 = centroBarraX - anguloX1Ref;
    const y1 = centroBarraY + anguloY1Ref;
    const anguloX2Ref = cos(angulo2 * (PI / 180)) * (tamanhoBarra / 2);
    const anguloY2Ref = sin(angulo2 * (PI / 180)) * (tamanhoBarra / 2);
    const x2 = centroBarraX + anguloX2Ref;
    const y2 = centroBarraY - anguloY2Ref;

    fill(255);
    strokeWeight(espessuraBarra);
    line(x1, y1, x2, y2);
    strokeWeight(1);
}

function desenhaBolinha() {
    const baseDesenho = board.comprimento - board.grafico.altura;
    const alturaTriangulo = board.triangulo.altura * baseDesenho;
    const tamanhoBarra = board.largura * board.barra.tamanho;
    const espessuraBarra = (board.comprimento - board.grafico.altura) * board.barra.espessura;
    const centroBarraX = board.largura / 2;
    const centroBarraY = baseDesenho - alturaTriangulo - espessuraBarra / 2;
    const percentualParaCartesiano = tamanhoBarra * board.bolinha.posicao;
    const centroBolinhaX = centroBarraX - tamanhoBarra / 2 + percentualParaCartesiano;
    const centroBolinaY = baseDesenho - alturaTriangulo - espessuraBarra - board.bolinha.tamanho / 2;
    const anguloX = cos(board.barra.angulo * (PI / 180)) * ((tamanhoBarra * (1 - board.bolinha.posicao)) / 2);
    const anguloY = sin(board.barra.angulo * (PI / 180)) * ((tamanhoBarra * (1 - board.bolinha.posicao)) / 2);

    noFill();
    circle(
        centroBarraX - anguloX,
        centroBarraY + anguloY - espessuraBarra / 2 - board.bolinha.tamanho / 2,
        board.bolinha.tamanho
    );
}

function pecasDoJogo() {
    // desenha a base do triangulo
    desenhaTriangulo();

    // desenha a barra sobre o triangulo
    desenhaBarra();

    // desenha as margens da linha (terminadores no começo e no fim)

    // desenha a posicao da bola
    desenhaBolinha();
}

function movimenta() {}

function graficoDeMovimentacao() {
    // linha divisoria do grafico
    const baseDesenho = board.comprimento - board.grafico.altura;
    line(0, baseDesenho, board.largura, baseDesenho);

    // desenha as reticulas
    stroke(200);
    const larguraReticula = board.largura / board.grafico.reticulas;
    for (var x = 0; x < board.grafico.reticulas; x += 1) {
        const posicaoReticula = x * larguraReticula;
        line(posicaoReticula, baseDesenho + 1, posicaoReticula, board.comprimento);
    }

    // desenha linha ideal
    // desenha os últimos (X = largura) pontos recebidos
}

function calculaResistencia() {
    return board.bolinha.tamanho * board.barra.angulo * -1;
    //return (board.bolinha.tamanho * board.barra.angulo) / 10;
}

function movimenta() {
    const barraTamanho = board.barra.tamanho * board.largura;
    const sentido = board.jogo.aceleracao > 0 ? 1 : -1;
    const aceleracaoAntiga = board.jogo.aceleracao;
    const posicaoAntiga = board.bolinha.posicao;

    // calcula o angulo da barra
    board.barra.angulo += (posicaoAntiga - 1) * -1;

    board.jogo.aceleracao += board.jogo.ultimaResposta;
    board.jogo.aceleracao += calculaResistencia();

    // calcula a posição de X da bolinha na barra em pixels
    const bolinhaBarraAntigaX = barraTamanho * board.bolinha.posicao;
    const bolinhaBarraNovaX = bolinhaBarraAntigaX + board.jogo.aceleracao;
    board.bolinha.posicao = bolinhaBarraNovaX / barraTamanho;
    // console.log("Movimento:", {
    //     angulo: board.barra.angulo,
    //     sentido,
    //     aceleracaoAntiga,
    //     aceleracaoNova: board.jogo.aceleracao,
    //     bolinhaBarraAntigaX,
    //     bolinhaBarraNovaX,
    //     ultimaResposta: board.jogo.ultimaResposta,
    //     posicaoAntiga,
    //     posicaoNova: board.bolinha.posicao,
    // });
    textSize(16);
    fill(0, 0, 0);
    text(`Taxa Aceleração: ${Intl.NumberFormat().format(board.jogo.aceleracao)}`, 10, 20);
}

function verificaFimJogo() {
    if (board.bolinha.posicao < 0 || board.bolinha.posicao > 2) {
        board.jogo.iniciado = false;
        board.jogo.fimJogo = true;
        console.log("Fim de jogo");
    }
}

function setup() {
    background(0);
    createCanvas(board.largura, board.comprimento);
    novoJogo();
}

function novoJogo() {
    clear();
    board.jogo.tempo = board.jogo.frequenciaTempo;
    board.jogo.ultimaResposta = 0;
    board.barra.angulo = 0;
    board.jogo.aceleracao = 0;
    board.bolinha.tamanho = random(10, 40);
    board.contexto = {};
    const proporcaoTamanhoBolinha = board.bolinha.tamanho / (board.barra.tamanho * board.largura);
    const minPosicaoBolinha = 0 + proporcaoTamanhoBolinha * board.jogo.distanciaMinimaBorda;
    const maxPosicaoBolinha = 2 - proporcaoTamanhoBolinha * board.jogo.distanciaMinimaBorda;
    board.bolinha.posicao = random(minPosicaoBolinha, maxPosicaoBolinha);
    frameRate(board.jogo.frameRate);
    lastDelay = millis();
}

function draw() {
    if (board.jogo.fimJogo && board.jogo.iniciado) {
        board.jogo.fimJogo = false;
        novoJogo();
    }
    if (millis() - lastDelay > board.jogo.delay) {
        lastDelay = millis();
        clear();
        pecasDoJogo();
        graficoDeMovimentacao();
        if (board.jogo.iniciado) {
            board.jogo.tempo += 1;
            if (board.jogo.frequenciaTempo <= board.jogo.tempo) {
                // calcula movimento do jogador
                board.jogo.tempo = 0;
                const distanciaCalculada = board.bolinha.posicao - 1;
                const ultimaResposta = board.jogo.codigo(distanciaCalculada, board.contexto);
                board.jogo.ultimaResposta = ultimaResposta;
                //console.log("Resposta usuário: ", { ultimaResposta, distanciaCalculada, contexto: board.contexto });
            }
            movimenta();
            verificaFimJogo();
        }
    }
}
