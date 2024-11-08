const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "production",
    entry: {
        "service-worker": path.resolve(__dirname, "..", "src", "service-worker.ts"),
        "guard": path.resolve(__dirname, "..", "src", "guard.ts"),
        "timeLimitEnabledWebsite": path.resolve(__dirname, "..", "src", "timeLimitEnabledWebsite.ts"),
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
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
    ],
};