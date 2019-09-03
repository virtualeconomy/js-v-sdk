import path from 'path';
import * as rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import pkg from '../package.json';
import { createLogger, c } from './logger';


const logBundle = createLogger('bundle');

async function bundle() {
    try {
        const outputs = process.argv.slice(2)[0].split(',');
        const logPrefix = c.grey(`[${pkg.name}]`);
        logBundle(`${logPrefix} creating bundle`);

        const bundle = await rollup.rollup({
            input: path.join(__dirname, '..', '/src/index.js'),
            plugins: [
                babel({
                    runtimeHelpers: true,
                    exclude: 'node_modules/**',
                }),
            ],
        });

        const formatMap = {
            cjs: 'index.js',
            esm: 'index.esm.js',
        };

        const pkgDist = path.join(__dirname, '..', 'dist');

        for (let i = 0; i < outputs.length; i += 1) {
            const format = outputs[i];
            const file = formatMap[format];
            logBundle(`${logPrefix} writing ${format} - ${file}`);

            await bundle.write({
                file: `${pkgDist}/${file}`,
                name: 'VsysSdk',
                format,
                sourcemap: true,
            });
        }
    } catch (err) {
        logBundle('Failed to bundle:');
        logBundle(err);
        process.exit(1);
    }
}

bundle();
