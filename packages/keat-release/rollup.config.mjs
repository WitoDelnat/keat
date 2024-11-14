import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify, swc } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import * as path from 'node:path';
import { readFile } from 'node:fs/promises';
import { string } from 'rollup-plugin-string';
import json from '@rollup/plugin-json';
import { createFilter } from '@rollup/pluginutils';
import { minify as htmlMinify } from 'html-minifier';

const production = process.env.BUILD === 'production';
const { browserslist } = JSON.parse(
    // @ts-ignore
    await readFile('./package.json', { encoding: 'utf8' })
);

const fileName = 'KeatMenu';

/**
 * @param {{configOutputDir?: string}} cliArgs
 * @return {import("rollup").RollupOptions[]}
 */
export default (cliArgs) => {
    const outputDir = cliArgs.configOutputDir || './lib';
    return defineConfig([
        ...jsConfig(outputDir, {
            production,
            sourcemap: false
        })
        // {
        //     input: './src/index.ts',
        //     output: {
        //         file: path.join(outputDir, `${fileName}.d.ts`),
        //         format: 'es',
        //         indent: false
        //     },
        //     plugins: [dts()]
        // }
    ]);
};

/**
 * @return {import("rollup").RollupOptions[]}
 */
function jsConfig(outputDir, { production = false, sourcemap = false }) {
    // @ts-ignore
    return defineConfig([
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}.mjs`),
                format: 'es',
                sourcemap,
                indent: false
            },
            context: 'self',
            plugins: jsPlugins({ module: true, production, sourcemap })
        }
    ]).filter(Boolean);
}

/**
 * @return {import("rollup").Plugin[]}
 */
function jsPlugins({ module = false, production = false, sourcemap = false }) {
    // @ts-ignore
    return [
        nodeResolve(),
        json(),
        postcss({
            include: './src/**/*.css',
            inject: false,
            plugins: [
                postcssPresetEnv({
                    browsers: browserslist,
                    autoprefixer: { grid: 'no-autoplace' },
                    enableClientSidePolyfills: false
                }),
                postcssMixins()
            ],
            minimize: production
        }),
        // Minify HTML and CSS.
        minifyHTML({
            include: ['./src/**/*.html'],
            removeComments: production,
            removeRedundantAttributes: true,
            sortClassName: true,
            collapseWhitespace: production
        }),
        // Import HTML and SVG as strings.
        string({
            include: ['./src/**/*.html', './src/**/*.svg']
        }),
        // Transpile TypeScript.
        swc({
            include: './src/**',
            sourceMaps: sourcemap,
            tsconfig: false,
            env: {
                loose: true,
                targets: browserslist
            },
            jsc: {
                loose: true,
                externalHelpers: true,
                parser: {
                    syntax: 'typescript'
                }
            }
        }),
        // Minify production builds.
        production &&
            minify({
                sourceMap: sourcemap,
                mangle: {
                    toplevel: true
                },
                toplevel: true,
                module,
                ecma: 2017
            })
    ].filter(Boolean);
}

// @ts-ignore
function minifyHTML({ include, exclude, ...options } = {}) {
    const filter = createFilter(include, exclude);
    return {
        name: 'minify-html',
        transform: (code, id) => {
            if (!filter(id)) return null;
            // @ts-ignore
            const result = htmlMinify(code, options);
            return { code: result, map: null };
        }
    };
}
