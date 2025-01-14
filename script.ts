var canvas: any = document.querySelector('#canv')
var gl: WebGL2RenderingContext = canvas.getContext('webgl2')

function main() {
    if (!gl) {
        console.log('sem webgl2')
    } else {
        console.log('webgl ok')
    }

    //variaveis string com o codigo pros shaders do webgl
    let vertexShaderSource = /*glsl*/ `#version 300 es

    in vec4 a_position;

    void main () {
        gl_Position = a_position;
    }
    `

    let fragmentShaderSource = /*glsl*/ `#version 300 es

    precision highp float;

    out vec4 outColor;

    void main () {
        outColor = vec4(1, 0, 0.5, 1);
    }
    `

    let transferObj = {}

    transferObj = init(vertexShaderSource, fragmentShaderSource)

    //3 pontos 2d
    let positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ]
    //coloca a info dos pontos no buffer
    //              aonde colocar   tipo do dado                para otimizacao
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    drawScene(transferObj)
}


// -------INICIALIZACAO-------

function init(vertexShaderSource: string, fragmentShaderSource: string) {
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

    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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

    //cria shaders
    let vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    let fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    //linka com programa
    let program = createProgram(vertexShader, fragmentShader)

    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

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
    var size = 2
    var type = gl.FLOAT
    var normalize = false
    var stride = 0
    var offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    return {
        "program": program,
        "vertexArrayObject": vao
    }
}

// ------- LOOP DE DESENHO -------

function drawScene(transferObj) {
    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    //limpa o canvas
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    //qual programa usar
    gl.useProgram(transferObj.program)

    //conecta esse objeto no webgl, por algum motivo o tutorial mostra essa linha 2 vezes, não sei se é um erro ou se é pra ser assim mesmo
    gl.bindVertexArray(transferObj.vertexArrayObject)

    //desenha o que ta no array
    var primitiveType = gl.TRIANGLES
    var offset = 0
    var count = 3
    gl.drawArrays(primitiveType, offset, count)
}

main()