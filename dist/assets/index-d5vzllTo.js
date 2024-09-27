var w=Object.defineProperty;var m=(o,e,r)=>e in o?w(o,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[e]=r;var t=(o,e,r)=>m(o,typeof e!="symbol"?e+"":e,r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const u of n.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&s(u)}).observe(document,{childList:!0,subtree:!0});function r(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=r(i);fetch(i.href,n)}})();class a{constructor(e,r){t(this,"x");t(this,"y");this.x=e,this.y=r}getVert(){return[this.x/3840*2,this.y/2160*2,1,1]}add(e){return new a(this.x+e.x,this.y+e.y)}inverse(){return new a(this.x*-1,this.y*-1)}}class d{constructor(e,r,s,i){t(this,"r");t(this,"g");t(this,"b");t(this,"a");this.r=e,this.g=r,this.b=s,this.a=i}getColor(){return[this.r/255,this.g/255,this.b/255,this.a/255]}}class p{constructor(e,r,s,i){t(this,"vert1");t(this,"vert2");t(this,"vert3");t(this,"vertList");this.vert1=new c(e,i),this.vert2=new c(r,i),this.vert3=new c(s,i),this.vertList=new h().concat(this.vert1).concat(this.vert2).concat(this.vert3)}getVert(){return this.vertList}}class f{constructor(e,r,s,i){t(this,"vert");t(this,"w");t(this,"h");t(this,"color");this.vert=e,this.w=r,this.h=s,this.color=i}getPositions(){return[this.vert.add(new a(0,-1*this.h)),this.vert,this.vert.add(new a(this.w,0)),this.vert.add(new a(this.w,-1*this.h))]}getTriangles(){let e=this.getPositions();return[new p(e[0],e[1],e[2],this.color),new p(e[0],e[2],e[3],this.color)]}getVert(){let e=this.getTriangles();return e[0].getVert().concat(e[1].getVert())}}class c{constructor(e,r){t(this,"pos");t(this,"col");this.pos=e,this.col=r}getRaw(){return[...this.pos.getVert(),...this.col.getColor()]}concat(e){return new h().concat(this).concat(e)}offset(e){return new c(this.pos.add(e),this.col)}}class h{constructor(){t(this,"verts");t(this,"length");this.verts=[],this.length=0}concat(e){if(e instanceof c)this.verts.push(e),this.length++;else for(let r of e.verts)this.verts.push(r),this.length++;return this}getRaw(){let e=[];for(var r of this.verts)e=[...e,...r.getRaw()];return e}offset(e){let r=new h;for(var s of this.verts)r.concat(s.offset(e));return r}}const y=`
    struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) color : vec4f
    }

    @vertex
    fn vertex_main(@location(0) position: vec4f,
                @location(1) color: vec4f) -> VertexOut
    {
    var output : VertexOut;
    output.position = position;
    output.color = color;
    return output;
    }

    @fragment
    fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
    {
    return fragData.color;
    }
    `;let x=new h;setInterval(function(){x.concat(new f(new a(Math.random()*2e3-1e3,Math.random()*1500-750),300,300,new d(Math.random()*255,Math.random()*255,Math.random()*255,255)).getVert())},1);class P{constructor(){t(this,"adapter");t(this,"device");t(this,"shader");t(this,"shaderModule");t(this,"canvas");t(this,"context");t(this,"vertexBufferLayout");t(this,"pipelineDescriptor");t(this,"renderPipeline");t(this,"commandEncoder");t(this,"renderPassDescriptor");t(this,"backgroundColor");t(this,"vertices");t(this,"gameObjects");this.shader=y,this.backgroundColor={r:0,g:.5,b:1,a:1},this.vertices=null,this.gameObjects=[new g(new f(new a(Math.random()*2e3-1e3,Math.random()*1500-750),300,300,new d(Math.random()*255,Math.random()*255,Math.random()*255,255)))],this.adapter=null,this.device=null,this.shaderModule=null,this.canvas=null,this.context=null,this.vertexBufferLayout=null,this.pipelineDescriptor=null,this.renderPipeline=null,this.commandEncoder=null,this.renderPassDescriptor=null}async setup(){await this.initWebGPU(),await this.setupShaderModule(),await this.setupContext(),await this.setupVertexBuffers(),this.setupPipeline()}async getVertices(e,r,s){let i=new h;for(var n of this.gameObjects)i.concat(n.sprite.getVert().offset(e.inverse()));return i}async render(e,r,s){if(this.gameObjects.push(new g(new f(new a(Math.random()*2e3-1e3,Math.random()*1500-750),300,300,new d(Math.random()*255,Math.random()*255,Math.random()*255,255)))),this.device==null)throw new Error("Device not initialized, try calling initWebGPU() first");let i=new Float32Array((await this.getVertices(e,r,s)).getRaw());const n=this.device.createBuffer({size:i.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});this.device.queue.writeBuffer(n,0,i,0,i.length),this.renderPass(n)}async renderPass(e){if(this.device==null)throw new Error("Device not initialized, try calling initWebGPU() first");if(this.renderPipeline==null)throw new Error("Render Pipeline not initialized, try calling setupPipeline() first");if(this.context==null)throw new Error("WebGPU Context not initialized, try calling setupContext() first");this.commandEncoder=this.device.createCommandEncoder(),this.renderPassDescriptor={colorAttachments:[{clearValue:this.backgroundColor,loadOp:"clear",storeOp:"store",view:this.context.getCurrentTexture().createView()}]};let r=this.commandEncoder.beginRenderPass(this.renderPassDescriptor);r.setPipeline(this.renderPipeline),r.setVertexBuffer(0,e),r.draw(e.size/32,1,0,0),r.end(),this.device.queue.submit([this.commandEncoder.finish()])}async initWebGPU(){if(!navigator.gpu)throw new Error("WebGPU not supported.");if(this.adapter=await navigator.gpu.requestAdapter(),!this.adapter)throw Error("No adapter found or couldn't request WebGPU adapter. ");this.device=await this.adapter.requestDevice()}async setupShaderModule(){if(this.device==null)throw new Error("Device not initialized.");this.shaderModule=this.device.createShaderModule({code:this.shader})}async setupContext(){if(this.canvas=document.querySelector("#gpuCanvas"),this.canvas==null)throw new Error("Couldn't find canvas, do you have a #gpuCanvas in your HTML?");if(this.context=this.canvas.getContext("webgpu"),this.context==null)throw new Error("Couldn't initialize WebGPU Context");if(this.device==null)throw new Error("Device not initialized, try calling setupContext() first");this.context.configure({device:this.device,format:navigator.gpu.getPreferredCanvasFormat(),alphaMode:"premultiplied"})}async setupVertexBuffers(){this.vertexBufferLayout=[{attributes:[{shaderLocation:0,offset:0,format:"float32x4"},{shaderLocation:1,offset:16,format:"float32x4"}],arrayStride:32,stepMode:"vertex"}]}async setupPipeline(){if(this.shaderModule==null)throw new Error("Shader Module not initialized, try calling setupShaderModule() first");if(this.vertexBufferLayout==null)throw new Error("Vertex Buffer layout not initialized, try calling setupVertexBuffers() first");if(this.device==null)throw new Error("Device not initialized, try calling initWebGPU() first");this.pipelineDescriptor={vertex:{module:this.shaderModule,entryPoint:"vertex_main",buffers:this.vertexBufferLayout},fragment:{module:this.shaderModule,entryPoint:"fragment_main",targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]},primitive:{topology:"triangle-list"},layout:"auto"},this.renderPipeline=this.device.createRenderPipeline(this.pipelineDescriptor)}async setCamera(e){}}class b{constructor(e,r,s,i){t(this,"position");t(this,"FOVWidth");t(this,"FOVHeight");t(this,"renderingEngine");this.position=e,this.FOVHeight=s,this.FOVWidth=r,this.renderingEngine=i}async setup(){this.renderingEngine.setup()}async render(){this.renderingEngine.render(this.position,this.FOVWidth,this.FOVHeight)}}class g{constructor(e){t(this,"sprite");this.sprite=e}}let v=new P,l=new b(new a(-50,0),3840,2160,v);l.setup().then(()=>{});setInterval(function(){console.log(v.gameObjects.length),console.timeEnd("e"),l.position.x+=5,l.position.y+=.5,l.render(),console.time("e")},1e3/60);
