module.exports = function () {
    return {
        presets: ["@babel/preset-env", "@babel/react", "@babel/preset-typescript"],
        plugins: [
            [
                "@emotion",
                {
                    importMap: {
                        "@mui/system": {
                            styled: {
                                canonicalImport: ["@emotion/styled", "default"],
                                styledBaseImport: ["@mui/system", "styled"],
                            },
                        },
                        "@mui/material/styles": {
                            styled: {
                                canonicalImport: ["@emotion/styled", "default"],
                                styledBaseImport: ["@mui/material/styles", "styled"],
                            },
                        },
                    },
                },
            ],
            "@babel/plugin-proposal-class-properties",
        ],
    };
};
