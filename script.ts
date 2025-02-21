var canvas: any = document.querySelector('#canv')
var gl: WebGL2RenderingContext = canvas.getContext('webgl2')

interface webGLVariables {
    program: WebGLProgram,
    positionAttributeLocation: number,
    colorAttributeLocation: number,
    vertexArrayObject: { cube: WebGLVertexArrayObject, skull: WebGLVertexArrayObject, ball: WebGLVertexArrayObject },
    matrixLocation: WebGLUniformLocation,
    //colorUniformLocation: WebGLUniformLocation
}

interface globalVariables {
    drawDimensions: number,
    count: number,
    FOVRadians: number,
    currentAngleDegrees: number,
    currentAngleRadians: number
    matrix: Array<number>,
    translation: Array<number>,
    rotation: Array<number>,
    scale: Array<number>,
    color: Array<number>,
    objects: any,
    cubeLoaded: boolean,
    skullLoaded: boolean,
    ballLoaded: boolean,
    vaoSelected: WebGLVertexArrayObject
}

var webGLVariables: webGLVariables
var globalVariables: globalVariables = {
    "drawDimensions": 3,
    "count": 0,
    "FOVRadians": 2,
    "currentAngleDegrees": 0,
    "currentAngleRadians": 0,
    "matrix": [],
    "translation": [],
    "rotation": [],
    "scale": [],
    "color": [],
    "objects": {
        "cube": {
            "position": [0, 0, 0],
            "color": [0, 0, 0],
            "translation": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [0, 0, 0],
            "count": 0
        },
        "skull": {
            "position": [0, 0, 0],
            "color": [0, 0, 0],
            "translation": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [0, 0, 0],
            "count": 0
        },
        "ball": {
            "position": [0, 0, 0],
            "color": [0, 0, 0],
            "translation": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [0, 0, 0],
            "count": 0
        },
    },
    "cubeLoaded": false,
    "skullLoaded": false,
    "ballLoaded": false,
    "vaoSelected": {}
}

async function main() {
    if (!gl) {
        console.log('sem webgl2')
        return
    } else {
        console.log('webgl ok')
    }

    //variaveis string com o codigo pros shaders do webgl
    let vertexShaderSource = /*glsl*/ `#version 300 es

    in vec4 a_position;
    in vec4 a_color;

    uniform mat4 u_matrix; // matriz com todas as mudancas em uma so (translacao, rotacao e escala)
    
    out vec4 v_color;

    void main () {
        gl_Position = u_matrix * a_position;

        v_color = a_color;
    }
    `

    let fragmentShaderSource = /*glsl*/ `#version 300 es

    precision highp float;

    uniform vec4 u_color;

    in vec4 v_color;

    out vec4 outColor;

    void main () {
        outColor = v_color;
    }
    `

    webGLVariables = init(vertexShaderSource, fragmentShaderSource)

    //requestAnimationFrame(drawScene)
}

// -------INICIALIZACAO-------
function init(vertexShaderSource: string, fragmentShaderSource: string) {
    //cria shaders
    let vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    let fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    //linka com programa
    let program = createProgram(vertexShader, fragmentShader)

    //pega posicao do atributo que preciso dar informacao (fazer na inicializacao)
    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    let colorAttributeLocation = gl.getAttribLocation(program, 'a_color')

    //pega as variaveis globais dos shaders
    let matrixLocation = gl.getUniformLocation(program, 'u_matrix') //matriz de mudancas

    //cria um objeto vertex array para cada forma pra tirar dados do buffer
    let vaoCube = gl.createVertexArray()
    let vaoSkull = gl.createVertexArray()
    let vaoBall = gl.createVertexArray()

    let vaoObject = {
        "cube": vaoCube,
        "skull": vaoSkull,
        "ball": vaoBall
    }

    //conecta esse objeto no webgl
    /*gl.bindVertexArray(vaoCube)

    setShape(positions, positionAttributeLocation, drawDimensions)

    setColor(colors, colorAttributeLocation, drawDimensions)*/

    return {
        "program": program,
        "positionAttributeLocation": positionAttributeLocation,
        "colorAttributeLocation": colorAttributeLocation,
        "vertexArrayObject": vaoObject,
        "matrixLocation": matrixLocation,
        //"colorUniformLocation" : colorLocation
    }
}

