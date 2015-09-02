/**@const */ KEY_UP = 'W'.charCodeAt(0);
/**@const */ KEY_DOWN = 'S'.charCodeAt(0);
/**@const */ KEY_LEFT = 'A'.charCodeAt(0);
/**@const */ KEY_RIGHT = 'D'.charCodeAt(0);

/**@const */ TILE_WIDTH = 1;
/**@const */ TILE_HEIGHT = 0.5;
/**@const */ MAP_SIZE = 128;

/**@const */ tilesPerMS = 12 / 1000;

canvas = document.body.children[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl = canvas.getContext('webgl');

loadingCount = 0;
loadingStage = 0;
data = [];
scene = {time:0}
globals = {}

keys = {}
lastKeys = {}

shaders = [];
cv = document.body.children[1];
ctx = cv.getContext('2d');

var BACKGROUND_SHADER=0;
shaders[BACKGROUND_SHADER]=function(){return [[getAjax('bg.fs'),gl.FRAGMENT_SHADER],[getAjax('bg.vs'),gl.VERTEX_SHADER]];}

var TILE_SHADER=1;
shaders[TILE_SHADER]=function(){return [[getAjax('tiles.fs'),gl.FRAGMENT_SHADER],[getAjax('tiles.vs'),gl.VERTEX_SHADER]];}

uv = [ [0,0], [1,0], [2,0] ];

/**@const */ EPSILON = 0.001;
for ( var i in uv ) uv[i] = [ uv[i][0]*0.25+EPSILON, uv[i][1]*0.25+EPSILON, uv[i][0]*0.25-EPSILON+0.25, uv[i][1]*0.25-EPSILON+0.25 ];

window.addEventListener('keyup', function(event) { lastKeys[event.keyCode]=keys[event.keyCode]; keys[event.keyCode] = -scene.time; }, false);
window.addEventListener('keydown', function(event) { lastKeys[event.keyCode]=keys[event.keyCode]; keys[event.keyCode] = scene.time; }, false);
function mouse(event) {
    if ( !scene.viewInv ) {
        scene.viewInv = M4x4.inverse( scene.view );
    }

    v = [ event.pageX / window.innerWidth * 2 - 1, event.pageY / window.innerHeight * -2 + 1, 1, 1 ];
    v = M4x4.multV( scene.viewInv, v );

    v[0] = -v[0];

    x = ( ( v[0] / TILE_WIDTH ) + ( v[1] / TILE_HEIGHT ) );
    y = ( ( v[1] / TILE_HEIGHT ) - ( v[0] / TILE_WIDTH ) );

    x = Math.round(x);
    y = Math.round(y);

    if (event.type=='mousedown') {
        var i = x*MAP_SIZE + y; 
        scene.gameMap[i] = 2 - scene.gameMap[i];
        scene.updateBuffer();
    }
};
window.addEventListener('mousemove', mouse);
window.addEventListener('mousedown', mouse);

scene.render = function( time ) {
    switch ( loadingStage ) {
        case 1: {
            id = ctx.createImageData( 64, 64 );
            d=id.data;
            function runImage(cb) {
                var i = 0;
                for ( var y = 0; y < 64; y++ ) {
                    for ( var x = 0; x < 64; x++ ) {
                        cb(x,y,i);
                        i += 4;
                    }
                }
            }
            function set(i,r,g,b,a) {
                d[i+0] = r;
                d[i+1] = g;
                d[i+2] = b;
                if (a==undefined) a = 255;
                d[i+3] = a;
            }

            function test(x,y,i,r,g,b) {
                if ( Math.abs( ( 64 - x ) - y ) < 6 || Math.abs( x - y ) < 6 || ( x > 15 && x < 48 && y > 15 && y < 48 ) ) {
                    set(i,r,g,b);
                }
            }

            function addNoise(i, strength) {
                n = ( ( rnd.rand() - 0.5 ) * strength ) | 0;
                d[i+0]+=n;
                d[i+1]+=n;
                d[i+2]+=n;
                d[i+3]+=n;
            }

            //Floor
            rnd = lcg();rnd.setSeed(0);
            runImage( function( x,y,i ) {
                set( i,195,195,204 )
                test(x+1,y+2,i,123,127,131)
                test(x-1,y-2,i,203,207,211)
                test(x,y,i,173,177,181)

                addNoise(i,10);
            } );

            ctx.putImageData( id, 0, 0 );

            //VR tile
            runImage( function( x,y,i ) {
                set( i, x < 2 ? 255 : 0, y < 2 ? 255 : 30, 30 );
            } );
            ctx.putImageData( id, 64, 0 );

            //Wall
            runImage( function( x,y,i ) {
                set(i,173-y,177-y,181-y);

                if ( y > 41 && y < 51 ) {
                    var c = ( y - 44 ) - ( Math.sin( x * 0.5 ) * 3 ) | 0;
                    c = c > 0 && c < 3;
                    set( i, c?225:10, c?225:40, c?225:185 );
                    addNoise( i, 50 );
                }
                addNoise( i, 10 );
            } );
            ctx.putImageData( id, 128, 0 );

            colors = [
                [0.1,0.9,1.0,18*18,12], [0.2,1.0,0.8,20*20,16], [0.1,0.5,0.8,16*16,12],
                [1.0,0.4,0.1,18*18,12], [0.8,0.5,0.2,20*20,16], [0.8,0.2,0.1,16*16,12],
            ];
            //Characters
            for ( var i in colors ) {
                color = colors[i];

                runImage( function( x,y,i ) {
                    _x = Math.abs(x - 32);
                    _y = y-30;
                    var _in = ( y > 4 && y < 60 ) ? ( Math.max( y > 20 ? color[4] - _x : 0, ( color[3] - (_x*_x+_y*_y) ) * 0.9 ) ): -1 ;
                    var colorStrength = _in * 10 + 30;

                    if (colorStrength>255) colorStrength = Math.sqrt(colorStrength - 255) * 10 + 255;

                    set( i, color[0] * colorStrength, color[1] * colorStrength, color[2] * colorStrength, _in > 0 ? 255 : 0 );
                    if ( _in > 0 ) {
                        if ( ( y > 20 && y < 24 && _x > 5 && _x < 9 ) || ( y == 35 && _x < 6 ) ) {
                            set( i, 0,0,0, 255 );
                        }
                        addNoise( i , 35 );
                    }
                } );
                ctx.putImageData( id, 64*(i%4), 64*((i/4+1)|0) );
            }
        } break;
        case 9: {
            globals.atlas = gl.createTexture();
            gl.bindTexture( gl.TEXTURE_2D, globals.atlas );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.getImageData(0,0,256,256) );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, globals.atlas);
        } break;
        case 10: {
            for ( key in shaders ) shaders[key] = shaders[key]();
        } break;
        case 11: {
            if ( loadingCount <= 0 ) {
                //Init shaders
                for ( var i = 0; shaders[i]; i++ ) {
                    shaderProgram = gl.createProgram();
                    for ( var j = 0; shaders[i][j]; j++ ) {
                        shader = gl.createShader( shaders[i][j][1] );
                        gl.shaderSource(shader, data[ shaders[i][j][0] ] );
                        gl.compileShader(shader);

                        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
                            console.log("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
                        }
                        gl.attachShader( shaderProgram, shader );
                    }
                    gl.linkProgram( shaderProgram );

                    gl.useProgram(shaderProgram);

                    var vertex = gl.getAttribLocation( shaderProgram, 'position' );
                    gl.enableVertexAttribArray(vertex);

                    var uv = gl.getAttribLocation( shaderProgram, 'uv' );
                    if ( uv > 0 ) gl.enableVertexAttribArray(uv);

                    shaders[i] = [ shaderProgram, vertex, uv ];
                }
            } else {
                return;
            }
        } break;
        case 20: {
            globals.fullScreenBuffer = getArrayBuf([-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]);
        } break;
        case 30: {
            scene.next = menu;
        } break;
    }

    loadingStage += 1;
}

