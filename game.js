/**
 * Configuração do Jogo
 */
var simulador = {
    /**
     * Variaveis criadas pelo próprio usuário que são enviadas a cada
     * executação do PID.
     */
    contexto: {},
    /**
     * São os elementos gráficos básicos do jogo
     */
    board: {
        /**
         * Comprimento da tela em pixels
         */
        comprimento: 400,
        /**
         * Largura da tela em pixels
         */
        largura: 1000,
        /**
         * Calcula o ponto Central de X
         */
        centroX: function () {
            return this.largura / 2;
        },
        /**
         * Posição Y do final da simulação
         */
        finalSimulacao: function () {
            return this.comprimento - simulador.grafico.altura();
        },
        /**
         * Posição Y do inicio da simulação
         */
        inicioSimulacao: function () {
            return 0;
        },
        /**
         * Posição de início do gráfico
         */
        inicioGrafico: function () {
            return this.finalSimulacao();
        },
        /**
         * Posição final do gráfico
         */
        finalGrafico: function () {
            return this.comprimento;
        },
        /**
         * Desenha o simulador do jogo e suas principais informações
         */
        desenhar: function () {
            const desenharDivisoria = function () {
                // linha divisoria do grafico
                line(0, simulador.board.finalSimulacao(), simulador.board.largura, simulador.board.finalSimulacao());
            };
            const desenharQuadro = function () {
                rect(0, 0, simulador.board.largura, simulador.board.comprimento);
            };
            desenharQuadro();
            desenharDivisoria();
        },
    },
    /**
     * Triangulo sobre o qual a barra fica estabelecida.
     */
    triangulo: {
        alturaProporcional: 0.5,
        larguraProporcional: 0.05,
        largura: function () {
            return simulador.board.largura * this.larguraProporcional;
        },
        altura: function () {
            return simulador.board.finalSimulacao() * this.alturaProporcional;
        },
        topo: function () {
            const alturaTriangulo = simulador.board.finalSimulacao() - this.altura();
            return alturaTriangulo;
        },
        desenhar: function () {
            const x1 = simulador.board.centroX() - this.largura() / 2;
            const y1 = simulador.board.finalSimulacao();
            const x2 = simulador.board.centroX();
            const y2 = this.topo();
            const x3 = simulador.board.centroX() + this.largura() / 2;
            const y3 = simulador.board.finalSimulacao();
            stroke(0);
            triangle(x1, y1, x2, y2, x3, y3);
        },
    },
    barra: {
        /**
         * Tamanho proporcional da barra (%) em relação a tela do simulador
         */
        tamanhoProporcional: 0.8,
        /**
         * Espessura proporcional da barra (%) em relação a tela do simulador
         */
        espessuraProporcional: 0.05,
        /**
         * Angulo da barra (em graus)
         */
        angulo: 0,
        /**
         * Converte de tamanho proporcional para Pixels
         */
        tamanho: function () {
            return simulador.board.largura * this.tamanhoProporcional;
        },
        /**
         * Espessura da Barra em pixels
         */
        espessura: function () {
            return (simulador.board.finalSimulacao() - simulador.board.inicioSimulacao()) * this.espessuraProporcional;
        },
        /**
         * Calcula se a ponta da barra esta ainda em posição valida!
         */
        posicaoValida: function () {
            // Verificar se a barra tocou as lateriais
            return true;
        },
        /**
         * Quando um novo jogo for iniciado, retorna a barra a situação original
         */
        novoJogo: function () {
            this.angulo = 0;
        },
        /**
         * Desenha a barra
         */
        desenhar: function () {
            const metadeBarra = this.tamanho() / 2;
            const centroBarraY = simulador.triangulo.topo() - simulador.barra.espessura() / 2;
            const anguloX1Ref = cos(this.angulo * (PI / 180)) * metadeBarra;
            const anguloY1Ref = sin(this.angulo * (PI / 180)) * metadeBarra;
            const anguloX2Ref = cos(this.angulo * (PI / 180)) * metadeBarra;
            const anguloY2Ref = sin(this.angulo * (PI / 180)) * metadeBarra;
            const x1 = simulador.board.centroX() - anguloX1Ref;
            const y1 = centroBarraY + anguloY1Ref;
            const x2 = simulador.board.centroX() + anguloX2Ref;
            const y2 = centroBarraY - anguloY2Ref;
            fill(255);
            strokeWeight(simulador.barra.espessura());
            line(x1, y1, x2, y2);
            strokeWeight(1);
        },
    },
    bolinha: {
        /**
         * Diametro da bolinha em pixels
         */
        tamanho: 10,
        /**
         * Posição em pixels em relação a barra
         */
        posicao: 0,
        /**
         * Proporção minima de distancia da bolinha da borda
         * Utilizado para iniciar o jogo (posição randomica).
         */
        distanciaMinimaBorda: 3,
        novoJogo: function () {
            this.tamanho = random(10, 40);
            const faixaPosicao = simulador.barra.tamanho() / 2 - this.distanciaMinimaBorda * this.tamanho;
            this.posicao = random(faixaPosicao * -1, faixaPosicao);
        },
        desenhar: function () {
            const anguloX = cos(simulador.barra.angulo * (PI / 180)) * this.posicao;
            const anguloY = sin(simulador.barra.angulo * (PI / 180)) * this.posicao;
            noFill();
            circle(
                simulador.board.centroX() - anguloX,
                simulador.triangulo.topo() + anguloY - simulador.barra.espessura() - this.tamanho / 2,
                this.tamanho
            );
        },
        posicaoValida: function () {
            const meiaBarra = simulador.barra.tamanho() / 2;
            return this.posicao < meiaBarra && this.posicao > meiaBarra * -1;
        },
    },

    core: {
        /**
         * Se o jogo já foi iniciado
         */
        iniciado: false,
        /**
         * Quando alguma situação ocorre que provoca o fim de jogo.
         */
        fimJogo: false,
        /**
         * Frame rate do jogo (10ms)
         */
        frameRate: 100,
        /**
         * Simulação de gravidade (para descer a barra)
         * 9.807 = Gravidade da Terra
         * 10.000 = Atenuador (em função do tamanho do simulador)
         */
        gravidade: 9.807 / 1000, // gravidade da terra
        /**
         * Velocidade de avanço a uma determinada direção
         * Se negativo -> avança para esquerda
         * Se positivo -> avança para direita
         */
        aceleracao: 0,
        /**
         * Frequencia de execução do PID do usuário
         * 1000 (1s) / 8k = 8khz de frequencia.
         *
         * Importante: o PID roda em uma thread (separada).
         */
        pidFrequencia: 1000 / (8 * 1000),
        /**
         * Controla o Handler (setInterval) da execução do PID do usuário.
         */
        pidControle: null,
        /**
         * Código do usuário a ser executado
         * @param {number} distancia Distancia de -1 a 1 do ponto ideal (0).
         * @param {object} contexto Objeto para salvar o contexto entre as chamadas da função
         */
        pidCodigo: function (distancia, contexto) {
            console.log("NÃO DEFINIDO: ", distancia, contexto);
        },
        /**
         * Ultima resposta recebida do código do usuário (como fator de aceleração)
         */
        pidResposta: 0,
        /**
         * A cada quantos milisegundos deve ser executado a movimentação (dinâmica do jogo)
         */
        movimentacaoDelay: 10,
        /**
         * Quando foi executado a última movimentação.
         */
        movimentacaoLastDelay: 0,
        /**
         * Zera as codições de jovo (mas fica em estágio de espera do inicio)
         */
        novoJogo: function () {
            this.aceleracao = 0;
            this.pidResposta = 0;
            this.movimentacaoLastDelay = 0;
            this.iniciado = false;
            simulador.contexto = {};
            simulador.bolinha.novoJogo();
            simulador.barra.novoJogo();
        },
        /**
         * Paraliza o status do jogo
         */
        pararJogo: function () {
            this.iniciado = false;
            this.fimDeJogo = true;
            if (this.pidControle) {
                clearInterval(this.pidControle);
                this.pidControle = null;
            }
        },
        /**
         * Inicia o jogo do ponto paralizado
         */
        iniciarJogo: function () {
            this.pidControle = setInterval(function () {
                const posicao = simulador.bolinha.posicao * -1;
                const pidResposta = simulador.core.pidCodigo(posicao, simulador.contexto);
                simulador.core.pidResposta = pidResposta;
            }, simulador.core.pidFrequencia);
            simulador.core.iniciado = true;
        },
        /**
         * Verifica se atingiu alguma condição de fim de jogo
         */
        verificaFimJogo: function () {
            if (!simulador.bolinha.posicaoValida()) {
                simulador.core.pararJogo();
                console.log("Fim de jogo: a bolinha caiu!");
            }
            if (!simulador.barra.posicaoValida()) {
                simulador.core.pararJogo();
                console.log("Fim de jogo: a barra tocou a lateral");
            }
        },
        /**
         * Movimenta a fisica do jogo
         */
        movimenta: function () {
            // console.log({
            //     resposta: this.pidResposta,
            //     angulo: simulador.barra.angulo,
            //     aceleracao: this.aceleracao,
            //     posicaoBolinha: simulador.bolinha.posicao,
            // });
            this.aceleracao += this.pidResposta;
            this.aceleracao += simulador.barra.angulo;
            simulador.bolinha.posicao += this.aceleracao;

            // calcula posição da barra
            const metadeBarra = simulador.barra.tamanho() / 2;
            let sentidoAngulo = 0; // quando esta na metade exata da barra
            if (simulador.bolinha.posicao > metadeBarra) sentidoAngulo = -1;
            else if (simulador.bolinha.posicao < metadeBarra) sentidoAngulo = 1;
            simulador.barra.angulo +=
                (simulador.bolinha.tamanho * simulador.core.gravidade * sentidoAngulo * simulador.bolinha.posicao) /
                simulador.barra.tamanho();

            simulador.grafico.adicionar([simulador.bolinha.posicao, this.aceleracao, this.pidResposta]);
        },
        loop: function () {
            if (simulador.core.fimDeJogo && simulador.core.iniciado) {
                if (confirm("Iniciar novo jogo?")) simulador.core.novoJogo();
                simulador.core.fimDeJogo = false;
                simulador.core.iniciado = true;
            }

            // Controla a frequencia de atualização do jogo
            if (millis() - this.movimentacaoLastDelay > this.movimentacaoDelay) {
                this.movimentacaoLastDelay = millis();

                // Deseja o status do jogo
                clear();
                simulador.board.desenhar();
                simulador.triangulo.desenhar();
                simulador.barra.desenhar();
                simulador.bolinha.desenhar();
                simulador.grafico.desenhar();

                // Processa a engine do jogo
                if (simulador.core.iniciado) {
                    this.movimenta();
                    this.verificaFimJogo();
                }
            }
        },
    },
    grafico: {
        /**
         * Altura proporcional do gráfico (em porcentagem)
         */
        alturaProporcional: 0.5,
        /**
         * Numero de reticulas do gráfico
         */
        reticulas: 200,
        /**
         * Acumula resultados
         */
        acumulador: [],
        /**
         * Resultados
         */
        adicionar: function (resultado) {
            this.acumulador = [...this.acumulador.splice((simulador.board.largura - 1) * -1), resultado];
        },
        altura: function () {
            return this.alturaProporcional * simulador.board.comprimento;
        },
        desenhar: function () {
            const desenharReticulas = function () {
                // desenha as reticulas
                stroke(200);
                const larguraReticula = simulador.board.largura / simulador.grafico.reticulas;
                for (var x = 0; x < simulador.grafico.reticulas; x += 1) {
                    const posicaoReticula = x * larguraReticula;
                    line(posicaoReticula, simulador.board.inicioGrafico(), posicaoReticula, simulador.board.finalGrafico());
                }
                stroke(255, 0, 0);
                const meioGrafico =
                    (simulador.board.finalGrafico() - simulador.board.inicioGrafico()) / 2 + simulador.board.inicioGrafico();
                line(0, meioGrafico, simulador.board.largura, meioGrafico);
                stroke(0);
                // desenha linha ideal
                // desenha os últimos (X = largura) pontos recebidos
            };
            const desenharGraficoDistancia = function () {
                stroke(0, 255, 0);
                strokeWeight(2);
                const barraTamanho = simulador.barra.tamanho();
                const inicioGrafico = simulador.board.inicioGrafico();
                const finalGrafico = simulador.board.finalGrafico();
                const tamanhoGrafico = finalGrafico - inicioGrafico;
                const meioGrafico = tamanhoGrafico / 2 + inicioGrafico;
                let oldpos = {
                    x: 0,
                    y: meioGrafico,
                };
                simulador.grafico.acumulador.forEach(([v], i) => {
                    const posicaoRelativa = v / barraTamanho;
                    const local = posicaoRelativa * tamanhoGrafico + meioGrafico;
                    //circle(i, local, 3);
                    line(oldpos.x, oldpos.y, i, local);
                    oldpos.x = i;
                    oldpos.y = local;
                });
                strokeWeight(1);
                stroke(0);
                //fill(255);
            };

            const desenharGraficoRelativo = function (cor, funcParam) {
                return function () {
                    stroke(...cor);
                    const barraTamanho = simulador.barra.tamanho();
                    const inicioGrafico = simulador.board.inicioGrafico();
                    const finalGrafico = simulador.board.finalGrafico();
                    const tamanhoGrafico = finalGrafico - inicioGrafico;
                    const meioGrafico = tamanhoGrafico / 2 + inicioGrafico;
                    let oldpos = {
                        x: 0,
                        y: meioGrafico,
                    };
                    // aceleracao maxima
                    const [min, max] = simulador.grafico.acumulador.reduce(
                        ([i, a], cur) => {
                            const v = funcParam(cur);
                            if (v > a) a = v;
                            if (v < i) i = v;
                            return [i, a];
                        },
                        [0, 0]
                    );
                    const deltaV = max - min;
                    //console.log(cor, min, max);
                    // aceleracao minima
                    simulador.grafico.acumulador.forEach((cur, i) => {
                        const v = funcParam(cur);
                        const posicaoRelativa = v / deltaV;
                        const local = posicaoRelativa * tamanhoGrafico + meioGrafico;
                        line(oldpos.x, oldpos.y, i, local);
                        oldpos.x = i;
                        oldpos.y = local;
                    });
                    strokeWeight(1);
                    stroke(0);
                };
            };

            // const desenharGraficoAceleracao = function () {
            //     stroke(0, 0, 255);
            //     const barraTamanho = simulador.barra.tamanho();
            //     const inicioGrafico = simulador.board.inicioGrafico();
            //     const finalGrafico = simulador.board.finalGrafico();
            //     const tamanhoGrafico = finalGrafico - inicioGrafico;
            //     const meioGrafico = tamanhoGrafico / 2 + inicioGrafico;
            //     let oldpos = {
            //         x: 0,
            //         y: meioGrafico,
            //     };
            //     // aceleracao maxima
            //     const [min, max] = simulador.grafico.acumulador.reduce(
            //         ([i, a], [, aceleracao]) => {
            //             if (aceleracao > a) a = aceleracao;
            //             if (aceleracao < i) i = aceleracao;
            //             return [i, a];
            //         },
            //         [0, 0]
            //     );
            //     const deltaAceleracao = max - min;
            //     // aceleracao minima
            //     simulador.grafico.acumulador.forEach(([, v], i) => {
            //         const posicaoRelativa = v / deltaAceleracao;
            //         const local = posicaoRelativa * tamanhoGrafico + meioGrafico;
            //         line(oldpos.x, oldpos.y, i, local);
            //         oldpos.x = i;
            //         oldpos.y = local;
            //     });
            //     strokeWeight(1);
            //     stroke(0);
            // };
            const desenharGraficoAceleracao = desenharGraficoRelativo([0, 0, 255], function (cur) {
                return cur[1];
            });

            const desenharGraficoResposta = desenharGraficoRelativo([255, 0, 0], function (cur) {
                return cur[2];
            });

            const desenharLegendas = function () {
                const finalGrafico = simulador.board.finalGrafico();
                textSize(12);
                textStyle(BOLD);
                fill(255);
                rect(simulador.board.largura - 160, finalGrafico - 52, simulador.board.largura, finalGrafico);
                noStroke();
                fill(255, 0, 0);
                text("Resposta PID", simulador.board.largura - 80, finalGrafico - 34);
                fill(0, 0, 255);
                text("Aceleração da bolinha", simulador.board.largura - 130, finalGrafico - 20);
                fill(0, 255, 0);
                text("Erro (Distância do centro)", simulador.board.largura - 150, finalGrafico - 6);
                fill(255);
                stroke(1);
            };
            desenharReticulas();
            desenharLegendas();
            desenharGraficoDistancia();
            desenharGraficoAceleracao();
            desenharGraficoResposta();
        },
    },
};

// Setup inicial do jogo
function setup() {
    frameRate(simulador.core.frameRate);
    background(0);
    createCanvas(simulador.board.largura, simulador.board.comprimento);
    simulador.core.novoJogo();
}

function draw() {
    simulador.core.loop();
}

function keyReleased() {
    //console.log(keyCode);
    if (keyCode === 40) {
        // Seta para baixo
        simulador.barra.angulo -= 0.5;
    } else if (keyCode === 38) {
        simulador.barra.angulo += 0.5;
    } else if (keyCode === 37) {
        simulador.bolinha.posicao += 10;
    } else if (keyCode === 39) {
        simulador.bolinha.posicao -= 10;
    } else if (keyCode === 61) {
        simulador.bolinha.tamanho += 2;
    } else if (keyCode === 173) {
        simulador.bolinha.tamanho -= 2;
    }
    return false;
}