// ------- LOOP DE DESENHO -------
function drawScene() {
    resizeCanvasToDisplaySize(gl.canvas)

    //diz pro webgl que o X e Y do webgl correspondem ao width e height do canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    //limpa o canvas
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    //qual programa usar
    gl.useProgram(webGLVariables.program)

    //convertDegreesToRadians('add', 'z', 1)

    //usa as variaveis globais de translacao rotacao e escala
    //para criar as matrizes de modificacao de pontos
    //e multiplica elas entre si para retornar uma unica matriz
    //que contem todas as mudancas
    let cubeMatrix = multiplyMatrices(globalVariables.objects.cube.translation, globalVariables.objects.cube.rotation, globalVariables.objects.cube.scale)
    let skullMatrix = multiplyMatrices(globalVariables.objects.skull.translation, globalVariables.objects.skull.rotation, globalVariables.objects.skull.scale)
    let ballMatrix = multiplyMatrices(globalVariables.objects.ball.translation, globalVariables.objects.ball.rotation, globalVariables.objects.ball.scale)

    // ------- CUBO -------
    //diz qual vertex array vai ser usado pra retirar informacoes do buffer
    gl.bindVertexArray(webGLVariables.vertexArrayObject.cube)

    //seta matriz de mudancas
    gl.uniformMatrix4fv(webGLVariables.matrixLocation, false, cubeMatrix)

    //desenha o que ta no array
    let primitiveType = gl.TRIANGLES
    let offset = 0
    gl.drawArrays(primitiveType, offset, globalVariables.objects.cube.count)

    // ------- CAVEIRA -------
    gl.bindVertexArray(webGLVariables.vertexArrayObject.skull)
    gl.uniformMatrix4fv(webGLVariables.matrixLocation, false, skullMatrix)
    gl.drawArrays(primitiveType, offset, globalVariables.objects.skull.count)

    // ------- BOLA -------
    gl.bindVertexArray(webGLVariables.vertexArrayObject.ball)
    gl.uniformMatrix4fv(webGLVariables.matrixLocation, false, ballMatrix)
    gl.drawArrays(primitiveType, offset, globalVariables.objects.ball.count)

    //faz um loop, animando o desenho
    requestAnimationFrame(drawScene)
}

async function loadShape(shape: string) {
    if (shape == 'cube') {
        if (!globalVariables.cubeLoaded) {
            globalVariables.cubeLoaded = true
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.cube

            let cube = {
                position: [],
                color: []
            }

            cube = await loadObjectFromFile('resources/models/cube/cube.obj')

            globalVariables.objects.cube.position = cube.position
            globalVariables.objects.cube.color = cube.color
            globalVariables.objects.cube.count = cube.position.length / globalVariables.drawDimensions

            translate('set', 'cube', -150, 0, -300)

            scale('cube', 100, 100, 100)

            setShape(globalVariables.objects.cube.position, webGLVariables.positionAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)
            setColor(globalVariables.objects.cube.color, webGLVariables.colorAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)
        } else {
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.cube
        }

    } else if (shape == 'skull') {
        if (!globalVariables.skullLoaded) {
            globalVariables.skullLoaded = true
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.skull

            let skull = {
                position: [],
                color: []
            }

            skull = await loadObjectFromFile('resources/models/skull/skull.obj')

            globalVariables.objects.skull.position = skull.position
            globalVariables.objects.skull.color = skull.color
            globalVariables.objects.skull.count = skull.position.length / globalVariables.drawDimensions

            translate('set', 'skull', 150, 0, -300)

            scale('skull', 10, 10, 10)

            setShape(globalVariables.objects.skull.position, webGLVariables.positionAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)
            setColor(globalVariables.objects.skull.color, webGLVariables.colorAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)

        } else {
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.skull
        }


    } else if (shape == 'ball') {
        if (!globalVariables.ballLoaded) {
            globalVariables.ballLoaded = true
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.ball

            let ball = {
                position: [],
                color: []
            }

            ball = await loadObjectFromFile('resources/models/ball/ball.obj')

            globalVariables.objects.ball.position = ball.position
            globalVariables.objects.ball.color = ball.color
            globalVariables.objects.ball.count = ball.position.length / globalVariables.drawDimensions

            translate('set', 'ball', 15, 100, -300)

            scale('ball', 100, 100, 100)

            setShape(globalVariables.objects.ball.position, webGLVariables.positionAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)
            setColor(globalVariables.objects.ball.color, webGLVariables.colorAttributeLocation, globalVariables.drawDimensions, globalVariables.vaoSelected)

        } else {
            globalVariables.vaoSelected = webGLVariables.vertexArrayObject.ball
        }
    }

    requestAnimationFrame(drawScene)
}