function setSize(scene) {
    scene.width = canvas.width;
    scene.height = canvas.height;

    if (scene.size) scene.size();
}

onFrame = function(t) {
    setSize(scene);

    scene.delta = t - scene.time;;
    scene.lastTime = scene.time;
    scene.time = t;

    try{ scene.render(t);}catch(v){
        requestAnimationFrame(onFrame);
        throw v;
    }
    requestAnimationFrame(onFrame);

    if (scene.next) {
        setSize(scene.next);

        scene.time = 0;
        scene.delta = 0;
        if (scene.next.init) {
            scene.next.init();
        }

        scene.next.parent = scene;
        scene = scene.next;
    }
}
requestAnimationFrame(onFrame);

menu = bindRecursive({
    camX: 0,
    camY: MAP_SIZE,

    updateBuffer:function() {
        if ( this.gameBuffer )
            gl.deleteBuffer( this.gameBuffer[0] );

        var gameBuffer = [];
        var wallBuffer = [];

        var i = -1;
        for (var y = 0; y < MAP_SIZE; y++ ) {
            for (var x = 0; x < MAP_SIZE; x++ ) {
                i += 1;

                if ( this.gameMap[i] == 0 )
                    continue;

                _x = ( x - y ) * 0.5;
                _y = ( x + y ) * 0.25;

                hh = this.gameMap[ i + MAP_SIZE + 1 ] == 0;
                uvHH = hh ? 0 : (2/3)/4;
                hh = hh ? 0.5 : 0;
                if ( this.gameMap[i + MAP_SIZE ] == 0 ) {
                    _uv = uv[2];
                    wallBuffer = [
                            _x-0.5,  _y,        0,  _uv[0], _uv[3], //B
                            _x,      _y+0.25,   0,  _uv[2], _uv[3], //A
                            _x-0.5,  _y+0.25+hh,0,  _uv[0], _uv[1]+uvHH, //B+

                            _x-0.5,  _y+0.25+hh,0,  _uv[0], _uv[1]+uvHH, //C
                            _x,      _y+0.25,   0,  _uv[2], _uv[3], //A
                            _x,      _y+0.5+hh, 0,  _uv[2], _uv[1]+uvHH, //A+
                    ].concat( wallBuffer );
                }
                if ( this.gameMap[i + 1] == 0 ) {
                    _uv = uv[2];
                    wallBuffer = [
                            _x+0.5,  _y,        0,  _uv[2], _uv[3], //B
                            _x,      _y+0.25,   0,  _uv[0], _uv[3], //A
                            _x+0.5,  _y+0.25+hh,0,  _uv[2], _uv[1]+uvHH, //C

                            _x+0.5,  _y+0.25+hh,0,  _uv[2], _uv[1]+uvHH, //C
                            _x,      _y+0.25,   0,  _uv[0], _uv[3], //A
                            _x,      _y+0.5+hh, 0,  _uv[0], _uv[1]+uvHH, //B
                    ].concat( wallBuffer );
                }

                /**
                 * A(0,0)   C(1,0)
                 *
                 * B(0,1)   D(1,1)
                 *
                 *
                 *      A(0,0)
                 *
                 *  B(0,1)  C(1,0)
                 *
                 *      D(1,1)
                 **/ 
                _uv = uv[this.gameMap[i]-1];
                gameBuffer = gameBuffer.concat( [
                        _x-0.5,  _y,      0,  _uv[0], _uv[3], //B
                        _x,      _y+0.25, 0,  _uv[2], _uv[3], //A
                        _x+0.5,  _y,      0,  _uv[2], _uv[1], //C

                        _x+0.5,  _y,      0,  _uv[2], _uv[1], //C
                        _x,      _y-0.25, 0,  _uv[0], _uv[1], //D
                        _x-0.5,  _y,      0,  _uv[0], _uv[3], //B
                ] );
            }
        }

        this.gameBuffer = getArrayBuf( gameBuffer.concat( wallBuffer ) );
    },

    setCamera:function(x,y) {
        this.camX = x;
        this.camY = y;
    },

    init:function() {

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        var gameMap = [];
        for ( ;gameMap.length<MAP_SIZE*MAP_SIZE;gameMap[gameMap.length]=0 ) {}

        this.gameMap = gameMap;

        for (var y = 64-12; y < 64+12; y+=1) {
            for (var x = 64-12; x < 64+12; x+=1) {
                gameMap[y*MAP_SIZE+x] = 2;
            }
        }
        for(var x=0;x<MAP_SIZE;x+=6)
        for(var y=0;y<MAP_SIZE;y+=7)
        gameMap[y*MAP_SIZE+x]=1;

        this.updateBuffer();
    },

    size:function() {
        gl.viewport(0,0,this.width,this.height);
        this.aspect = window.innerWidth / window.innerHeight;
        this.uniforms = { 'resolution':[ this.width, this.height ], 'aspect':[ 1.0, this.aspect ], 'atlas': 0 };
        this.perspective = M4x4.makeOrtho( -10, 10, -10/this.aspect, 10/this.aspect, 0.1, 100.0 );
        this.perspectiveInv = M4x4.inverse( this.perspective );

        this.rotMatrix = M4x4.makeRotate( Math.PI/180*60, [1,0,0] );
        this.rotMatrixInv = M4x4.makeRotate( Math.PI/180*-60, [1,0,0] );
    },

    render:function(time) {
        var deltaX = 0; deltaY = 0;

        if (keys[KEY_DOWN]>0) { deltaY -= 4; }
        if (keys[KEY_UP]>0) { deltaY += 4; }
        if (keys[KEY_LEFT]>0) { deltaX -= 1; }
        if (keys[KEY_RIGHT]>0) { deltaX += 1; }

        if ( this.delta ) {
            this.camX += deltaX * this.delta * tilesPerMS;
            this.camY += deltaY * this.delta * tilesPerMS;
        }

        this.view = M4x4.translate3(-this.camX,-this.camY/4,-10, this.perspective );
        this.viewInv = null;

        gl.useProgram( shaders[BACKGROUND_SHADER][0] );

        setUniforms(shaders[BACKGROUND_SHADER][0], this.uniforms);
        setUniforms(shaders[BACKGROUND_SHADER][0], {time:time*0.001});

        gl.bindBuffer( gl.ARRAY_BUFFER, globals.fullScreenBuffer );
        gl.vertexAttribPointer( shaders[BACKGROUND_SHADER][1], 3, gl.FLOAT, false, 0, 0 );

        gl.drawArrays( gl.TRIANGLES, 0, 6 );


        gl.useProgram( shaders[TILE_SHADER][0] );

        setUniforms(shaders[TILE_SHADER][0], this.uniforms);
        this.mvc = M4x4.flip(this.view);
        setUniforms(shaders[TILE_SHADER][0], {time:time*0.001,'mvc':this.mvc});

        gl.bindBuffer( gl.ARRAY_BUFFER, this.gameBuffer );
        gl.vertexAttribPointer( shaders[TILE_SHADER][1], 3, gl.FLOAT, false, 5*4, 0 );
        gl.vertexAttribPointer( shaders[TILE_SHADER][2], 2, gl.FLOAT, false, 5*4, 3*4 );

        gl.drawArrays( gl.TRIANGLES, 0, this.gameBuffer.length / 5 );

        if (!this.test) {
            this.test=true;

            for ( var x = 0; x < 4; x += 3 ) {
                for ( var y = 0; y < 4; y += 3 ) {
                    p = M4x4.multV( this.mvc, [x,y,0,1]);
                    console.log( x, y, p[0]*p[2], p[1]*p[2] );
                }
            }
        }
    },
});
