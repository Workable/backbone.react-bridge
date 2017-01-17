module.exports = {
  entry: './examples/main.js',
  output: {
    filename: './dist/backbone.react-bridge.bundle.js',
  },
  devServer: {
    inline:true,
    contentBase: './examples',
    port: 3333
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      },
      { test: /\.html$/, loader: "babel!es6-template-string" }
    ]
  }
}
