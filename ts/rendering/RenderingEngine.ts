'use strict';
import { Position, Color, PRect as Rect } from './RenderingHelpers.js';
const SHADER = `
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
`;

export class RenderingEngine {
	adapter: GPUAdapter | null = null;
	device: GPUDevice | null = null;
	shader: string;
	shaderModule: GPUShaderModule | null = null;
	canvas: HTMLCanvasElement | null = null;
	context: GPUCanvasContext | null = null;
	vertexBufferLayout: GPUVertexBufferLayout[] | null = null;
	pipelineDescriptor: GPURenderPipelineDescriptor | null = null;
	renderPipeline: GPURenderPipeline | null = null;
	commandEncoder: GPUCommandEncoder | null = null;
	renderPassDescriptor: GPURenderPassDescriptor | null = null;
	backgroundColor: GPUColor | undefined;
	vertices: number[] | null = null;
	gameObjects: GameObject[];

	constructor() {
		this.shader = SHADER;
		this.backgroundColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
		// this.vertices = null;
		this.gameObjects = [
			new GameObject(
				new Rect(
					new Position(Math.random() * 2000 - 1000, Math.random() * 1500 - 750),
					Math.random() * 600 - 500,
					Math.random() * 600 - 500,
					new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255),
				),
			),
		];
	}

	async setup(): Promise<void> {
		await this.initWebGPU();
		await this.setupShaderModule();
		await this.setupContext();
		await this.setupVertexBuffers();
		this.setupPipeline();
	}

	async getVertices(cameraPos: Position, FOVWidth: number, FOVHeight: number): Promise<number[]> {
		const vert: number[] = [];
		for (const gameObject of this.gameObjects) {
			vert.push(...gameObject.sprite.getVert().offset(cameraPos.inverse()).getRaw());
		}
		return vert;
	}

	async render(cameraPos: Position, FOVWidth: number, FOVHeight: number): Promise<void> {
		this.gameObjects.push(
			new GameObject(
				new Rect(
					new Position(Math.random() * 2000 - 1000, Math.random() * 1500 - 750),
					300,
					300,
					new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255),
				),
			),
		);
		console.log(this.gameObjects.length);
		if (this.device == null) {
			throw new Error('Device not initialized, try calling initWebGPU() first');
		}
		const vert2 = new Float32Array(await this.getVertices(cameraPos, FOVWidth, FOVHeight));
		const vertexb: GPUBuffer = this.device.createBuffer({
			size: vert2.byteLength, // make it big enough to store vertices in
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this.device.queue.writeBuffer(vertexb, 0, vert2, 0, vert2.length);
		this.renderPass(vertexb);
	}

	async renderPass(vertexBuffer: GPUBuffer): Promise<void> {
		if (this.device == null) {
			throw new Error('Device not initialized, try calling initWebGPU() first');
		}
		if (this.renderPipeline == null) {
			throw new Error('Render Pipeline not initialized, try calling setupPipeline() first');
		}
		if (this.context == null) {
			throw new Error('WebGPU Context not initialized, try calling setupContext() first');
		}

		this.commandEncoder = this.device.createCommandEncoder();
		this.renderPassDescriptor = {
			colorAttachments: [
				{
					clearValue: this.backgroundColor,
					loadOp: 'clear',
					storeOp: 'store',
					view: this.context.getCurrentTexture().createView(),
				},
			],
		};
		let passEncoder: GPURenderPassEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
		passEncoder.setPipeline(this.renderPipeline);
		passEncoder.setVertexBuffer(0, vertexBuffer);
		passEncoder.draw(vertexBuffer.size / 32, 1, 0, 0);
		passEncoder.end();
		this.device.queue.submit([this.commandEncoder.finish()]);
	}

	async initWebGPU(): Promise<void> {
		if (!navigator.gpu) {
			throw new Error('WebGPU not supported.');
		}

		this.adapter = await navigator.gpu.requestAdapter();

		if (!this.adapter) {
			throw Error("No adapter found or couldn't request WebGPU adapter. ");
		}

		this.device = await this.adapter.requestDevice();
	}

	async setupShaderModule(): Promise<void> {
		if (this.device == null) {
			throw new Error('Device not initialized.');
		}
		this.shaderModule = this.device.createShaderModule({
			code: this.shader,
		});
	}

	async setupContext(): Promise<void> {
		this.canvas = document.querySelector('#gpuCanvas');
		if (this.canvas == null) {
			throw new Error("Couldn't find canvas, do you have a #gpuCanvas in your HTML?");
		}
		this.context = this.canvas.getContext('webgpu');
		if (this.context == null) {
			throw new Error("Couldn't initialize WebGPU Context");
		}
		if (this.device == null) {
			throw new Error('Device not initialized, try calling setupContext() first');
		}
		this.context.configure({
			device: this.device,
			format: navigator.gpu.getPreferredCanvasFormat(),
			alphaMode: 'premultiplied',
		});
	}

	async setupVertexBuffers(): Promise<void> {
		this.vertexBufferLayout = [
			{
				attributes: [
					{
						shaderLocation: 0, // position
						offset: 0,
						format: 'float32x4',
					},
					{
						shaderLocation: 1, // color
						offset: 16,
						format: 'float32x4',
					},
				],
				arrayStride: 32,
				stepMode: 'vertex',
			},
		];
	}

	async setupPipeline(): Promise<void> {
		if (this.shaderModule == null) {
			throw new Error('Shader Module not initialized, try calling setupShaderModule() first');
		}
		if (this.vertexBufferLayout == null) {
			throw new Error('Vertex Buffer layout not initialized, try calling setupVertexBuffers() first');
		}
		if (this.device == null) {
			throw new Error('Device not initialized, try calling initWebGPU() first');
		}
		this.pipelineDescriptor = {
			vertex: {
				module: this.shaderModule,
				entryPoint: 'vertex_main',
				buffers: this.vertexBufferLayout,
			},
			fragment: {
				module: this.shaderModule,
				entryPoint: 'fragment_main',
				targets: [
					{
						format: navigator.gpu.getPreferredCanvasFormat(),
					},
				],
			},
			primitive: {
				topology: 'triangle-list',
			},
			layout: 'auto',
		};
		this.renderPipeline = this.device.createRenderPipeline(this.pipelineDescriptor);
	}
}

export class Camera {
	position: Position;
	FOVWidth: number;
	FOVHeight: number;
	renderingEngine: RenderingEngine;
	constructor(position: Position, FOVWidth: number, FOVHeight: number, renderingEngine: RenderingEngine) {
		this.position = position;
		this.FOVHeight = FOVHeight;
		this.FOVWidth = FOVWidth;
		this.renderingEngine = renderingEngine;
	}
	async setup() {
		this.renderingEngine.setup();
	}
	async render() {
		this.renderingEngine.render(this.position, this.FOVWidth, this.FOVHeight);
	}
}

export class GameObject {
	sprite: any;
	constructor(sprite: any) {
		this.sprite = sprite;
	}

	collisionBox(): number[] {
		return [...this.sprite.getPositions()];
	}
}
