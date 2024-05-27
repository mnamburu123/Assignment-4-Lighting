var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position; 
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform vec3 u_CameraPos;
  uniform int u_whichTexture;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;
  uniform bool u_ChangeColor;


  void main() {
    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    }
    else if(u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    }
    else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if(u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if(u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else if(u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    }
   else{
     gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_CameraPos - vec3(v_VertPos));
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

    vec3 original = vec3(1.0, 1.0, 0.9);
    vec3 diffuseColor = u_ChangeColor ? u_lightColor : original;
    vec3 diffuse = diffuseColor * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    if(u_lightOn){
      if(u_whichTexture == 0){
        gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      }
      else{
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  
    
  }`


// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ViewMatrix;                             
let u_ProjectionMatrix; 
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_lightPos;
let u_CameraPos;
let u_lightOn;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_lightColor;
let u_ChangeColor;



function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }
  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
    return;
  }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }


  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }
  u_ChangeColor = gl.getUniformLocation(gl.program, 'u_ChangeColor');
  if (!u_ChangeColor) {
    console.log('Failed to get the storage location of u_ChangeColor');
    return;
  }


  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }


  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }  
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }  
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }  
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }  
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_size = 5;
let g_selectedAngle = 0;
let g_tail = 0;
let g_body = 0;
let g_Head = 0;
let g_tailAnimation = false;
let g_bodyAnimation = false;
let g_HeadAnimation = false;
let g_NormalOn = false;
let g_LightPos = [0,1,-2];
let g_LightOn = true;

let AngleX = 0;
let AngleY = 0;
let AngleYR = 0;

function addActionsForHtmlUI(){
  document.getElementById('Color').addEventListener('input', function() {
    let red = 2.0;
    let green = 1.0;
    let blue = 3.0;
    gl.uniform3f(u_lightColor, red, green, blue);  
    gl.uniform1i(u_ChangeColor, true); 
    renderAllShapes();
  });

  document.getElementById('LightOn').onclick = function() {g_LightOn = false; };
  document.getElementById('LightOff').onclick = function() {g_LightOn = true; };

  document.getElementById('NormalOn').onclick = function() {g_NormalOn = true; };
  document.getElementById('NormalOff').onclick = function() {g_NormalOn = false; };

  document.getElementById('Xlight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_LightPos[0] = this.value/100; renderAllShapes(); }});
  document.getElementById('Ylight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_LightPos[1] = this.value/100; renderAllShapes(); }});
  document.getElementById('Zlight').addEventListener('mousemove', function (ev) { if(ev.buttons == 1) { g_LightPos[2] = this.value/100; renderAllShapes(); }});
  
    document.getElementById('Angle').addEventListener('mousemove', function() {g_selectedAngle = this.value; renderAllShapes(); });

}

function Undo() {
  if (g_shapesList.length > 0) {
      g_shapesList.pop(); 
      renderAllShapes(); 
  } 
}

function initTextures() {
    
  var image0 = new Image(); 
  var image1 = new Image(); 
  var image2 = new Image(); 
  var image3 = new Image(); 
  var image4 = new Image(); 
  
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToGLSL(image0,  0); };
  image1.onload = function(){ sendTextureToGLSL(image1,  1); };
  image2.onload = function(){ sendTextureToGLSL(image2,  2); };
  image3.onload = function(){ sendTextureToGLSL(image3,  3); };
  image4.onload = function(){ sendTextureToGLSL(image4,  4); };

  image0.src = 'star.jpg';
  image1.src = 'snow.jpg';
  image2.src = 'skin.jpg';
  image3.src = 'north.jpg';
  image4.src = 'sky.jpg';

  return true;
}

function sendTextureToGLSL(image, number) { 
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
      console.log('Failed to create the texture object');
      return false;
  }
  
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
   if (number === 0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(u_Sampler0, 0);
  } else if (number === 1) {
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(u_Sampler1, 1);
  }
  else if (number === 2) {
    gl.activeTexture(gl.TEXTURE2);
    gl.uniform1i(u_Sampler2, 2);
  }
  else if (number === 3) {
    gl.activeTexture(gl.TEXTURE3);
    gl.uniform1i(u_Sampler3, 3);
  }
  else if (number === 4) {
    gl.activeTexture(gl.TEXTURE3);
    gl.uniform1i(u_Sampler4, 4);
  }

   gl.bindTexture(gl.TEXTURE_2D, texture);
   
   // Set the texture parameters
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   // Set the texture image
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  document.onkeydown = keydown;
  
  
  

//canvas.onmousedown = click;
canvas.onmousemove = function (ev) {
  if (ev.buttons == 1) {
    rotation(ev);
  }
};


  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  requestAnimationFrame(tick); 
  //renderAllShapes();
}




var g_startTime = performance.now()/ 1000.0;
var g_seconds = performance.now()/ 1000.0 - g_startTime;


function rotation(ev){
  AngleX += ev.movementX;
  AngleY += ev.movementY;
  AngleY = Math.max(0, Math.min(90, AngleY));
  AngleX = Math.max(-90, Math.min(90, AngleX));
  renderAllShapes();
}






function updateWorld() {
  Object.keys(map).forEach(key => {
    let parts = key.split(',').map(Number);
    drawBlock(parts[0], parts[1], parts[2]);
  });
}




function updateAnimationAngles() {
  if (g_bodyAnimation) {
    g_body = (45 * Math.sin(g_seconds));
  }
  if (g_tailAnimation) {
    g_tail = 20 * Math.sin(2 * Math.PI * g_seconds)
  }
  if (g_HeadAnimation) {
    g_Head = 20 * Math.sin(2 * Math.PI * g_seconds)
  }
  g_LightPos[0] = Math.cos(g_seconds);
}

function keydown(ev){
  //var camera = new Camera();
  switch(ev.keyCode){
      case 83: // W 
          g_eye[2] += 0.1;
          break;
      case 87: // S 
          g_eye[2] -= 0.1; 
          break;
      case 65: // A 
          g_eye[0] -= 0.1; 
          break;
      case 68: // D 
          g_eye[0] += 0.1; 
          break;
      case 37: // Left 
          g_eye[0] -= 0.2;
          break;
      case 39: // Right 
          g_eye[0] += 0.2;
          break;
      case 69: // Q 
            AngleYR -= 5; // Rotate left
            break;
      case 81: // E
            AngleYR += 5; // Rotate right
            break;

  }
  //AngleY = Math.max(-89, Math.min(89, AngleY));
  renderAllShapes();
}



function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  console.log(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  let point;
  if(g_selectedType == POINT){
    point = new Point();
  }else if(g_selectedType == TRIANGLE) {
    point = new Triangle();
  }else if(g_selectedType == CIRCLE){
    point = new Circle();
    point.segment = g_selectedSegment;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_size;
  g_shapesList.push(point);

  renderAllShapes();
}


function convertCoordinatesEventToGL(ev){
    
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return([x, y]);
}


var g_eye = [0, 0, 5]; 
var g_at = [0, 0, 0]; 
var g_up = [0, 1, 0]; 


function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  //viewMat.setLookAt(1, 0, -1, 0,0,0, 0,1,0);
  viewMat.setLookAt(
    g_eye[0], g_eye[1], g_eye[2],
    g_at[0], g_at[1], g_at[2],
    g_up[0], g_up[1], g_up[2]
);

  viewMat.rotate(AngleY, 1, 0, 0); 
  viewMat.rotate(AngleYR, 0, 1, 0); 
  viewMat.rotate(AngleX, 0, 1, 0);




  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


  var globalRotMat = new Matrix4().rotate(AngleX, 0, 1, 0).rotate(AngleY, 0, 1, 0).rotate(g_selectedAngle, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);


  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration)/10, "numdot");

}
  
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
function renderScene() {

  gl.uniform3f(u_lightPos, g_LightPos[0], g_LightPos[1], g_LightPos[2]);
  gl.uniform3f(u_CameraPos, g_eye[0], g_eye[1], g_eye[2]);
  gl.uniform1f(u_lightOn, g_LightOn);
  
  
  //Light
  var light = new Cube();
  light.matrix.translate(g_LightPos[0], g_LightPos[1], g_LightPos[2]);
  light.matrix.scale(-0.5, -0.5, -0.5);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  //sphere
  var sphere = new Sphere();
  sphere.matrix.translate(-2, 3, -2);
  sphere.render();

  // sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0]; 
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var count1 = new Cube();
  count1.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count1.textureNum = -3;
  count1.matrix.scale(.5, .5, .5);
  count1.matrix.translate(3, -2, 0);
  count1.render();

  var count2 = new Cube();
  count2.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count2.textureNum = -3;
  count2.matrix.scale(.5, .5, .5);
  count2.matrix.translate(3, -2, 3);
  count2.render();

  var count3 = new Cube();
  count3.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count3.textureNum = -3;
  count3.matrix.scale(.5, .5, .5);
  count3.matrix.translate(3, -2, 4);
  count3.render();

  var count4 = new Cube();
  count4.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count4.textureNum = -3;
  count4.matrix.scale(.5, .5, .5);
  count4.matrix.translate(3, -2, 1);
  count4.render();

  var count5 = new Cube();
  count5.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count5.textureNum = -3;
  count5.matrix.scale(.5, .5, .5);
  count5.matrix.translate(3, -2, 2);
  count5.render();

  var count6 = new Cube();
  count6.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count6.textureNum = -3;
  count6.matrix.scale(.5, .5, .5);
  count6.matrix.translate(3, -2, -1);
  count6.render();


  var count7 = new Cube();
  count7.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count7.textureNum = -3;
  count7.matrix.scale(.5, .5, .5);
  count7.matrix.translate(3, -2, -2);
  count7.render();


  var count8 = new Cube();
  count8.color = [1.0, 0.0, 0.0, 1.0];
  if (g_NormalOn) count8.textureNum = -3; 
  count8.matrix.scale(.5, .5, .5);
  count8.matrix.translate(3, -2, -3);
  count8.render();

  var count9 = new Cube();
  count9.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count9.textureNum = -3;
  count9.matrix.scale(.5, .5, .5);
  count9.matrix.translate(3, -2, -4);
  count9.render();

  var count10 = new Cube();
  count10.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count10.textureNum = -3;
  count10.matrix.scale(.5, .5, .5);
  count10.matrix.translate(2, -2, 4);
  count10.render();

  var count11 = new Cube();
  count11.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count11.textureNum = -3;
  count11.matrix.scale(.5, .5, .5);
  count11.matrix.translate(1, -2, 4);
  count11.render();

  var count12 = new Cube();
  count12.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count12.textureNum = -3;
  count12.matrix.scale(.5, .5, .5);
  count12.matrix.translate(0, -2, 4);
  count12.render();

  var count13 = new Cube();
  count13.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count13.textureNum = -3;
  count13.matrix.scale(.5, .5, .5);
  count13.matrix.translate(-1, -2, 4);
  count13.render();

  var count14 = new Cube();
  count14.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count14.textureNum = -3;
  count14.matrix.scale(.5, .5, .5);
  count14.matrix.translate(-2, -2, 4);
  count14.render();

  var count15 = new Cube();
  count15.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count15.textureNum = -3;
  count15.matrix.scale(.5, .5, .5);
  count15.matrix.translate(-3, -2, 4);
  count15.render();

  var count16 = new Cube();
  count16.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count16.textureNum = -3;
  count16.matrix.scale(.5, .5, .5);
  count16.matrix.translate(-4, -2, 0);
  count16.render();

  var count17 = new Cube();
  count17.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count17.textureNum = -3;
  count17.matrix.scale(.5, .5, .5);
  count17.matrix.translate(-4, -2, 1);
  count17.render();

  var count18 = new Cube();
  count18.color = [1.0, 0.0, 0.0, 1.0];
  if (g_NormalOn) count18.textureNum = -3; 
  count18.matrix.scale(.5, .5, .5);
  count18.matrix.translate(-4, -2, 2);
  count18.render();

  var count19 = new Cube();
  count19.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count19.textureNum = -3;
  count19.matrix.scale(.5, .5, .5);
  count19.matrix.translate(-4, -2, 3);
  count19.render();

  var count20 = new Cube();
  count20.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count20.textureNum = -3;
  count20.matrix.scale(.5, .5, .5);
  count20.matrix.translate(-4, -2, 4);
  count20.render();

  var count21 = new Cube();
  count21.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count21.textureNum = -3;
  count21.matrix.scale(.5, .5, .5);
  count21.matrix.translate(-4, -2, -1);
  count21.render();

  var count22 = new Cube();
  count22.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count22.textureNum = -3;
  count22.matrix.scale(.5, .5, .5);
  count22.matrix.translate(-4, -2, -2);
  count22.render();

  var count23 = new Cube();
  count23.color = [1.0, 0.0, 0.0, 1.0];
  if (g_NormalOn) count23.textureNum = -3; 
  count23.matrix.scale(.5, .5, .5);
  count23.matrix.translate(-4, -2, -3);
  count23.render();

  var count24 = new Cube();
  count24.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count24.textureNum = -3;
  count24.matrix.scale(.5, .5, .5);
  count24.matrix.translate(-4, -2, -4);
  count24.render();

  var count25 = new Cube();
  count25.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count25.textureNum = -3;
  count25.matrix.scale(.5, .5, .5);
  count25.matrix.translate(-3, -2, -4);
  count25.render();

  var count26 = new Cube();
  count26.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count26.textureNum = -3;
  count26.matrix.scale(.5, .5, .5);
  count26.matrix.translate(-2, -2, -4);
  count26.render();

  var count27 = new Cube();
  count27.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count27.textureNum = -3;
  count27.matrix.scale(.5, .5, .5);
  count27.matrix.translate(-1, -2, -4);
  count27.render();

  var count28 = new Cube();
  count28.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count28.textureNum = -3;
  count28.matrix.scale(.5, .5, .5);
  count28.matrix.translate(0, -2, -4);
  count28.render();

  var count29 = new Cube();
  count29.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count29.textureNum = -3;
  count29.matrix.scale(.5, .5, .5);
  count29.matrix.translate(-1, -2, -4);
  count29.render();

  var count30 = new Cube();
  count30.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count30.textureNum = -3;
  count30.matrix.scale(.5, .5, .5);
  count30.matrix.translate(2, -2, -4);
  count30.render();

  var count31 = new Cube();
  count31.color = [1.0, 0.0, 0.0, 1.0]; 
  if (g_NormalOn) count31.textureNum = -3;
  count31.matrix.scale(.5, .5, .5);
  count31.matrix.translate(1, -2, -4);
  count31.render();


  //ground
  var ground = new Cube();
  ground.color = [1.0, 0.0, 0.0, 1.0]; 
  ground.textureNum = 1;
  ground.matrix.translate(0, -0.75, 0.0);
  ground.matrix.scale(100, 0, 100);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  // Main body of the dog
  var body = new Cube();
  body.color = [0.6, 0.4, 0.2, 1.0]; 
  body.textureNum = 2;
  body.matrix.setTranslate(-0.4, -0.3, 0.0);
  body.matrix.rotate(g_body, 0, 1, 0); 
  var bodyconstruct = new Matrix4(body.matrix);
  body.matrix.scale(1, 0.5, 0.5);
  body.render();

    // Head of the dog
    var head = new Cube();
    head.color = [1.0, 0.8, 0.6, 1.0]; // Light brown for the head
    head.textureNum = 2;
    head.matrix = bodyconstruct;
    head.matrix.translate(-0.4, 0.2, 0.0);
    var consruct = new Matrix4(head.matrix);
    head.matrix.scale(0.5, 0.5, 0.5);
    head.render();

    // nose
    var nose = new Cube();
    nose.color = [1.0, 0.0, 0.0, 1.0];
    nose.matrix = consruct;
    nose.textureNum = -2;
    nose.matrix.translate(-0.05, 0.2, 0.25);
    nose.matrix.rotate(g_Head, 0, 1, 0); 
    nose.matrix.scale(0.1, 0.1, 0.1);
    nose.render();

    // Left ear
    var leftear = new Cube();
    leftear.color = [1.0, 1.0, 1.0, 1.0]; // White for the eyes
    leftear.textureNum = -2;
    leftear.matrix = consruct;
    leftear.matrix.translate(2.0, 3.0, 0.25);
    leftear.matrix.scale(1, 1, 0.5);
    leftear.render();
  
  
    // right ear
    var rightear = new Cube();
    rightear.color = [1.0, 1.0, 1.0, 1.0]; // White for the eyes
    rightear.textureNum = -2;
    rightear.matrix = consruct;
    rightear.matrix.translate(2.0, 0.0, 0.25);
    rightear.matrix.scale(1, 1, 0.5);
    rightear.render();



    // front left leg
    var legBackRight = new Cube();
    legBackRight.color = [0.5, 0.3, 0.1, 1.0]; // Darker brown
    legBackRight.textureNum = -2;
    legBackRight.matrix = bodyconstruct;
    legBackRight.matrix.translate(1.0, -1.1, 0.5);
    legBackRight.matrix.scale(0.25, 0.7, 0.15);
    legBackRight.render();

      // back left leg
      var legFrontRight = new Cube();
      legFrontRight.color = [0.5, 0.3, 0.1, 1.0]; // Darker brown
      legFrontRight.textureNum = -2;
      legFrontRight.matrix = bodyconstruct;
      legFrontRight.matrix.translate(2.0, -0.04, 1);
      legFrontRight.matrix.scale(1.0, 1.9, 0.15);
      legFrontRight.render();

    // back left leg
    var legBackLeft = new Cube();
    legBackLeft.color = [0.5, 0.3, 0.1, 1.0]; // Darker brown
    legBackLeft.textureNum = -2;
    legBackLeft.matrix = bodyconstruct;
    legBackLeft.matrix.translate(3.0, -0.03, 1);
    legBackLeft.matrix.scale(1.0, 0.9, 0.15);
    legBackLeft.render();

    // back right leg
    var legBackRight = new Cube();
    legBackRight.color = [0.5, 0.3, 0.1, 1.0]; // Darker brown
    legBackRight.textureNum = -2;
    legBackRight.matrix = bodyconstruct;
    legBackRight.matrix.translate(1.4, -0.01, 0.50);
    legBackRight.matrix.scale(1.0, 0.67, 0.15);
    legBackRight.render();

  // Tail of the dog
  var tail = new Cube();
  tail.color = [0.9, 0.7, 0.5, 1.0]; // Lighter brown, almost beige
  tail.textureNum = 2;
  tail.matrix = bodyconstruct;
  tail.matrix.translate(0.8, 0.7, 0.5);
  tail.matrix.rotate(g_tail, 0, 1, 0); 
  tail.matrix.rotate(45, 0, 1, 0);
  tail.matrix.scale(3, 1.0, 0.15);
  tail.render();

}


