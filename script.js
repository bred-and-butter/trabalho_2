var canvas = document.querySelector('#canv');
var gl = canvas.getContext('webgl2');
var webGLVariables;
var globalVariables = {
    "count": 0,
    "currentAngleDegrees": 0,
    "currentAngleRadians": 0,
    "matrix": [],
    "translation": [],
    "rotation": [],
    "scale": [],
    "color": []
};
function main() {
    if (!gl) {
        console.log('sem webgl2');
        return;
    }
    else {
        console.log('webgl ok');
    }
    //variaveis string com o codigo pros shaders do webgl
    var vertexShaderSource = /*glsl*/ "#version 300 es\n\n    in vec4 a_position;\n    in vec4 a_color;\n\n    uniform mat4 u_matrix; // matriz com todas as mudancas em uma so (translacao, rotacao e escala)\n    \n    out vec4 v_color;\n\n    void main () {\n        gl_Position = u_matrix * a_position;\n\n        v_color = a_color;\n    }\n    ";
    var fragmentShaderSource = /*glsl*/ "#version 300 es\n\n    precision highp float;\n\n    //uniform vec4 u_color;\n\n    in vec4 v_color;\n\n    out vec4 outColor;\n\n    void main () {\n        outColor = v_color;\n    }\n    ";
    var drawDimensions = 3;
    //um F 3d
    var positions = [
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,
        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,
        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,
        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,
        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,
        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,
        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,
        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,
        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,
        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,
        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,
        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,
        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,
        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,
        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,
        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0,
    ];
    var colors = [
        // left column front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // top rung front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // middle rung front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
    ];
    webGLVariables = init(vertexShaderSource, fragmentShaderSource, drawDimensions, positions, colors);
    //funcao para transladar o objeto
    translate('set', 300, 150, 0);
    //converte o angulo pro seno e cosseno e coloca na variavel
    //seno eh o x, cosseno eh o y
    convertDegreesToRadians('set', 'x', 0);
    convertDegreesToRadians('set', 'y', 40);
    convertDegreesToRadians('set', 'z', 40);
    //multiplica o x e o y fornecido pra escalar o objeto (nao multiplicar por 0)
    scale(1, 1, 1);
    //cor
    globalVariables.color = [Math.random(), Math.random(), Math.random(), 1];
    //quantos pontos desenhar (quantas vezes rodar o vertex shader)
    globalVariables.count = positions.length / drawDimensions;
    requestAnimationFrame(drawScene);
}
// -------INICIALIZACAO-------
function init(vertexShaderSource, fragmentShaderSource, drawDimensions, positions, colors) {
    //cria shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    //linka com programa
    var program = createProgram(vertexShader, fragmentShader);
    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    var colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    //pega as variaveis globais dos shaders
    var matrixLocation = gl.getUniformLocation(program, 'u_matrix'); //matriz de mudancas
    var resolutionLocation = gl.getUniformLocation(program, 'u_resolution'); //resolucao do canvas (utilizar apenas em 2d eu acho)
    var colorLocation = gl.getUniformLocation(program, 'u_color'); //cor
    //cria um buffer pro atributo pegar informacoes dele
    var positionBuffer = gl.createBuffer();
    //conecta o buffer com  a "variavel global" do webgl, conhecido como bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //cria um objeto vertex array pra tirar dados do buffer
    var vao = gl.createVertexArray();
    //conecta esse objeto no webgl
    gl.bindVertexArray(vao);
    //"liga" o atributo, desligado, possui um valor constante
    gl.enableVertexAttribArray(positionAttributeLocation);
    //setShape(positions)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    //faz a mesma coisa mas adicionando informacoes de cores de cada vertice
    var size = drawDimensions;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    //setColor(colors)
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    var sizeColor = drawDimensions;
    var typeColor = gl.UNSIGNED_BYTE;
    var normalizeColor = true;
    var strideColor = 0;
    var offsetColor = 0;
    gl.vertexAttribPointer(colorAttributeLocation, sizeColor, typeColor, normalizeColor, strideColor, offsetColor);
    return {
        "program": program,
        "vertexArrayObject": vao,
        "matrixLocation": matrixLocation,
        "resolutionLocation": resolutionLocation,
        "colorLocation": colorLocation,
    };
}
// ------- LOOP DE DESENHO -------
function drawScene() {
    resizeCanvasToDisplaySize(gl.canvas);
    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //limpa o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    //qual programa usar
    gl.useProgram(webGLVariables.program);
    //diz qual vertex array vai ser usado pra retirar informacoes do buffer
    gl.bindVertexArray(webGLVariables.vertexArrayObject);
    convertDegreesToRadians('add', 'y', 1);
    //usa as variaveis globais de translacao rotacao e escala
    //para criar as matrizes de modificacao de pontos
    //e multiplica elas entre si para retornar uma unica matriz
    //que contem todas as mudancas
    var matrix = multiplyMatrices();
    //seta matriz de mudancas
    gl.uniformMatrix4fv(webGLVariables.matrixLocation, false, matrix);
    //seta a cor
    //gl.uniform4fv(webGLVariables.colorLocation, globalVariables.color)
    //desenha o que ta no array
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    gl.drawArrays(primitiveType, offset, globalVariables.count);
    //faz um loop, animando o desenho
    requestAnimationFrame(drawScene);
}
function setShape(positions) {
    //coloca a info dos pontos no buffer
    //              aonde colocar   tipo do dado                para otimizacao
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}
function setColor(color) {
    //coloca a info dos pontos no buffer
    //            aonde colocar    tipo do dado           para otimizacao
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(color), gl.STATIC_DRAW);
}
function multiplyMatrices() {
    var matrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
    matrix = m4.translate(matrix, globalVariables.translation[0], globalVariables.translation[1], globalVariables.translation[2]);
    matrix = m4.xRotate(matrix, globalVariables.rotation[0]);
    matrix = m4.yRotate(matrix, globalVariables.rotation[1]);
    matrix = m4.zRotate(matrix, globalVariables.rotation[2]);
    matrix = m4.scale(matrix, globalVariables.scale[0], globalVariables.scale[1], globalVariables.scale[2]);
    return matrix;
}
function translate(mode, x, y, z) {
    if (mode === void 0) { mode = 'set'; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (z === void 0) { z = 0; }
    if (mode == 'set') {
        globalVariables.translation[0] = x;
        globalVariables.translation[1] = y;
        globalVariables.translation[2] = z;
    }
    else if (mode == 'add') {
        globalVariables.translation[0] += x;
        globalVariables.translation[1] += y;
        globalVariables.translation[2] += z;
    }
    else {
        console.log('modo incorreto (mode deve ser set ou add)');
    }
}
function convertDegreesToRadians(mode, axis, angle) {
    //isso reseta angulos maiores que 360 pra menos de 360, nao sei se vai ser necessario
    if (globalVariables.rotation[0] >= (360 * Math.PI / 180)) {
        globalVariables.rotation[0] = globalVariables.rotation[0] - (360 * Math.PI / 180);
    }
    if (globalVariables.rotation[1] >= (360 * Math.PI / 180)) {
        globalVariables.rotation[1] = globalVariables.rotation[1] - (360 * Math.PI / 180);
    }
    if (globalVariables.rotation[2] >= (360 * Math.PI / 180)) {
        globalVariables.rotation[2] = globalVariables.rotation[2] - (360 * Math.PI / 180);
    }
    if (mode == 'set') {
        if (axis == 'x') {
            globalVariables.rotation[0] = angle * Math.PI / 180;
        }
        else if (axis == 'y') {
            globalVariables.rotation[1] = angle * Math.PI / 180;
        }
        else if (axis == 'z') {
            globalVariables.rotation[2] = angle * Math.PI / 180;
        }
    }
    else if (mode == 'add') {
        if (axis == 'x') {
            globalVariables.rotation[0] += angle * Math.PI / 180;
        }
        else if (axis == 'y') {
            globalVariables.rotation[1] += angle * Math.PI / 180;
        }
        else if (axis == 'z') {
            globalVariables.rotation[2] += angle * Math.PI / 180;
        }
    }
}
function scale(x, y, z) {
    globalVariables.scale[0] = x;
    globalVariables.scale[1] = y;
    globalVariables.scale[2] = z;
}
//objeto com funcoes auxiliares pra matrizes 3d
var m4 = {
    identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
    projection: function (width, height, depth) {
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1
        ];
    },
    translate: function (m, x, y, z) {
        return m4.multiply(m, m4.translationMatrix(x, y, z));
    },
    translationMatrix: function (x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1,
        ];
    },
    scale: function (m, x, y, z) {
        return m4.multiply(m, m4.scalingMatrix(x, y, z));
    },
    scalingMatrix: function (x, y, z) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1,
        ];
    },
    xRotate: function (m, radians) {
        return m4.multiply(m, m4.xRotationMatrix(radians));
    },
    xRotationMatrix: function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },
    yRotate: function (m, radians) {
        return m4.multiply(m, m4.yRotationMatrix(radians));
    },
    yRotationMatrix: function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },
    zRotate: function (m, radians) {
        return m4.multiply(m, m4.zRotationMatrix(radians));
    },
    zRotationMatrix: function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
    multiply: function (a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },
};
//objeto com funcoes auxiliares pra matrizes 2d
var m3 = {
    multiply: function (a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    identity: function () {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    projection: function (width, height) {
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    },
    translate: function (x, y) {
        return [
            1, 0, 0,
            0, 1, 0,
            x, y, 1
        ];
    },
    rotate: function (radians) {
        globalVariables.currentAngleRadians = radians;
        var s = Math.sin(radians);
        var c = Math.cos(radians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ];
    },
    scale: function (x, y) {
        return [
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        ];
    }
};
function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    // Check if the canvas is not the same size.
    var needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;
    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    return needResize;
}
//funcao de criar shader
function createShader(gl, type, source) {
    var shader = gl.createShader(type); // cria um shader no webgl
    gl.shaderSource(shader, source); // poe o codigo fonte ndo shader no webgl
    gl.compileShader(shader); // compila
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram(); // cria programa
    gl.attachShader(program, vertexShader); // conecta os shaders com o programa
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program); // conecta o programa com o webgl
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
main();
