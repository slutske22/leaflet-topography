const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './src/index',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'leaflet-topography.js',
		library: 'Topography',
		libraryTarget: 'umd',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.worker\.ts$/,
				use: { loader: 'worker-loader' },
			},
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
	optimization: {
		minimizer: [
			new UglifyJSPlugin({
				uglifyOptions: {
					output: {
						comments: false,
					},
				},
			}),
		],
	},
};
