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
            const desenharCronometro = function () {
                if (simulador.core.iniciado) {
                    fill(0);
                    noStroke();
                    const valor = (Date.now() - simulador.core.tempoInicio) / 1000;
                    const valorTxt = `${valor} secs`;
                    textSize(12);
                    textStyle(BOLD);
                    text(valorTxt, simulador.board.largura - 10 - textWidth(valorTxt), 15);
                    stroke(0);
                    fill(255);
                }
            };
            desenharQuadro();
            desenharDivisoria();
            desenharCronometro();
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
        gravidade: 9.807 / 100, // gravidade da terra
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
        movimentacaoDelay: 50,
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
            simulador.core.tempoInicio = Date.now();
            this.pidControle = setInterval(function () {
                const posicao = simulador.bolinha.posicao * -1;
                const pidResposta = simulador.core.pidCodigo(posicao, simulador.contexto);
                simulador.core.pidResposta = pidResposta;
            }, simulador.core.pidFrequencia);
            this.iniciado = true;
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

            // calcula posição da barra
            const metadeBarra = simulador.barra.tamanho() / 2;
            let sentidoAngulo = 0; // quando esta na metade exata da barra
            if (simulador.bolinha.posicao > metadeBarra) sentidoAngulo = -1;
            else if (simulador.bolinha.posicao < metadeBarra) sentidoAngulo = 1;

            simulador.barra.angulo +=
                (simulador.bolinha.tamanho * simulador.core.gravidade * sentidoAngulo * simulador.bolinha.posicao) /
                simulador.barra.tamanho();

            this.aceleracao += this.pidResposta * 0.2;
            this.aceleracao += simulador.barra.angulo;
            simulador.bolinha.posicao += this.aceleracao + this.pidResposta;
            simulador.grafico.adicionar([simulador.bolinha.posicao, this.aceleracao, this.pidResposta]);
        },
        loop: function () {
            if (simulador.core.fimDeJogo && simulador.core.iniciado) {
                if (confirm("Iniciar novo jogo?")) simulador.core.novoJogo();
                else {
                    this.aceleracao = 0;
                    this.pidResposta = 0;
                    this.movimentacaoLastDelay = 0;
                }
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
         * Acumuladores de resultados de sistema. Cada item é um array de [erro, aceleracao, pidtotal].
         */
        acumulador: [],
        /**
         * Acumuladores de usuário
         */
        acumuladoresUsuario: {},
        /**
         * Resultados
         */
        adicionar: function (resultado) {
            this.acumulador = [...this.acumulador.splice((simulador.board.largura - 1) * -1), resultado];
        },
        adicionarGrafico: function ({ nome, cor, valor }) {
            if (!this.acumuladoresUsuario[nome]) {
                this.acumuladoresUsuario[nome] = {
                    cor,
                    valores: [valor],
                    desenharGrafico: null,
                };
                this.acumuladoresUsuario[nome].desenharGrafico = simulador.grafico.desenharGraficoRelativo(
                    cor,
                    undefined,
                    () => this.acumuladoresUsuario[nome].valores
                );
                console.log("Adicionando termo:", nome, "ao gráfico. Cor:", cor, " - Valor:", valor);
            } else
                this.acumuladoresUsuario[nome].valores = [
                    ...this.acumuladoresUsuario[nome].valores.splice((simulador.board.largura - 1) * -1),
                    valor,
                ];
        },
        altura: function () {
            return this.alturaProporcional * simulador.board.comprimento;
        },
        desenharGraficoRelativo: function (cor, funcaoSugerida, acumuladorSugerido) {
            const funcaoUsada = funcaoSugerida ? funcaoSugerida : (cur) => cur;
            const inicioGrafico = simulador.board.inicioGrafico();
            const finalGrafico = simulador.board.finalGrafico();
            const tamanhoGrafico = finalGrafico - inicioGrafico;
            const meioGrafico = tamanhoGrafico / 2 + inicioGrafico;
            return function () {
                const acumuladorUsado = acumuladorSugerido ? acumuladorSugerido() : simulador.grafico.acumulador;
                stroke(...cor);
                let oldpos = {
                    x: 0,
                    y: meioGrafico,
                };
                // encontra o maximo e minimo
                const [min, max] = acumuladorUsado.reduce(
                    (acc, cur) => {
                        let [i, a] = acc;
                        const v = funcaoUsada(cur);
                        return [Math.min(i, v), Math.max(a, v)];
                    },
                    [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
                );
                const deltaV = max - min;
                acumuladorUsado.forEach((cur, i) => {
                    const v = funcaoUsada(cur);
                    const part1 = (max - v - deltaV) / (deltaV * -1);
                    const part2 = tamanhoGrafico * part1;
                    const local = finalGrafico - part2;
                    line(oldpos.x, oldpos.y, i, local);
                    //console.log(min, max, v, part1, part2, local, i);
                    oldpos.x = i;
                    oldpos.y = local;
                });
                strokeWeight(1);
                stroke(0);
            };
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
                stroke(0);
                strokeWeight(2);
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
                    line(oldpos.x, oldpos.y, i, local);
                    oldpos.x = i;
                    oldpos.y = local;
                });
                strokeWeight(1);
                stroke(0);
            };
            const desenharGraficoAceleracao = this.desenharGraficoRelativo([0, 0, 255], function (cur) {
                return cur[1];
            });

            const desenharGraficoResposta = this.desenharGraficoRelativo([255, 0, 0], function (cur) {
                return cur[2];
            });

            const desenharLegendas = function () {
                const refY = simulador.board.finalSimulacao();
                textSize(12);
                textStyle(BOLD);
                fill(255);
                strokeWeight(1);
                rect(simulador.board.largura - 160, refY - 52, 159, 52);
                noStroke();
                fill(255, 0, 0);
                text("Resposta PID", simulador.board.largura - 83, refY - 34);
                fill(0, 0, 255);
                text("Aceleração da bolinha", simulador.board.largura - 133, refY - 20);
                fill(0, 255, 0);
                text("Erro (Distância do centro)", simulador.board.largura - 153, refY - 6);
                fill(255);
                stroke(1);
            };
            const desenharGraficoUsuario = function () {
                Object.keys(simulador.grafico.acumuladoresUsuario).forEach((v) => {
                    if (simulador.grafico.acumuladoresUsuario[v].desenharGrafico) {
                        simulador.grafico.acumuladoresUsuario[v].desenharGrafico();
                    }
                });
            };

            desenharReticulas();
            desenharLegendas();
            desenharGraficoDistancia();
            desenharGraficoAceleracao();
            desenharGraficoResposta();
            desenharGraficoUsuario();
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

var handleKeys = null;

function keyPressed() {
    handleKeys = setInterval(() => {
        //console.log(keyCode);
        if (keyCode === 40) {
            // Seta para baixo
            simulador.barra.angulo -= 0.5;
        } else if (keyCode === 38) {
            simulador.barra.angulo += 0.5;
        } else if (keyCode === 37) {
            simulador.bolinha.posicao += 5;
        } else if (keyCode === 39) {
            simulador.bolinha.posicao -= 5;
        } else if (keyCode === 61) {
            simulador.bolinha.tamanho += 2;
        } else if (keyCode === 173) {
            simulador.bolinha.tamanho -= 2;
        }
        return false;
    }, 100);
}

function keyReleased() {
    if (handleKeys) clearInterval(handleKeys);
    handleKeys = null;
}
