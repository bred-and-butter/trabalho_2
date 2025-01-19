var canvas = document.querySelector('#canv');
var gl = canvas.getContext('webgl2');
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
var webGLVariables;
var globalVariables = {
    "count": 0,
    "currentAngleDegrees": 0,
    "currentAngleRadians": 0,
    "matrix": [],
    "translation": [],
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
    var vertexShaderSource = /*glsl*/ "#version 300 es\n\n    in vec2 a_position;\n\n    uniform vec2 u_resolution; // resolucao do canvas (utilizar apenas pra 2d)\n\n    uniform mat3 u_matrix; // matriz com todas as mudancas em uma so (translacao, rotacao e escala)\n\n    void main () {\n        vec2 position = (u_matrix * vec3(a_position, 1)).xy;\n\n        gl_Position = vec4(position, 0, 1);\n    }\n    ";
    var fragmentShaderSource = /*glsl*/ "#version 300 es\n\n    precision highp float;\n\n    uniform vec4 u_color;\n\n    out vec4 outColor;\n\n    void main () {\n        outColor = u_color;\n    }\n    ";
    var drawDimensions = 2;
    webGLVariables = init(vertexShaderSource, fragmentShaderSource, drawDimensions);
    //3 pontos 2d
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];
    //funcao para transladar o objeto
    translate('set', 0, 0);
    //converte o angulo pro seno e cosseno e coloca na variavel
    //seno eh o x, cosseno eh o y
    convertDegreesToRadians(0);
    //multiplica o x e o y fornecido pra escalar o objeto (nao multiplicar por 0)
    scale(1, 1);
    //cor
    globalVariables.color = [Math.random(), Math.random(), Math.random(), 1];
    //quantos pontos desenhar (quantas vezes rodar o vertex shader)
    globalVariables.count = 3;
    setShape(positions);
    requestAnimationFrame(drawScene);
    //drawScene()
}
// -------INICIALIZACAO-------
function init(vertexShaderSource, fragmentShaderSource, drawDimensions) {
    //cria shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    //linka com programa
    var program = createProgram(vertexShader, fragmentShader);
    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
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
    //como tirar os dados do buffer
    //o size eh quantos elementos utilizar do gl_position, 2 = usar x e y
    //na pratica diz quantas dimensoes o objeto tera
    var size = drawDimensions;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
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
    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //limpa o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //qual programa usar
    gl.useProgram(webGLVariables.program);
    //diz qual vertex array vai ser usado pra retirar informacoes do buffer
    gl.bindVertexArray(webGLVariables.vertexArrayObject);
    //na pratica isso deve fazer com que o objeto se mexa na diagonal, pois aumenta o x e o y em 1
    //a cada vez que desenha
    //globalVariables.translation[0] += 0.5
    //globalVariables.translation[1] += 0.5
    //usa as variaveis globais de translacao rotacao e escala
    //para criar as matrizes de modificacao de pontos
    //e multiplica elas entre si para retornar uma unica matriz
    //que contem todas as mudancas
    var matrix = multiplyMatrices();
    //seta matriz de mudancas
    gl.uniformMatrix3fv(webGLVariables.matrixLocation, false, matrix);
    //seta a cor
    gl.uniform4fv(webGLVariables.colorLocation, globalVariables.color);
    //seta a resolucao do canvas pra converter de pixels pra clip space (nao utilizado agr)
    //gl.uniform2f(webGLVariables.resolutionLocation, gl.canvas.width, gl.canvas.height)
    //desenha o que ta no array
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    gl.drawArrays(primitiveType, offset, globalVariables.count);
}
function setShape(positions, x, y, width, height) {
    if (positions === void 0) { positions = []; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (width === void 0) { width = 0; }
    if (height === void 0) { height = 0; }
    //coloca a info dos pontos no buffer
    //              aonde colocar   tipo do dado                para otimizacao
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}
function multiplyMatrices() {
    var translationMatrix = m3.translate(globalVariables.translation[0], globalVariables.translation[1]);
    var rotationMatrix = m3.rotate(globalVariables.currentAngleRadians);
    var scaleMatrix = m3.scale(globalVariables.scale[0], globalVariables.scale[1]);
    var matrix = m3.multiply(translationMatrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);
    return matrix;
}
function translate(mode, x, y) {
    if (mode === void 0) { mode = 'set'; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (mode == 'set') {
        globalVariables.translation[0] = x;
        globalVariables.translation[1] = y;
    }
    else if (mode == 'add') {
        globalVariables.translation[0] += x;
        globalVariables.translation[1] += y;
    }
    else {
        console.log('modo incorreto (mode deve ser set ou add)');
    }
}
function convertDegreesToRadians(angle) {
    globalVariables.currentAngleDegrees = angle;
    globalVariables.currentAngleRadians = angle * Math.PI / 180;
}
function scale(x, y) {
    globalVariables.scale[0] = x;
    globalVariables.scale[1] = y;
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
