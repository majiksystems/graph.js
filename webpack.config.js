var webpack = require('webpack');
module.exports = {
	devtool: 'source-map',
	entry: {
		'graph':                  ['./src/graph.es6.js'],
		'graph.full':             [ 'babel-polyfill', './src/graph.es6.js' ],
		'addGraphOO':             ['./src/addGraphOO.es6.js'],
		'vertices_topologically': ['./src/vertices_topologically.es6.js']
	},
	output: {
		path: './dist',
		filename: '[name].js',
		library: 'Graph',
		libraryTarget: 'umd',
		sourceMapFilename: '[file].map'
	},
	module: {
		loaders: [
			{ test: /\.es6\.js$/, loader: 'babel?compact=false' }
		]
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
	]
};
