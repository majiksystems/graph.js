import {any} from './helpers.es6.js';
import JsGraph from '../src/js-graph.es6.js';


describe("instance", function () {

	var graph;
	beforeEach(function () {
		graph = new JsGraph();
	});


	it("initially has no vertices", function () {
		expect(graph.vertexCount()).toBe(0);
		for (let vertex of graph.vertices()) { expect().not.toBeReachable() }
		expect().toBeReachable();
	});


	it("initially has no edges", function () {
		expect(graph.edgeCount()).toBe(0);
		for (let vertex of graph.edges()) { expect().not.toBeReachable() }
		expect().toBeReachable();
	});

});
