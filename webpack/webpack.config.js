const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const version = require('../package.json').version;
module.exports = {
    mode: "production",
    entry: {
        "service-worker": path.resolve(__dirname, "..", "src", "service-worker.ts"),
        "timeLimitEnabledWebsite": path.resolve(__dirname, "..", "src", "timeLimitEnabledWebsite.ts"),
        "info": path.resolve(__dirname, "..", "src", "info.ts"),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "static"}]
        }),
        new CopyPlugin({
            patterns: [{
                from: "manifest.json",
                to: "manifest.json",
                transform(content) {
                    const template = content.toString();
                    return template.replace('{{version}}', version);
                },
            }]
        }),
    ],
};