async function loadObjectFromFile(path: string): Promise<{ position: Array<number>, color: Array<number> }> {
    let colors = []
    let response = await fetch(path)
    let text = await response.text()
    let data = parseOBJ(text)

    data.position.forEach(element => {
        colors.push(Math.floor(Math.random() * 255))
    });

    return {
        position: data.position,
        color: colors
    }
}

function parseOBJ(text: string) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
    ];

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return {
        position: webglVertexData[0],
        //texcoord: webglVertexData[1],
        //normal: webglVertexData[2],
    };
}

function setShape(positions: Array<number>, positionAttributeLocation: number, drawDimensions: number, vao: WebGLVertexArrayObject) {
    gl.bindVertexArray(vao)

    //cria um buffer pro atributo pegar informacoes dele
    let positionBuffer = gl.createBuffer()

    //conecta o buffer com  a "variavel global" do webgl, conhecido como bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    //"liga" o atributo, desligado, possui um valor constante
    gl.enableVertexAttribArray(positionAttributeLocation)

    let size = drawDimensions
    let type = gl.FLOAT
    let normalize = false
    let stride = 0
    let offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
}

function setColor(color: Array<number>, colorAttributeLocation: number, drawDimensions: number, vao: WebGLVertexArrayObject) {
    gl.bindVertexArray(vao)

    let colorBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(color), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(colorAttributeLocation)

    let size = drawDimensions
    let type = gl.UNSIGNED_BYTE
    let normalize = true
    let stride = 0
    let offset = 0
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset)
}

function updateFOV(degrees: number) {
    globalVariables.FOVRadians = degrees * Math.PI / 180
}

function multiplyMatrices(translation: Array<number>, rotation: Array<number>, scale: Array<number>): Array<number> {
    let aspect = gl.canvas.width / gl.canvas.height
    let zNear = 1
    let zFar = 2000

    let matrix = m4.perspective(globalVariables.FOVRadians, aspect, zNear, zFar)
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2])
    matrix = m4.xRotate(matrix, rotation[0])
    matrix = m4.yRotate(matrix, rotation[1])
    matrix = m4.zRotate(matrix, rotation[2])
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2])

    return matrix
}

