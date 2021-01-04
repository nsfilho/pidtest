"use strict";
require.config({
    baseUrl: "https://microsoft.github.io/monaco-editor/node_modules/monaco-editor/min/",
});

var editor = null,
    diffEditor = null,
    defaultCode = `
/**
 * Distancia é um inteiro que contem o quanto longe você está do seu objetivo.
 */
function movimento(erro, contexto) {
    var aceleracao = (erro < 0 ? 1 : -1);

    // retorno a velocidade do movimento (e seu sentido, positivo ou negativo)
    return aceleracao;
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
            board.jogo.codigo = funcUsuario;
            board.jogo.iniciado = true;
        } catch (err) {
            alert("Seu código possui erros. Veja no console");
            console.error(err);
        }
    });

    $("#btnParar").click(function () {
        board.jogo.iniciado = false;
        board.jogo.fimJogo = true;
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
