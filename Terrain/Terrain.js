/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);
        this.vBuffer[vid] = v[0];
        this.vBuffer[vid+1] = v[1];
        this.vBuffer[vid+2] = v[2];
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);
        v[0] = this.vBuffer[vid];
        v[1] = this.vBuffer[vid+1];
        v[2] = this.vBuffer[vid+2];
   
    }
    
    /**
    * Send the buffer objects to WebGL for rendering 
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }
    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }
    
    // calculate per vertex normal
    perVertexNormal(){
//        console.log(this.numFaces);
        for(var i=0; i < this.numFaces; i++){
//            console.log(this.numFaces);
            var vid1 = this.fBuffer[3*i];
            var vid2 = this.fBuffer[3*i+1];
            var vid3 = this.fBuffer[3*i+2];
            
            var v1 = glMatrix.vec3.create();
            var v2 = glMatrix.vec3.create();
            var v3 = glMatrix.vec3.create();
            var N = glMatrix.vec3.create();
            
            v1[0] = this.vBuffer[3*vid1];
            v1[1] = this.vBuffer[3*vid1+1];
            v1[2] = this.vBuffer[3*vid1+2];
            v2[0] = this.vBuffer[3*vid2];
            v2[1] = this.vBuffer[3*vid2+1];
            v2[2] = this.vBuffer[3*vid2+2];
            v3[0] = this.vBuffer[3*vid3];
            v3[1] = this.vBuffer[3*vid3+1];
            v3[2] = this.vBuffer[3*vid3+2];
            
            glMatrix.vec3.sub(v2, v2, v1);
            glMatrix.vec3.sub(v3, v3, v1);
            glMatrix.vec3.cross(N, v2, v3);
            
//            console.log(N);
            this.nBuffer[3*vid1] += N[0];
            this.nBuffer[3*vid1+1] += N[1];
            this.nBuffer[3*vid1+2] += N[2];
            this.nBuffer[3*vid2] += N[0];
            this.nBuffer[3*vid2+1] += N[1];
            this.nBuffer[3*vid2+2] += N[2];
            this.nBuffer[3*vid3] += N[0];
            this.nBuffer[3*vid3+1] += N[1];
            this.nBuffer[3*vid3+2] += N[2];
        }
        
        for(var i=0; i<this.numVertices; i++){
            var N = glMatrix.vec3.create();
            N[0] = this.nBuffer[3*i];
            N[1] = this.nBuffer[3*i+1];
            N[2] = this.nBuffer[3*i+2];
            
            glMatrix.vec3.normalize(N,N);
            
            this.nBuffer[3*i] = N[0];
            this.nBuffer[3*i+1] = N[1];
            this.nBuffer[3*i+2] = N[2];
        }
    }
    
    
/**
 * Fill the vertex and  triangle arrays 
 */    
generateTriangles()
{
    //Your code here
    var deltaX = (this.maxX-this.minX)/this.div;
    var deltaY = (this.maxY-this.minY)/this.div;
    
    for(var i=0; i<=this.div; i++){
        for (var j=0; j<=this.div; j++){
            var bx = this.minX+deltaX*j;
            var by = this.minY+deltaY*i;
            var bz = 0; 
            this.vBuffer.push(bx);
            this.vBuffer.push(by);
            this.vBuffer.push(bz);

            this.nBuffer.push(0);
            this.nBuffer.push(0);
            this.nBuffer.push(0);
        }
    }
    
    for(var i=0; i<this.div; i++){
        for (var j=0; j<this.div; j++){
            var vid = i*(this.div+1)+j;
            this.fBuffer.push(vid);
            this.fBuffer.push(vid+1);
            this.fBuffer.push(vid+this.div+1);
            
            this.fBuffer.push(vid+1);
            this.fBuffer.push(vid+1+this.div+1);
            this.fBuffer.push(vid+this.div+1);
        }
    }

    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
    
    var iteration = 100
    for(var k = 0; k<iteration; k++){
        
        var P = glMatrix.vec3.create();
        var n = glMatrix.vec3.create();
        
        // randome point p
        var Px = Math.random() * (this.maxX-this.minX)+this.minX;
        var Py = Math.random() * (this.maxY-this.minY)+this.minY;
        glMatrix.vec3.set(P,Px,Py,0);
        //random unit vector
        var angle = Math.random()*Math.PI*2;
        var nx = Math.cos(angle);
        var ny = Math.sin(angle);
        glMatrix.vec3.set(n,nx,ny,0);
        
        var z_amount = 0.005;  

        for(var i=0; i<=this.div; i++){
            for (var j=0; j<=this.div; j++){
                var v_past = glMatrix.vec3.create();
                this.getVertex(v_past, i, j);
                var bx = this.minX+deltaX*j;
                var by = this.minY+deltaY*i;
                var bz = v_past[2];
                
                var bp = glMatrix.vec3.create();
                glMatrix.vec3.sub(bp,v_past,P);

                var result = glMatrix.vec3.dot(bp, n);

                if (result>0){
                    bz += z_amount;
                }
                else {
                    bz -= z_amount;
                }
                var v = [bx,by,bz];
                this.setVertex(v, i, j);
            }
        }
    }
    this.perVertexNormal();
//    console.log(this.nBuffer);

}

/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }
    
}

/**
 * Get lowest and highest z coordinates of vertices.
 */
getMinMaxHeight()
{
    var min = 1000;
    var max = -1000;
    for (var i = 0; i < this.numVertices; i++) {
        var height = this.vBuffer[3*i+2];
        if (height < min) {min = height;}
        if (height > max) {max = height;}
    }
    return [min, max];
}
    
}


