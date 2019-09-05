module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '8',
                },
            },
        ],
    ],
    env: {
        development: {
            plugins: ['@babel/plugin-transform-runtime'],
        },
        production: {
            plugins: ['@babel/plugin-transform-runtime'],
        },
        test: {
            presets: [
                [
                    '@babel/env',
                    {
                        modules: 'commonjs',
                        targets: {
                            node: 'current',
                        },
                    },
                ],
            ],
        },
    },
    plugins: [
        '@babel/plugin-syntax-import-meta',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-object-rest-spread',
    ],
};
