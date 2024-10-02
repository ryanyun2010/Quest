'use strict';

export class Position {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	getVert(): number[] {
		return [(this.x / 3840) * 2, (this.y / 2160) * 2, 1, 1];
	}

	add(p: Position): Position {
		return new Position(this.x + p.x, this.y + p.y);
	}
	inverse(): Position {
		return new Position(this.x * -1, this.y * -1);
	}
}

export class Color {
	r: number;
	g: number;
	b: number;
	a: number;
	constructor(r: number, g: number, b: number, a: number) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	getColor(): number[] {
		return [this.r / 255, this.g / 255, this.b / 255, this.a / 255];
	}
}

export class PTriangle {
	vert1: Vert;
	vert2: Vert;
	vert3: Vert;
	vertList: VertList;
	constructor(vert1: Position, vert2: Position, vert3: Position, color: Color) {
		this.vert1 = new Vert(vert1, color);
		this.vert2 = new Vert(vert2, color);
		this.vert3 = new Vert(vert3, color);
		this.vertList = new VertList().concat(this.vert1).concat(this.vert2).concat(this.vert3);
	}
	getVert(): VertList {
		return this.vertList;
	}
}

export class PQuad {
	vert1: Position; // bl
	vert2: Position; // tl
	vert3: Position; // tr
	vert4: Position; // br
	color: Color;
	constructor(vert1: Position, vert2: Position, vert3: Position, vert4: Position, color: Color) {
		this.vert1 = vert1;
		this.vert2 = vert2;
		this.vert3 = vert3;
		this.vert4 = vert4;
		this.color = color;
	}

	getTriangles(): PTriangle[] {
		return [
			new PTriangle(this.vert1, this.vert2, this.vert3, this.color),
			new PTriangle(this.vert1, this.vert3, this.vert4, this.color),
		];
	}

	getVert(): VertList {
		let triangles = this.getTriangles();
		return triangles[0].getVert().concat(triangles[1].getVert());
	}
}

export class PRect {
	vert: Position;
	w: number;
	h: number;
	color: Color;
	constructor(vert: Position, w: number, h: number, color: Color) {
		this.vert = vert;
		this.w = w;
		this.h = h;
		this.color = color;
	}

	getPositions(): Position[] {
		return [
			this.vert.add(new Position(0, -1 * this.h)),
			this.vert,
			this.vert.add(new Position(this.w, 0)),
			this.vert.add(new Position(this.w, -1 * this.h)),
		];
	}
	getTriangles(): PTriangle[] {
		let verts = this.getPositions();
		return [
			new PTriangle(verts[0], verts[1], verts[2], this.color),
			new PTriangle(verts[0], verts[2], verts[3], this.color),
		];
	}
	getVert(): VertList {
		let triangles = this.getTriangles();
		return triangles[0].getVert().concat(triangles[1].getVert());
	}
}

export class Vert {
	pos: Position;
	col: Color;
	constructor(pos: Position, col: Color) {
		this.pos = pos;
		this.col = col;
	}
	getRaw(): number[] {
		return [...this.pos.getVert(), ...this.col.getColor()];
	}
	concat(v: Vert | VertList): VertList {
		return new VertList().concat(this).concat(v);
	}
	offset(offset: Position): Vert {
		return new Vert(this.pos.add(offset), this.col);
	}
}

export class VertList {
	verts: Vert[];
	length: number;
	constructor() {
		this.verts = [];
		this.length = 0;
	}
	concat(v: Vert | VertList): VertList {
		if (v instanceof Vert) {
			this.verts.push(v);
			this.length++;
		} else {
			for (let vert of v.verts) {
				this.verts.push(vert);
				this.length++;
			}
		}
		return this;
	}
	getRaw(): number[] {
		let out: number[] = [];
		for (var vert of this.verts) {
			out.push(...vert.getRaw());
		}
		return out;
	}
	offset(offset: Position): VertList {
		let out = new VertList();
		for (var vert of this.verts) {
			out.concat(vert.offset(offset));
		}
		return out;
	}
}
