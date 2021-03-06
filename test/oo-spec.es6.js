import {any, createSpy, set, describeClass} from './helpers.es6.js';
import Graph                                from '../src/graph.es6.js';
import addGraphOO                           from '../src/addGraphOO.es6.js';
import specs                                from './spec-template.es6.js';

let GraphOO = addGraphOO(Graph);




/* loosen the equality tester for arrays to allow Edge and Vertex instances as well */
const isArrayLike = (o) => (
	Array.isArray(o) ||
	o && o.constructor && (o.constructor.name === 'Vertex' || o.constructor.name === 'Edge')
);
beforeEach(() => {
	jasmine.addCustomEqualityTester(function setEquals(a, b) {
		if (isArrayLike(a) && isArrayLike(b)) {
			if (a.length !== b.length) { return false }
			for (let i = 0; i < a.length; ++i) {
				if (!jasmine.matchersUtil.equals(a[i], b[i], this)) {
					return false;
				}
			}
			return true;
		}
	});
});



/* perform the 'Graph' tests also on GraphOO, since GraphOO is a behavioral subtype */
specs(GraphOO, () => {

	describeClass("graph.Vertex", 'vertex', () => graph.vertex('k3'), () => {

		it("is present", () => {
			expect(graph.Vertex).toEqual(any(Function));
		});

		it("never throws any exception", () => {
			expect(() => new graph.Vertex()).not.toThrow();
		});

		it("creates a new object of type graph.Vertex", () => {
			expect(new graph.Vertex()).toEqual(any(graph.Vertex));
		});

		it("is a different type for each graph", () => {
			let other = new GraphOO();
			expect(graph.Vertex).not.toEqual(other.Vertex);
		});


		describe("instance", () => {
			beforeEach(() => { graph.setVertex('k3', "newK3Value") });

			it("knows its own key and value", () => {
				expect(vertex.key  ).toEqual('k3');
				expect(vertex.value).toEqual("newK3Value");
			});

			it("knows its graph", () => {
				expect(vertex.graph).toEqual(graph);
			});

			it("can (almost) stand in for the [key, value] vertex representation", () => {
				expect(vertex.length).toEqual(2);
				expect(vertex[0]).toEqual('k3');
				expect(vertex[1]).toEqual("newK3Value");
				let [key, value] = vertex;
				expect(key).toEqual('k3');
				expect(value).toEqual("newK3Value");
				// expect(vertex).toBe(any(Array));            // nope
				// expect(Array.isArray(vertex)).toBeTruthy(); // nope
			});

			it("can have a custom superclass given through a graph option", () => {
				class VertexSuper {  get foo() { return "bar" }  }
				graph = new GraphOO(['n1'], { VertexSuperclass: VertexSuper });
				vertex = graph.vertex('n1');
				expect(vertex).toEqual(any(VertexSuper));
				expect(vertex.foo).toEqual("bar");
			});

			it("can have a custom superclass initialized with custom arguments", () => {
				class VertexSuper {
					constructor(keyVal) { this._keyVal = keyVal }
					keyVal() { return `(${this._keyVal})` }
				}
				graph = new GraphOO(['n1', "n1Value"], {
					VertexSuperclass: VertexSuper,
					vertexSuperArguments(key, value) { return [`${key}:${value}`]; }
				});
				vertex = graph.vertex('n1');
				expect(vertex.keyVal()).toEqual("(n1:n1Value)");
			});
		});


		describe("new instance", () => {
			it("gets registered in its graph", () => {
				let n1 = new graph.Vertex('n1', "newValue");
				expect(graph.hasVertex  ('n1')).toBeTruthy();
				expect(graph.vertex     ('n1')).toBe(n1);
				expect(graph.vertexValue('n1')).toEqual("newValue");
			});
		});


		describe("existing instance from a graph", () => {
			it("can be used to set its own value", () => {
				vertex.set(42);
				expect(vertex.value).toEqual(42);
				expect(graph.vertexValue('k3')).toEqual(42);
				vertex.value = 43;
				expect(vertex.value).toEqual(43);
				expect(graph.vertexValue('k3')).toEqual(43);
			});
		});


		let k1, k2, k3, k4, k5;
		beforeEach(() => {
			k1 = graph.vertex('k1');
			k2 = graph.vertex('k2');
			k3 = graph.vertex('k3');
			k4 = graph.vertex('k4');
			k5 = graph.vertex('k5');
		});


		describeMethod('remove', () => {
			it("removes this vertex if there are no edges connected to it", () => {
				vertex = k1;
				callItWith();
				expect(graph.hasVertex('k1')).toBeFalsy();
			});
			it("throws an error if there are edges connected to this vertex", () => {
				expectItWhenBoundWith().toThrowSpecific(GraphOO.EdgeExistsError, {
					edges: set(
						[['k2', 'k3'], "oldValue23"],
						[['k5', 'k3'],  undefined  ],
						[['k3', 'k4'],  undefined  ]
					)
				});
			});
		});

		
		describeMethod('destroy', () => {
			it("removes this vertex and all edges connected to it", () => {
				callItWith();
				expect(graph.hasVertex('k3')).toBeFalsy();
				expect(graph.hasEdge('k2', 'k3')).toBeFalsy();
				expect(graph.hasEdge('k5', 'k3')).toBeFalsy();
				expect(graph.hasEdge('k3', 'k4')).toBeFalsy();
			});
		});

		
		describeMethod('verticesFrom', () => {
			beforeEach(() => { vertex = k2 });
			it("iterates over each outgoing edge, providing the connected vertex", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k3':  undefined,
					'k5': "oldValue5"
				});
			});
			it("iterates over each outgoing edge, providing the connected vertex (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let key   = kv.value[0],
						value = kv.value[1];
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k3':  undefined,
					'k5': "oldValue5"
				});
			});
		});
		
		
		describeMethod('verticesTo', () => {
			it("iterates over each incoming edge, providing the connected vertex", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2':  undefined,
					'k5': 'oldValue5'
				});
			});

			it("iterates over each incoming edge, providing the connected vertex (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let key       = kv.value[0],
						value     = kv.value[1];
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2':  undefined,
					'k5': 'oldValue5'
				});
			});
		});

		
		describeMethod('edgesFrom', () => {
			beforeEach(() => { vertex = k2 });
			it("iterates over each outgoing edge, providing the connected vertex key/value and edge value", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2,k3': "oldValue23",
					'k2,k5':  undefined
				});
			});
			it("iterates over each outgoing edge, providing the connected vertex key/value and edge value (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let from  = kv.value[0][0],
						to    = kv.value[0][1],
						value = kv.value[1];
					expect(valuesFound[`${from},${to}`]).toBeUndefined();
					valuesFound[`${from},${to}`] = value;
				}
				expect(valuesFound).toEqual({
					'k2,k3': "oldValue23",
					'k2,k5':  undefined
				});
			});
		});
		

		describeMethod('edgesTo', () => {
			it("iterates over each incoming edge, providing the connected vertex key/value and edge value", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2,k3': "oldValue23",
					'k5,k3':  undefined
				});
			});
			it("iterates over each incoming edge, providing the connected vertex key/value and edge value (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let from  = kv.value[0][0],
						to    = kv.value[0][1],
						value = kv.value[1];
					expect(valuesFound[`${from},${to}`]).toBeUndefined();
					valuesFound[`${from},${to}`] = value;
				}
				expect(valuesFound).toEqual({
					'k2,k3': "oldValue23",
					'k5,k3':  undefined
				});
			});
		});

		
		describeMethod('verticesWithPathFrom', () => {
			beforeEach(() => { vertex = k2 });
			it("iterates once over each vertex that is reachable from this vertex, in no particular order", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k3':  undefined,
					'k5': "oldValue5",
					'k4':  undefined
				});
			});
			it("iterates once over each vertex that is reachable from this vertex, in no particular order (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let key   = kv.value[0],
						value = kv.value[1];
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k3':  undefined,
					'k5': "oldValue5",
					'k4':  undefined
				});
			});
		});
		

		describeMethod('verticesWithPathTo', () => {
			beforeEach(() => { vertex = k4 });
			it("iterates once over each vertex that has a path to reach this vertex, in no particular order", () => {
				let valuesFound = {};
				for (let [key, value] of callItWith()) {
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2': undefined,
					'k3': undefined,
					'k5': "oldValue5"
				});
			});
			it("iterates once over each vertex that has a path to reach this vertex, in no particular order (ES5 style)", () => {
				let valuesFound = {};
				for (let it = callItWith(), kv; !(kv = it.next()).done;) {
					let key   = kv.value[0],
						value = kv.value[1];
					expect(valuesFound[key]).toBeUndefined();
					valuesFound[key] = value;
				}
				expect(valuesFound).toEqual({
					'k2': undefined,
					'k3': undefined,
					'k5': "oldValue5"
				});
			});
		});

		
		describeMethod('pathTo', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expectItWhenCalledWith('k1').toBeNull();
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expectItWhenCalledWith('k3').toBeNull();
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expectItWhenCalledWith('k2').toBeNull();
				expectItWhenCalledWith('k5').toBeNull();
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expectItWhenCalledWith('k4').toEqual(['k3', 'k4']);
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k5;
				expectItWhenCalledWith('k4').toEqual(['k5', 'k3', 'k4']);
				vertex = k2;
				expectItWhenCalledWith('k4').toEqualOneOf( ['k2', 'k3', 'k4'], ['k2', 'k5', 'k3', 'k4'] );
				graph.addNewEdge('k4', 'k1');
				expectItWhenCalledWith('k1').toEqualOneOf( ['k2', 'k3', 'k4', 'k1'], ['k2', 'k5', 'k3', 'k4', 'k1'] );
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expectItWhenCalledWith('k3').toEqual(['k3', 'k3']);
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expectItWhenCalledWith('k3').toEqual(['k3', 'k4', 'k3']);
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expectItWhenCalledWith('k3').toEqualOneOf( ['k3', 'k4', 'k1', 'k2', 'k3'], ['k3', 'k4', 'k1', 'k2', 'k5', 'k3'] );
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n1');
				expectItWhenCalledWith('n5').toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
			});
		});

		
		describeMethod('pathFrom', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expectItWhenCalledWith('k1').toBeNull();
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expectItWhenCalledWith('k3').toBeNull();
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expectItWhenCalledWith('k4').toBeNull();
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expectItWhenCalledWith('k2').toEqualOneOf( ['k2', 'k3'], ['k2', 'k5', 'k3'] );
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k4;
				expectItWhenCalledWith('k2').toEqualOneOf( ['k2', 'k3', 'k4'], ['k2', 'k5', 'k3', 'k4'] );
				vertex = k1;
				graph.addNewEdge('k4', 'k1');
				expectItWhenCalledWith('k2').toEqualOneOf( ['k2', 'k3', 'k4', 'k1'], ['k2', 'k5', 'k3', 'k4', 'k1'] );
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expectItWhenCalledWith('k3').toEqual(['k3', 'k3']);
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expectItWhenCalledWith('k3').toEqual(['k3', 'k4', 'k3']);
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expectItWhenCalledWith('k3').toEqualOneOf( ['k3', 'k4', 'k1', 'k2', 'k3'], ['k3', 'k4', 'k1', 'k2', 'k5', 'k3'] );
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n5');
				expectItWhenCalledWith('n1').toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
			});
		});

		
		describeMethod('hasPathTo', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expectItWhenCalledWith('k1').toBeFalsy();
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expectItWhenCalledWith('k3').toBeFalsy();
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expectItWhenCalledWith('k2').toBeFalsy();
				expectItWhenCalledWith('k5').toBeFalsy();
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expectItWhenCalledWith('k4').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k5;
				expectItWhenCalledWith('k4').toBeTruthy();
				vertex = k2;
				expectItWhenCalledWith('k4').toBeTruthy();
				graph.addNewEdge('k4', 'k1');
				expectItWhenCalledWith('k1').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n1');
				expectItWhenCalledWith('n5').toBeTruthy();
			});
		});
		

		describeMethod('hasPathFrom', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expectItWhenCalledWith('k1').toBeFalsy();
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expectItWhenCalledWith('k3').toBeFalsy();
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expectItWhenCalledWith('k4').toBeFalsy();
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expectItWhenCalledWith('k2').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k4;
				expectItWhenCalledWith('k2').toBeTruthy();
				vertex = k1;
				graph.addNewEdge('k4', 'k1');
				expectItWhenCalledWith('k2').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expectItWhenCalledWith('k3').toBeTruthy();
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n5');
				expectItWhenCalledWith('n1').toBeTruthy();
			});
		});

		
		describeMethod('pathsTo', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expect(set( ...callItWith('k1'))).toEqual(set( ));
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expect(set( ...callItWith('k3'))).toEqual(set( ));
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expect(set( ...callItWith('k2'))).toEqual(set( ));
				expect(set( ...callItWith('k5'))).toEqual(set( ));
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expect(set( ...callItWith('k4'))).toEqual(set( ['k3', 'k4'] ));
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k5;
				expect(set( ...callItWith('k4'))).toEqual(set( ['k5', 'k3', 'k4'] ));
				vertex = k2;
				expect(set( ...callItWith('k4'))).toEqual(set( ['k2', 'k3', 'k4'], ['k2', 'k5', 'k3', 'k4'] ));
				graph.addNewEdge('k4', 'k1');
				expect(set( ...callItWith('k1'))).toEqual(set( ['k2', 'k3', 'k4', 'k1'], ['k2', 'k5', 'k3', 'k4', 'k1'] ));
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k4', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k4', 'k1', 'k2', 'k3'], ['k3', 'k4', 'k1', 'k2', 'k5', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n1');
				expect(set( ...callItWith('n5'))).toEqual(set( ['n1', 'n2', 'n3', 'n4', 'n5'] ));
			});
		});

		
		describeMethod('pathsFrom', () => {
			it("returns null if the path doesn't exist (simple)", () => {
				expect(set( ...callItWith('k1'))).toEqual(set( ));
			});
			it("returns null if the path doesn't exist (implicit self-loop)", () => {
				expect(set( ...callItWith('k3'))).toEqual(set( ));
			});
			it("returns null if the path doesn't exist (edge backwards)", () => {
				expect(set( ...callItWith('k4'))).toEqual(set( ));
			});
			it("returns a descriptive array if the path exists (single edge)", () => {
				expect(set( ...callItWith('k2'))).toEqual(set( ['k2', 'k3'], ['k2', 'k5', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (transitive)", () => {
				vertex = k4;
				expect(set( ...callItWith('k2'))).toEqual(set( ['k2', 'k3', 'k4'], ['k2', 'k5', 'k3', 'k4'] ));
				vertex = k1;
				graph.addNewEdge('k4', 'k1');
				expect(set( ...callItWith('k2'))).toEqual(set( ['k2', 'k3', 'k4', 'k1'], ['k2', 'k5', 'k3', 'k4', 'k1'] ));
			});
			it("returns a descriptive array if the path exists (reflexive cycle)", () => {
				graph.addNewEdge('k3', 'k3');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (symmetric cycle)", () => {
				graph.addNewEdge('k4', 'k3');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k4', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (larger cycle)", () => {
				graph.addNewEdge('k4', 'k1');
				graph.addNewEdge('k1', 'k2');
				expect(set( ...callItWith('k3'))).toEqual(set( ['k3', 'k4', 'k1', 'k2', 'k3'], ['k3', 'k4', 'k1', 'k2', 'k5', 'k3'] ));
			});
			it("returns a descriptive array if the path exists (including part of a cycle)", () => {
				graph = new GraphOO(
					[['n1', 'n2']],
					[['n2', 'n3']],
					[['n3', 'n4']],
					[['n4', 'n5']],
					[['n3', 'n6']],
					[['n6', 'n2']]
				);

				//  n1 ──▶ n2 ──▶ n3 ──▶ n4 ──▶ n5
				//         ▲      ╷
				//         │      │
				//         ╵      │
				//         n6 ◀───╯

				vertex = graph.vertex('n5');
				expect(set( ...callItWith('n1'))).toEqual(set( ['n1', 'n2', 'n3', 'n4', 'n5'] ));
			});
		});
		

		describeMethod('outDegree', () => {
			it("returns the number of edges going out of this vertex", () => {
				vertex = k1;
				expect(callItWith()).toBe(0);
				vertex = k2;
				expect(callItWith()).toBe(2);
				vertex = k3;
				expect(callItWith()).toBe(1);
				vertex = k4;
				expect(callItWith()).toBe(0);
				vertex = k5;
				expect(callItWith()).toBe(1);
			});
		});
		

		describeMethod('inDegree', () => {
			it("returns the number of edges coming into this vertex", () => {
				vertex = k1;
				expect(callItWith()).toBe(0);
				vertex = k2;
				expect(callItWith()).toBe(0);
				vertex = k3;
				expect(callItWith()).toBe(2);
				vertex = k4;
				expect(callItWith()).toBe(1);
				vertex = k5;
				expect(callItWith()).toBe(1);
			});
		});

		
		describeMethod('degree', () => {
			it("returns the number of edges connected to this vertex", () => {
				vertex = k1;
				expect(callItWith()).toBe(0);
				vertex = k2;
				expect(callItWith()).toBe(2);
				vertex = k3;
				expect(callItWith()).toBe(3);
				vertex = k4;
				expect(callItWith()).toBe(1);
				vertex = k5;
				expect(callItWith()).toBe(2);
			});
		});
		
	});


	describeClass("graph.Edge", 'edge', () => graph.edge('k2', 'k3'), () => {

		it("is present", () => {
			expect(graph.Edge).toEqual(any(Function));
		});

		it("throws an error if either vertex does not exist", () => {
			expect(() => new graph.Edge('n1', 'n2')).toThrowSpecific(GraphOO.VertexNotExistsError, {
				vertices: set( 'n1', 'n2' )
			});
		});

		it("throws nothing if both vertices exist", () => {
			expect(() => new graph.Edge('k1', 'k2')).not.toThrow();
		});

		it("creates a new object of type graph.Edge", () => {
			expect(new graph.Edge('k1', 'k2')).toEqual(any(graph.Edge));
		});

		it("is a different type for each graph", () => {
			let other = new GraphOO();
			expect(graph.Edge).not.toEqual(other.Edge);
		});


		describe("instance", () => {
			it("knows its own key and value", () => {
				expect(edge.key  ).toEqual(['k2', 'k3']);
				expect(edge.from ).toEqual('k2');
				expect(edge.to   ).toEqual('k3');
				expect(edge.value).toEqual("oldValue23");
			});

			it("knows its graph", () => {
				expect(edge.graph).toEqual(graph);
			});

			it("can (almost) stand in for the [[from, to], value] vertex representation", () => {
				expect(edge.length).toEqual(2);
				expect(edge[0]).toEqual(['k2', 'k3']);
				expect(edge[0][0]).toEqual('k2');
				expect(edge[0][1]).toEqual('k3');
				expect(edge[1]).toEqual("oldValue23");
				let [[from, to], value] = edge;
				expect(from).toEqual('k2');
				expect(to).toEqual('k3');
				expect(value).toEqual("oldValue23");
				// expect(edge).toBe(any(Array));            // nope
				// expect(Array.isArray(edge)).toBeTruthy(); // nope
			});

			it("can have a custom superclass given through a graph option", () => {
				class EdgeSuper {  get foo() { return "bar" }  }
				graph = new GraphOO([['n1', 'n2']], { EdgeSuperclass: EdgeSuper });
				edge = graph.edge('n1', 'n2');
				expect(edge).toEqual(any(EdgeSuper));
				expect(edge.foo).toEqual("bar");
			});

			it("can have a custom superclass initialized with custom arguments", () => {
				class EdgeSuper {
					constructor(fromToVal) { this._fromToVal = fromToVal }
					fromToVal() { return `(${this._fromToVal})` }
				}
				graph = new GraphOO([['n1', 'n2'], "n1n2Value"], {
					EdgeSuperclass: EdgeSuper,
					edgeSuperArguments(from, to, value) { return [`${from}:${to}:${value}`]; }
				});
				edge = graph.edge('n1', 'n2');
				expect(edge.fromToVal()).toEqual("(n1:n2:n1n2Value)");
			});
		});


		describe("new instance", () => {
			it("gets registered in its graph", () => {
				let k1k2 = new graph.Edge('k1', 'k2', "newValue");
				expect(graph.hasEdge  ('k1', 'k2')).toBeTruthy();
				expect(graph.edge     ('k1', 'k2')).toBe(k1k2);
				expect(graph.edgeValue('k1', 'k2')).toEqual("newValue");
			});
		});


		describe("existing instance from a graph", () => {
			it("can be used to set its own value", () => {
				edge.set(42);
				expect(edge.value).toEqual(42);
				expect(graph.edgeValue('k2', 'k3')).toEqual(42);
				edge.value = 43;
				expect(edge.value).toEqual(43);
				expect(graph.edgeValue('k2', 'k3')).toEqual(43);
			});
		});


		describe("'source' property", () => {
			it("contains the proper graph.Vertex instance", () => {
				expect(edge.source).toBe(graph.vertex('k2'));
			});
		});


		describe("'target' property", () => {
			it("contains the proper graph.Vertex instance", () => {
				expect(edge.target).toBe(graph.vertex('k3'));
			});
		});


		describeMethod('remove', () => {
			it("removes this edge", () => {
				callItWith();
				expect(graph.hasEdge('k2', 'k3')).toBeFalsy();
			});
		});

	});


	describeMethod('vertex', () => {
		it("returns a graph.Vertex instance", () => {
			let vertex = callItWith('k1');
			expect(vertex).toEqual(any(graph.Vertex));
			expect(vertex.key)  .toEqual('k1');
			expect(vertex.value).toEqual("oldValue1");
		});
	});


	describeMethod('edge', () => {
		it("returns a graph.Edge instance", () => {
			let edge = callItWith('k2', 'k3');
			expect(edge).toEqual(any(graph.Edge));
			expect(edge.key)  .toEqual(['k2', 'k3']);
			expect(edge.value).toEqual("oldValue23");
		});
	});


	/* expect vertex iterators to yield graph.Vertex instances */
	for (let [method, args] of [
		['vertices',               []    ],
		['verticesFrom',           ['k2']],
		['verticesTo',             ['k3']],
		['verticesWithPathFrom',   ['k2']],
		['verticesWithPathTo',     ['k4']],
		['sources',                []    ],
		['sinks',                  []    ]
	]) {
		describeMethod(method, () => {
			it("yields graph.Vertex instances", () => {
				for (let vertex of callItWith(...args)) {
					expect(vertex).toEqual(any(graph.Vertex));
				}
			});
		});
	}


	/* expect edge iterators to yield graph.Edge instances */
	for (let [method, args] of [
		['edges',     []    ],
		['edgesFrom', ['k2']],
		['edgesTo',   ['k3']]
	]) {
		describeMethod(method, () => {
			it("yields graph.Edge instances", () => {
				for (let edge of callItWith(...args)) {
					expect(edge).toEqual(any(graph.Edge));
				}
			});
		});
	}


	/* expect "add" and "modify" events to emit Edge and Vertex instances */
	describeMethod('on', () => {

		let callback;
		beforeEach(() => {
			callback = createSpy('callback');
		});

		describe("— \"vertex-added\" —", () => {
			it("emits a graph.Vertex instance", () => {
				graph.on('vertex-added', callback);
				graph.addVertex('n1', "newValue1");
				expect(callback).toHaveBeenCalledWith(any(graph.Vertex));
			});
		});

		describe("— \"vertex-modified\" —", () => {
			it("emits a graph.Vertex instance when a vertex is added", () => {
				graph.on('vertex-modified', callback);
				graph.addNewVertex('n1', "newValue1");
				expect(callback).toHaveBeenCalledWith(any(graph.Vertex));
			});
			it("emits a graph.Vertex instance when a vertex value is set", () => {
				graph.on('vertex-modified', callback);
				graph.setVertex('k1', "newValue1");
				expect(callback).toHaveBeenCalledWith(any(graph.Vertex));
			});
		});

		describe("— \"edge-added\" —", () => {
			it("emits a graph.Edge instance", () => {
				graph.on('edge-added', callback);
				graph.createNewEdge('n1', 'n2', "newValue12");
				expect(callback).toHaveBeenCalledWith(any(graph.Edge));
			});
		});

		describe("— \"edge-modified\" —", () => {
			it("emits a graph.Edge instance when an edge is added", () => {
				graph.on('edge-modified', callback);
				graph.createNewEdge('n1', 'n2', "newValue12");
				expect(callback).toHaveBeenCalledWith(any(graph.Edge));
			});
			it("emits a graph.Edge instance when an edge value is set", () => {
				graph.on('edge-modified', callback);
				graph.setEdge('k2', 'k3', "newValue23");
				expect(callback).toHaveBeenCalledWith(any(graph.Edge));
			});
		});

	});


	describeMethod('addNewVertex', () => {
		it("when throwing an error, throws one with a graph.Vertex instance inside", () => {
			try { callItWith('k1', "newValue") } catch (err) {
				expect(err.vertices).toEqual(set( any(graph.Vertex) ));
			}
		});
	});


	describeMethod('removeVertex', () => {
		it("when throwing an error, throws one with graph.Edge instance(s) inside", () => {
			try { callItWith('k4') } catch (err) {
				expect(err.edges).toEqual(set( any(graph.Edge) ));
			}
		});
	});


	describeMethod('addNewEdge', () => {
		it("when throwing an error, throws one with a graph.Edge instance inside", () => {
			try { callItWith('k2', 'k3', "newValue") } catch (err) {
				expect(err.edges).toEqual(set( any(graph.Edge) ));
			}
		});
	});


	describeMethod('createNewEdge', () => {
		it("when throwing an error, throws one with a graph.Edge instance inside", () => {
			try { callItWith('k2', 'k3', "newValue") } catch (err) {
				expect(err.edges).toEqual(set( any(graph.Edge) ));
			}
		});
	});
	
	
});