function applyChanges() {
    let xTrans = parseInt((<HTMLInputElement>document.getElementById('xTrans')).value)
    let yTrans = parseInt((<HTMLInputElement>document.getElementById('yTrans')).value)
    let zTrans = parseInt((<HTMLInputElement>document.getElementById('zTrans')).value)
    let xRotate = parseInt((<HTMLInputElement>document.getElementById('xRotate')).value)
    let yRotate = parseInt((<HTMLInputElement>document.getElementById('yRotate')).value)
    let zRotate = parseInt((<HTMLInputElement>document.getElementById('zRotate')).value)
    let xScale = parseInt((<HTMLInputElement>document.getElementById('xScale')).value)
    let yScale = parseInt((<HTMLInputElement>document.getElementById('yScale')).value)
    let zScale = parseInt((<HTMLInputElement>document.getElementById('zScale')).value)

    let selectedVAO: string = 'cube'

    if (globalVariables.vaoSelected == webGLVariables.vertexArrayObject.cube) {
        selectedVAO = 'cube'
    } else if (globalVariables.vaoSelected == webGLVariables.vertexArrayObject.skull) {
        selectedVAO = 'skull'
    } else if (globalVariables.vaoSelected == webGLVariables.vertexArrayObject.ball) {
        selectedVAO = 'ball'
    }

    translate('set', selectedVAO, xTrans, yTrans, zTrans)
    convertDegreesToRadians('set', selectedVAO, 'x', xRotate)
    convertDegreesToRadians('set', selectedVAO, 'y', yRotate)
    convertDegreesToRadians('set', selectedVAO, 'z', zRotate)
    scale(selectedVAO, xScale, yScale, zScale)
}

function translate(mode: string = 'set', shape: string, x: number = 0, y: number = 0, z: number = 0) {
    if (shape == 'cube') {
        if (mode == 'set') {
            globalVariables.objects.cube.translation[0] = x
            globalVariables.objects.cube.translation[1] = y
            globalVariables.objects.cube.translation[2] = z
        } else if (mode == 'add') {
            globalVariables.objects.cube.translation[0] += x
            globalVariables.objects.cube.translation[1] += y
            globalVariables.objects.cube.translation[2] += z
        }
    } else if (shape == 'skull') {
        if (mode == 'set') {
            globalVariables.objects.skull.translation[0] = x
            globalVariables.objects.skull.translation[1] = y
            globalVariables.objects.skull.translation[2] = z
        } else if (mode == 'add') {
            globalVariables.objects.skull.translation[0] += x
            globalVariables.objects.skull.translation[1] += y
            globalVariables.objects.skull.translation[2] += z
        }
    } else if (shape == 'ball') {
        if (mode == 'set') {
            globalVariables.objects.ball.translation[0] = x
            globalVariables.objects.ball.translation[1] = y
            globalVariables.objects.ball.translation[2] = z
        } else if (mode == 'add') {
            globalVariables.objects.ball.translation[0] += x
            globalVariables.objects.ball.translation[1] += y
            globalVariables.objects.ball.translation[2] += z
        }
    }
}

function convertDegreesToRadians(mode: string, shape: string, axis: string, angle: number) {
    if (shape == 'cube') {
        if (mode == 'set') {
            if (axis == 'x') {
                globalVariables.objects.cube.rotation[0] = angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.cube.rotation[1] = angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.cube.rotation[2] = angle * Math.PI / 180
            }
        } else if (mode == 'add') {
            if (axis == 'x') {
                globalVariables.objects.cube.rotation[0] += angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.cube.rotation[1] += angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.cube.rotation[2] += angle * Math.PI / 180
            }
        }
    } else if (shape == 'skull') {
        if (mode == 'set') {
            if (axis == 'x') {
                globalVariables.objects.skull.rotation[0] = angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.skull.rotation[1] = angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.skull.rotation[2] = angle * Math.PI / 180
            }
        } else if (mode == 'add') {
            if (axis == 'x') {
                globalVariables.objects.skull.rotation[0] += angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.skull.rotation[1] += angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.skull.rotation[2] += angle * Math.PI / 180
            }
        }
    } else if (shape == 'ball') {
        if (mode == 'set') {
            if (axis == 'x') {
                globalVariables.objects.ball.rotation[0] = angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.ball.rotation[1] = angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.ball.rotation[2] = angle * Math.PI / 180
            }
        } else if (mode == 'add') {
            if (axis == 'x') {
                globalVariables.objects.ball.rotation[0] += angle * Math.PI / 180
            } else if (axis == 'y') {
                globalVariables.objects.ball.rotation[1] += angle * Math.PI / 180
            } else if (axis == 'z') {
                globalVariables.objects.ball.rotation[2] += angle * Math.PI / 180
            }
        }
    }
}

