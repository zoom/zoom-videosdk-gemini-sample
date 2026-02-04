npm init &&
npm i --save-dev webpack webpack-cli webpack-dev-server path ajv html-webpack-plugin patch-package esbuild-loader lucide-react @radix-ui/themes tailwindcss @mui/base styled-components concurrently babel-loader @babel/preset-env @babel/core @babel/plugin-transform-runtime @babel/preset-react @babel/eslint-parser @babel/cli eslint eslint-config-airbnb-base eslint-plugin-jest eslint-config-prettier react react-dom react-router-dom style-loader css-loader url-loader sass-loader sass postcss-loader postcss postcss-preset-env react-scripts@latest concurrently generate-react-cli react-loader-spinner --legacy-peer-dep &&
mkdir src &&
cd src &&
mkdir components &&
echo "import React from 'react';

const App = () =>{
    return (
        <h1>
            Welcome to React App thats build using Webpack and Babel separately
        </h1>
    )
}

export default App" > App.jsx &&
echo "<!DOCTYPE html>
<html lang=\"en\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>ReactApp</title>
        <link rel=\"stylesheet\" href=\"../dist/output.css\">
        <link rel=\"stylesheet\" href=\"../styles.css\">
      </head>
    <body>
        <h1 class=\"text-3xl font-bold underline\">
            Hello world!
          </h1>
        <div id=\"root\"></div>
    </body>
</html>" > index.html &&

echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > input.css &&

cd .. &&
echo "
import React from 'react';
import reactDom from 'react-dom';
import App from './src/App';
import '@radix-ui/themes/styles.css';

reactDom.render(<App />, document.getElementById('root'));" > index.jsx &&

echo "
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports={
    mode: 'development',  
    target: 'web',
    context: __dirname,
    entry: './index.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js',
        publicPath: '/'
    },
    devServer: {
        static: {
          directory: path.join(__dirname, '/'), 
        },
        port: 3000,
        watchFiles: ['src/*.html'],
        historyApiFallback: true,  
        host: 'localhost',
        liveReload:true,
        open: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cache-Control': 'no-store',
        },
    },
    resolve: {
        extensions: ['.js','.jsx','.json','.css','.scss'] 
    },
    module: {
        rules: [
            {
              test: /\.[jt]sx?$/,
              loader: 'esbuild-loader',
              options: {
                  target: 'es2015'
              }
            },
            {
              test: /\.css$/i,
              use: [
                'style-loader',
                'css-loader',
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [
                        [ 'postcss-preset-env', {}, ],
                      ],
                    },
                  },
                },
              ]
            },
            {
              test: /\.s[ac]ss$/i,
              use: [
                'style-loader',
                'css-loader',
                'sass-loader',
              ],
            },
            {
              test: /\.(jpg|png|svg)$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 500000
                  }
                }
              ]
            }
        ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({ template: 'src/index.html'})
    ] 
}" > webpack.config.js &&

echo "{
    \"presets\": [
        \"@babel/preset-env\", //compiling ES2015+ syntax
        \"@babel/preset-react\" //for react
    ],
    \"plugins\": [
        \"@babel/plugin-transform-runtime\"
    ]
}" > .babelrc &&
echo " " > .env &&
echo " " > styles.css &&
echo ".env
/node_modules
.DS_Store
package-lock.json" > .gitignore &&
echo "/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    \"./index.html\",
    \"./src/**/*.{js,ts,jsx,tsx}\"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}" > tailwind.config.js &&
old_string='\"test\": "echo \\\"Error: no test specified\\\" && exit 1\"' &&
new_string="\"app\": \"webpack-dev-server .\", \n \"watch-css\": \"npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch\", \n \"build\": \"Webpack .\", \n \"start\": \"concurrently -p \\\"[{name}]\\\" -n \\\"app,watch-css\\\" -c \\\"cyan,green\\\" \\\"npm run app\\\"  \\\"npm run watch-css\\\" \"" &&
sed -i '' "s/$old_string/$new_string/" package.json &&
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch &&
git init