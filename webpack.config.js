var path = require('path');

module.exports = {
	entry: './src/index',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'index.js',
		library: 'Topography',
		libraryTarget: 'umd',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},
	externals: {
		leaflet: {
			commonjs: 'leaflet',
			commonjs2: 'leaflet',
			root: 'L',
		},
	},
};