function scale(shape: string, x: number, y: number, z: number) {
    if (shape == 'cube') {
        globalVariables.objects.cube.scale[0] = x
        globalVariables.objects.cube.scale[1] = y
        globalVariables.objects.cube.scale[2] = z
    } else if (shape == 'skull') {
        globalVariables.objects.skull.scale[0] = x
        globalVariables.objects.skull.scale[1] = y
        globalVariables.objects.skull.scale[2] = z
    } else if (shape == 'ball') {
        globalVariables.objects.ball.scale[0] = x
        globalVariables.objects.ball.scale[1] = y
        globalVariables.objects.ball.scale[2] = z
    }
}

//objeto com funcoes auxiliares pra matrizes 3d
var m4 = {
    identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    projection: function (width: number, height: number, depth: number) {
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,   //esse "-" faz com que o eixo Y fique invertido
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1
        ]
    },

    orthographic: function (left: number, right: number, bottom: number, top: number, near: number, far: number) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,

            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1
        ]
    },

    perspective: function (FOVRadians: number, aspect: number, near: number, far: number) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * FOVRadians)
        let rangeInv = 1.0 / (near - far)

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]
    },

    translate: function (m: Array<number>, x: number, y: number, z: number) {
        return m4.multiply(m, m4.translationMatrix(x, y, z))
    },

    translationMatrix: function (x: number, y: number, z: number) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1,
        ]
    },

    scale: function (m: Array<number>, x: number, y: number, z: number) {
        return m4.multiply(m, m4.scalingMatrix(x, y, z))
    },

    scalingMatrix: function (x: number, y: number, z: number) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1,
        ]
    },

    xRotate: function (m: Array<number>, radians: number) {
        return m4.multiply(m, m4.xRotationMatrix(radians))
    },

    xRotationMatrix: function (radians: number) {
        var c = Math.cos(radians)
        var s = Math.sin(radians)

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ]
    },

    yRotate: function (m: Array<number>, radians: number) {
        return m4.multiply(m, m4.yRotationMatrix(radians))
    },

    yRotationMatrix: function (radians: number) {
        var c = Math.cos(radians)
        var s = Math.sin(radians)

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ]
    },

    zRotate: function (m: Array<number>, radians: number) {
        return m4.multiply(m, m4.zRotationMatrix(radians))
    },

    zRotationMatrix: function (radians: number) {
        var c = Math.cos(radians)
        var s = Math.sin(radians)

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    multiply: function (a: Array<number>, b: Array<number>) {
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
}

//objeto com funcoes auxiliares pra matrizes 2d
var m3 = {
    multiply: function (a: Array<number>, b: Array<number>) {
        var a00 = a[0 * 3 + 0]
        var a01 = a[0 * 3 + 1]
        var a02 = a[0 * 3 + 2]
        var a10 = a[1 * 3 + 0]
        var a11 = a[1 * 3 + 1]
        var a12 = a[1 * 3 + 2]
        var a20 = a[2 * 3 + 0]
        var a21 = a[2 * 3 + 1]
        var a22 = a[2 * 3 + 2]
        var b00 = b[0 * 3 + 0]
        var b01 = b[0 * 3 + 1]
        var b02 = b[0 * 3 + 2]
        var b10 = b[1 * 3 + 0]
        var b11 = b[1 * 3 + 1]
        var b12 = b[1 * 3 + 2]
        var b20 = b[2 * 3 + 0]
        var b21 = b[2 * 3 + 1]
        var b22 = b[2 * 3 + 2]

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
        ]
    },

    identity: function () {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]
    },

    projection: function (width: number, height: number) {
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ]
    },

    translate: function (x: number, y: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            x, y, 1
        ]
    },

    rotate: function (radians: number) {
        globalVariables.currentAngleRadians = radians
        let s = Math.sin(radians)
        let c = Math.cos(radians)

        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]
    },

    scale: function (x: number, y: number) {
        return [
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        ]
    }
}

function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
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