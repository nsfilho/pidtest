"use strict";
require.config({
    baseUrl: "https://microsoft.github.io/monaco-editor/node_modules/monaco-editor/min/",
});

var editor = null,
    diffEditor = null,
    defaultCode = `
    /**
     * Teclas de atalho:
     * 
     * Seta para Cima / Baixo => Movimenta o Angulo da Barra
     * Seta para Esquerda / Direita => Movimenta Posição da Bolinha
     * Tecla "+" => Aumenta o tamanho da bolinha
     * Tecla "-" => Diminui o tamanho da bolinha
     * 
     * Distancia é um inteiro que contem o quanto longe você está do seu objetivo.
     * 
     */
    function movimento(erro, contexto) {
        var kP = 0.02;
        var kI = 0.00;
        var kD = 0.00;
        var deltaTempo = 0;

        if (!contexto.i) contexto.i = 0;
        if (!contexto.ultimoErro) contexto.ultimoErro = erro;
        if (contexto.ultimaData) deltaTempo = (Date.now() - contexto.ultimaData) / 1000;
        contexto.ultimaData = Date.now();
    
        // controle: p
        var p = erro * kP;
        
        // controle: i
        contexto.i += (erro * deltaTempo);
        var i = contexto.i * kI;
    
        // controle: d
        var d = 0;
        contexto.ultimoErro = erro;
    
        // valor total do PID
        var pidTotal = p + i + d;
        // console.log({
        //     p, i, d, pidTotal, erro, contexto
        // })
    
        // retorno a velocidade do movimento (e seu sentido, positivo ou negativo)
        return pidTotal;
    }    
`;

$(document).ready(function () {
    require(["vs/editor/editor.main"], function () {
        loadContent(defaultCode, "text/javascript");
        changeTheme(1); // dark
    });

    window.onresize = function () {
        if (editor) {
            editor.layout();
        }
        if (diffEditor) {
            diffEditor.layout();
        }
    };

    $("#btnExecutar").click(function () {
        try {
            const funcUsuario = eval("(" + editor.getValue() + ")");
            simulador.core.pidCodigo = funcUsuario;
            simulador.core.iniciarJogo();
        } catch (err) {
            alert("Seu código possui erros. Veja no console");
            console.error(err);
        }
    });

    $("#btnParar").click(function () {
        simulador.core.pararJogo();
    });
});

function loadContent(content, type) {
    if (!editor) {
        $("#editor").empty();
        editor = monaco.editor.create(document.getElementById("editor"), {
            model: null,
        });
    }

    var oldModel = editor.getModel();
    var newModel = monaco.editor.createModel(content, type);
    editor.setModel(newModel);
    if (oldModel) {
        oldModel.dispose();
    }
}

function loadFromURL(url, type) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        beforeSend: function () {
            $(".loading.editor").show();
        },
        error: function () {
            if (editor) {
                if (editor.getModel()) {
                    editor.getModel().dispose();
                }
                editor.dispose();
                editor = null;
            }
            $(".loading.editor").fadeOut({
                duration: 200,
            });
            $("#editor").empty();
            $("#editor").append('<p class="alert alert-error">Falha para carregar: ' + url + "</p>");
        },
    }).done(function (data) {
        loadContent(data, type);
        $(".loading.editor").fadeOut({
            duration: 300,
        });
    });
}

function changeTheme(theme) {
    var newTheme = theme === 1 ? "vs-dark" : theme === 0 ? "vs" : "hc-black";
    if (editor) {
        editor.updateOptions({
            theme: newTheme,
        });
    }
    if (diffEditor) {
        diffEditor.updateOptions({
            theme: newTheme,
        });
    }
}
