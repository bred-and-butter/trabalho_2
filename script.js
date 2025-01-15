var canvas = document.querySelector('#canv');
var gl = canvas.getContext('webgl2');
function main() {
    if (!gl) {
        console.log('sem webgl2');
        return;
    }
    else {
        console.log('webgl ok');
    }
    //variaveis string com o codigo pros shaders do webgl
    //uniform vec2 u_tranlation;
    var vertexShaderSource = /*glsl*/ "#version 300 es\n\n    in vec4 a_position;\n\n    void main () {\n        gl_Position = a_position;\n    }\n    ";
    var fragmentShaderSource = /*glsl*/ "#version 300 es\n\n    precision highp float;\n\n    out vec4 outColor;\n\n    void main () {\n        outColor = vec4(1, 0, 0.5, 1);\n    }\n    ";
    var transferObj = {};
    transferObj = init(vertexShaderSource, fragmentShaderSource);
    //3 pontos 2d
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];
    var count = 3;
    setShape(positions);
    drawScene(transferObj, count);
}
// -------INICIALIZACAO-------
function init(vertexShaderSource, fragmentShaderSource) {
    //cria shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    //linka com programa
    var program = createProgram(vertexShader, fragmentShader);
    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
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
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    return {
        "program": program,
        "vertexArrayObject": vao
    };
}
// ------- LOOP DE DESENHO -------
function drawScene(transferObj, count) {
    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //limpa o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //qual programa usar
    gl.useProgram(transferObj.program);
    //conecta esse objeto no webgl, por algum motivo o tutorial mostra essa linha 2 vezes, não sei se é um erro ou se é pra ser assim mesmo
    gl.bindVertexArray(transferObj.vertexArrayObject);
    //desenha o que ta no array
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    gl.drawArrays(primitiveType, offset, count);
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
