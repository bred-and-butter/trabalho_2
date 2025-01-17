var canvas: any = document.querySelector('#canv')
var gl: WebGL2RenderingContext = canvas.getContext('webgl2')

interface webGLVariables {
    program: WebGLProgram,
    vertexArrayObject: WebGLVertexArrayObject,
    translationLocation: WebGLUniformLocation,
    rotationLocation: WebGLUniformLocation,
    scaleLocation: WebGLUniformLocation,
    resolutionLocation: WebGLUniformLocation,
    colorLocation: WebGLUniformLocation,
}

interface globalVariables {
    count: number,
    currentAngle: number
    translation: Array<number>,
    rotation: Array<number>,
    scale: Array<number>,
    color: Array<number>
}

var webGLVariables: webGLVariables
var globalVariables: globalVariables = {
    "count": 0,
    "currentAngle": 0,
    "translation": [],
    "rotation": [],
    "scale": [],
    "color": []
}

function main() {
    if (!gl) {
        console.log('sem webgl2')
        return
    } else {
        console.log('webgl ok')
    }

    //variaveis string com o codigo pros shaders do webgl
    let vertexShaderSource = /*glsl*/ `#version 300 es

    in vec2 a_position;

    uniform vec2 u_resolution; // resolucao do canvas (utilizar apenas pra 2d)

    uniform vec2 u_translation; // translacao

    uniform vec2 u_rotation; // rotacao

    uniform vec2 u_scale; // escala

    void main () {

        vec2 scaledPosition = a_position * u_scale;

        vec2 rotatedPosition = vec2(
            scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
        );

        vec2 position = rotatedPosition + u_translation;

        gl_Position = vec4(position, 0, 1);
    }
    `

    let fragmentShaderSource = /*glsl*/ `#version 300 es

    precision highp float;

    uniform vec4 u_color;

    out vec4 outColor;

    void main () {
        outColor = u_color;
    }
    `

    let drawDimensions = 2
    webGLVariables = init(vertexShaderSource, fragmentShaderSource, drawDimensions)

    //3 pontos 2d
    let positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ]

    //funcao para transladar o objeto
    translate(0, 0)

    //converte o angulo pro seno e cosseno e coloca na variavel
    //seno eh o x, cosseno eh o y
    setRotationWithSineAndCosine(0)

    //multiplica o x e o y fornecido pra escalar o objeto (nao multiplicar por 0)
    scale(1, 1)

    //cor
    globalVariables.color = [Math.random(), Math.random(), Math.random(), 1]

    //quantos pontos desenhar (quantas vezes rodar o vertex shader)
    globalVariables.count = 3

    setShape(positions)

    requestAnimationFrame(drawScene)

    //drawScene()
}


// -------INICIALIZACAO-------
function init(vertexShaderSource: string, fragmentShaderSource: string, drawDimensions: number) {
    //cria shaders
    let vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    let fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    //linka com programa
    let program = createProgram(vertexShader, fragmentShader)

    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

    //pega as variaveis globais dos shaders
    let translationLocation = gl.getUniformLocation(program, 'u_translation') //translacao (o quanto deve se mover)
    let rotationLocation = gl.getUniformLocation(program, 'u_rotation') //rotacao
    let scaleLocation = gl.getUniformLocation(program, 'u_scale') //escala
    let resolutionLocation = gl.getUniformLocation(program, 'u_resolution') //resolucao do canvas (utilizar apenas em 2d eu acho)
    let colorLocation = gl.getUniformLocation(program, 'u_color') //cor

    //cria um buffer pro atributo pegar informacoes dele
    let positionBuffer = gl.createBuffer()

    //conecta o buffer com  a "variavel global" do webgl, conhecido como bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    //cria um objeto vertex array pra tirar dados do buffer
    let vao = gl.createVertexArray()

    //conecta esse objeto no webgl
    gl.bindVertexArray(vao)

    //"liga" o atributo, desligado, possui um valor constante
    gl.enableVertexAttribArray(positionAttributeLocation)

    //como tirar os dados do buffer
    //o size eh quantos elementos utilizar do gl_position, 2 = usar x e y
    //na pratica diz quantas dimensoes o objeto tera
    let size = drawDimensions
    let type = gl.FLOAT
    let normalize = false
    let stride = 0
    let offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    return {
        "program": program,
        "vertexArrayObject": vao,
        "translationLocation": translationLocation,
        "rotationLocation": rotationLocation,
        "scaleLocation": scaleLocation,
        "resolutionLocation": resolutionLocation,
        "colorLocation": colorLocation,
    }
}

// ------- LOOP DE DESENHO -------
function drawScene() {
    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    //limpa o canvas
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    //qual programa usar
    gl.useProgram(webGLVariables.program)

    //diz qual vertex array vai ser usado pra retirar informacoes do buffer
    gl.bindVertexArray(webGLVariables.vertexArrayObject)

    //na pratica isso deve fazer com que o objeto se mexa na diagonal, pois aumenta o x e o y em 1
    //a cada vez que desenha
    //globalVariables.translation[0] += 0.5
    //globalVariables.translation[1] += 0.5

    //seta a cor
    gl.uniform4fv(webGLVariables.colorLocation, globalVariables.color)

    //seta a translacao
    gl.uniform2fv(webGLVariables.translationLocation, globalVariables.translation)

    //seta a rotacao
    gl.uniform2fv(webGLVariables.rotationLocation, globalVariables.rotation)

    //seta a escala
    gl.uniform2fv(webGLVariables.scaleLocation, globalVariables.scale)

    //seta a resolucao do canvas pra converter de pixels pra clip space (nao utilizado agr)
    //gl.uniform2f(webGLVariables.resolutionLocation, gl.canvas.width, gl.canvas.height)

    //desenha o que ta no array
    let primitiveType = gl.TRIANGLES
    let offset = 0
    gl.drawArrays(primitiveType, offset, globalVariables.count)
}

function setShape(positions = [], x = 0, y = 0, width = 0, height = 0) {
    //coloca a info dos pontos no buffer
    //              aonde colocar   tipo do dado                para otimizacao
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
}

function translate(x: number, y: number) {
    globalVariables.translation[0] = x
    globalVariables.translation[1] = y
}

function setRotationWithSineAndCosine(angle: number) {
    globalVariables.currentAngle = angle
    let angleInRadians = angle * Math.PI / 180
    globalVariables.rotation[0] = Math.sin(angleInRadians)
    globalVariables.rotation[1] = Math.cos(angleInRadians)
}

function scale(x: number, y: number) {
    globalVariables.scale[0] = x
    globalVariables.scale[1] = y
}

//funcao de criar shader
function createShader(gl: WebGL2RenderingContext, type, source: string): WebGLShader | null {
    let shader = gl.createShader(type) // cria um shader no webgl
    gl.shaderSource(shader, source) // poe o codigo fonte ndo shader no webgl
    gl.compileShader(shader) // compila
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
        return shader
    }

    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    let program = gl.createProgram() // cria programa
    gl.attachShader(program, vertexShader) // conecta os shaders com o programa
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program) // conecta o programa com o webgl
    let success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        return program
    }

    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}

main()