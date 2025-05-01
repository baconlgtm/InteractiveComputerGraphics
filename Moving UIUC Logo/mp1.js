
/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global Angle used in sine deformation of the circle */
var frame = 0;

/** @global The rotation angle of our triangle */
var rotAngle = 0;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var mvMatrix = glMatrix.mat4.create();

/** @global The Projection matrix contains the ortho or perspective metrix we use */
var pMatrix = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;

/** @global Number of vertices around circle boundary */
var numVertices = 102;

/** @global Time since last deformation of circle */
var elapsedTime = 0;

/** @global Displacements for circle boundary vertices */
var displacements = new Array(numVertices).fill(0);

/** random color */
var color_random_flag = 0;
var changed = 0;

/**color buffer, to store original color*/
var colorBuffer = new Array(numVertices*4).fill(0);

/** onclick envent function for color changeing*/
function randomColoring(){
    changed = 1;
    if (color_random_flag == 0){
        color_random_flag = 1;
    }
    else{
        color_random_flag = 0;
    }
    console.log(changed);
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
    
  var shaderSource = shaderScript.text;
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
    
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");  
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMvMatrix"); 
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  //Enable the attribute variables we will send data to....     
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

function loadVertices(numVertices) {
//Generate the vertex positions    
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    
  // Start with vertex at the origin    
    var triangleVertices = [
      // orange I
      -0.6, 0.9, 0.0,
      -0.6, 0.6, 0.0,
      -0.3, 0.6, 0.0,
      
      -0.3, -0.6, 0.0,
      -0.6, -0.6, 0.0,
      -0.6, -0.9, 0.0,
      
      0.6, -0.9, 0.0,
      0.6, -0.6, 0.0,
      0.3, -0.6, 0.0,
      
      0.3, 0.6, 0.0,
      0.6, 0.6, 0.0,
      0.6, 0.9, 0.0,
      
      -0.6, 0.9, 0.0,
      -0.3, 0.6, 0.0,
      0.6, 0.9, 0.0,
        
      0.6, 0.9, 0.0,
      0.3, 0.6, 0.0,
      -0.3, 0.6, 0.0, 
      
      -0.3, 0.6, 0.0,
      -0.3, -0.6, 0.0,
      0.3, -0.6, 0.0, 
      
      -0.3, 0.6, 0.0,
      0.3, -0.6, 0.0, 
      0.3, 0.6, 0.0,
      
      -0.3, -0.6, 0.0,
      -0.6, -0.9, 0.0,
      0.6, -0.9, 0.0,
      
      -0.3, -0.6, 0.0,
      0.3, -0.6, 0.0,
      0.6, -0.9, 0.0,
      
      //blue frame
      -0.65, 0.95, 0.0,
      -0.6, 0.95, 0.0,
      -0.65, 0.55, 0.0,
      
      -0.6, 0.95, 0.0,
      -0.65, 0.55, 0.0,
      -0.6, 0.55, 0.0,
      
      0.65, 0.95, 0.0,
      0.6, 0.95, 0.0,
      0.65, 0.55, 0.0,
      
      0.6, 0.95, 0.0,
      0.65, 0.55, 0.0,
      0.6, 0.55, 0.0,
      
      -0.65, -0.95, 0.0,
      -0.6, -0.95, 0.0,
      -0.65, -0.55, 0.0,
      
      -0.6, -0.95, 0.0,
      -0.65, -0.55, 0.0,
      -0.6, -0.55, 0.0,
      
      0.65, -0.95, 0.0,
      0.6, -0.95, 0.0,
      0.65, -0.55, 0.0,
      
      0.6, -0.95, 0.0,
      0.65, -0.55, 0.0,
      0.6, -0.55, 0.0,
      
      -0.35, 0.55, 0.0,
      -0.3, 0.55, 0.0,
      -0.35, -0.55, 0.0,
      
      -0.3, 0.55, 0.0,
      -0.35, -0.55, 0.0,
      -0.3, -0.55, 0.0,
      
      0.35, 0.55, 0.0,
      0.3, 0.55, 0.0,
      0.35, -0.55, 0.0,
      
      0.3, 0.55, 0.0,
      0.35, -0.55, 0.0,
      0.3, -0.55, 0.0, 
      
      -0.6, 0.95, 0.0,
      -0.6, 0.9, 0.0,
      0.6, 0.95, 0.0, 
      
      -0.6, 0.9, 0.0,
      0.6, 0.95, 0.0,
      0.6, 0.9, 0.0,
      
      -0.6, -0.95, 0.0,
      -0.6, -0.9, 0.0,
      0.6, -0.95, 0.0, 
      
      -0.6, -0.9, 0.0,
      0.6, -0.95, 0.0,
      0.6, -0.9, 0.0,
      
      -0.6, 0.6, 0.0,
      -0.3, 0.6, 0.0,
      -0.6, 0.55, 0.0,
      
      -0.3, 0.6, 0.0,
      -0.6, 0.55, 0.0,
      -0.3, 0.55, 0.0,
      
      -0.6, -0.6, 0.0,
      -0.3, -0.6, 0.0,
      -0.6, -0.55, 0.0,
      
      -0.3, -0.6, 0.0,
      -0.6, -0.55, 0.0,
      -0.3, -0.55, 0.0,
      
      0.6, 0.6, 0.0,
      0.3, 0.6, 0.0,
      0.6, 0.55, 0.0,
      
      0.3, 0.6, 0.0,
      0.6, 0.55, 0.0,
      0.3, 0.55, 0.0,
      
      0.6, -0.6, 0.0,
      0.3, -0.6, 0.0,
      0.6, -0.55, 0.0,
      
      0.3, -0.6, 0.0,
      0.6, -0.55, 0.0,
      0.3, -0.55, 0.0
  ];

  // directly change points xy coordinates randomly
  for (i=0;i<numVertices;i++){
      triangleVertices[i*3] += 0.03*(Math.random()*2-1);
      triangleVertices[i*3+1] += 0.03*(Math.random()*2-1);
  }
  var triangleVertices = triangleVertices.map(x => x * 0.5);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = numVertices;
}

/**
 * Populate color buffer with data
  @param {number} number of vertices to use around the circle boundary
 */
function loadColors(numVertices) {
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    
  // load original color when flag = 0
    if(!color_random_flag){
      colors = colorBuffer;
  }
  // Set the heart of the circle to be black    
  var colors = [
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
      
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
      
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
        0.9098,0.2902,0.1529,1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
        0.9098,0.2902,0.1529, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
      
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0,
        0.0745, 0.1608, 0.2941, 1.0
    ];
  
//  var a=1.0;
//  var g=0.0;
//  var halfV= numVertices/2.0;
//  for (i=0;i<=numVertices;i++){
//      r=Math.abs((i-halfV)/halfV);
//      b= 1.0-r;
//      colors.push(r);
//      colors.push(g);
//      colors.push(b);
//      colors.push(a);
//  }
    
  // store original color when never changed
  if(!color_random_flag && !changed){
      colorBuffer = colors;
  }
   
  // change color randomly
  if(color_random_flag){
    for (i=0;i<numVertices;i++){
      colors[i*4] = Math.random();
      colors[i*4+1] = Math.random();
      colors[i*4+2] = Math.random();
      colors[i*4+3] = Math.random();
    }
  }
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = numVertices;
}

/**
 * Populate buffers with data
   @param {number} number of vertices to use around the circle boundary
 */
function setupBuffers(numVertices) {
    
  //Generate the vertex positions    
  loadVertices(numVertices);

  //Generate the vertex colors
  loadColors(numVertices);
}

/**
 * Initialize modelview and projection matrices
 */
function setupUniforms(){
    glMatrix.mat4.ortho(pMatrix,-1,1,-1,1,-1,1);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix); 
    
    // Send the current  ModelView matrix to the vertex shader
    glMatrix.mat4.identity(mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); 
}

