'use strict';
export class Position {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getVert() {
        return [this.x / 3840 * 2, this.y / 2160 * 2, 1, 1];
    }
    add(p) {
        return new Position(this.x + p.x, this.y + p.y);
    }
    inverse() {
        return new Position(this.x * -1, this.y * -1);
    }
}
export class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    getColor() {
        return [this.r / 255, this.g / 255, this.b / 255, this.a / 255];
    }
}
export class PTriangle {
    vert1;
    vert2;
    vert3;
    vertList;
    constructor(vert1, vert2, vert3, color) {
        this.vert1 = new Vert(vert1, color);
        this.vert2 = new Vert(vert2, color);
        this.vert3 = new Vert(vert3, color);
        this.vertList = new VertList().concat(this.vert1).concat(this.vert2).concat(this.vert3);
    }
    getVert() {
        return this.vertList;
    }
}
export class PQuad {
    vert1; // bl
    vert2; // tl
    vert3; // tr
    vert4; // br
    color;
    constructor(vert1, vert2, vert3, vert4, color) {
        this.vert1 = vert1;
        this.vert2 = vert2;
        this.vert3 = vert3;
        this.vert4 = vert4;
        this.color = color;
    }
    getTriangles() {
        return [new PTriangle(this.vert1, this.vert2, this.vert3, this.color), new PTriangle(this.vert1, this.vert3, this.vert4, this.color)];
    }
    getVert() {
        let triangles = this.getTriangles();
        return triangles[0].getVert().concat(triangles[1].getVert());
    }
}
export class PRect {
    vert;
    w;
    h;
    color;
    constructor(vert, w, h, color) {
        this.vert = vert;
        this.w = w;
        this.h = h;
        this.color = color;
    }
    getPositions() {
        return [this.vert.add(new Position(0, -1 * this.h)), this.vert, this.vert.add(new Position(this.w, 0)), this.vert.add(new Position(this.w, -1 * this.h))];
    }
    getTriangles() {
        let verts = this.getPositions();
        return [new PTriangle(verts[0], verts[1], verts[2], this.color), new PTriangle(verts[0], verts[2], verts[3], this.color)];
    }
    getVert() {
        let triangles = this.getTriangles();
        return triangles[0].getVert().concat(triangles[1].getVert());
    }
}
export class Vert {
    pos;
    col;
    constructor(pos, col) {
        this.pos = pos;
        this.col = col;
    }
    getRaw() {
        return [...this.pos.getVert(), ...this.col.getColor()];
    }
    concat(v) {
        return new VertList().concat(this).concat(v);
    }
    offset(offset) {
        return new Vert(this.pos.add(offset), this.col);
    }
}
export class VertList {
    verts;
    length;
    constructor() {
        this.verts = [];
        this.length = 0;
    }
    concat(v) {
        if (v instanceof Vert) {
            this.verts.push(v);
            this.length++;
        }
        else {
            for (let vert of v.verts) {
                this.verts.push(vert);
                this.length++;
            }
        }
        return this;
    }
    getRaw() {
        let out = [];
        for (var vert of this.verts) {
            out = [...out, ...vert.getRaw()];
        }
        return out;
    }
    offset(offset) {
        let out = new VertList();
        for (var vert of this.verts) {
            out.concat(vert.offset(offset));
        }
        return out;
    }
}