/**
 * Draw model...render a frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
  // Send the current  ModelView matrix to the vertex shader
    // this statement makes everything work, and I don't know why
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Function updates geometry and repeatedly renders frames.
 */
 function animate(now) {
     
  var speed = document.getElementById("speed").value;
  var scale = document.getElementById("scale").value;

  draw();
     
  // Convert the time to seconds
  now *= 0.001;
  // Subtract the previous time from the current time
  var deltaTime = now - previousTime;
     
  // Remember the current time for the next frame.
  previousTime = now;
  elapsedTime+=deltaTime;
  if(speed>0){   
    if (elapsedTime >= (50.0/speed))
      {
          //Generate a deformation of the vertex
          elapsedTime =0.0;
          // Update deformation
          loadVertices(numVertices);
          loadColors(numVertices);
      }
  }

  rotAngle += speed*deltaTime;
  if (rotAngle > 360.0)
      rotAngle = 0.0;
  
  // rotation and scaling the logo
  var scaling = [0.02*scale,0.02*scale,0.02*scale];  
  glMatrix.mat4.fromZRotation(mvMatrix, 0.5*degToRad(rotAngle));
  glMatrix.mat4.scale(mvMatrix, mvMatrix, scaling); 
  glMatrix.mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));
     
  // ....next frame
  requestAnimationFrame(animate);
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  
  console.log("No bugs so far...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers(numVertices);
  setupUniforms();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(animate);  
}

