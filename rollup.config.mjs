import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
// import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import packageJson from './package.json' assert { type: 'json' };


export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.browser,
                format: 'umd',
                sourcemap: true,
                name: 'jsToMathScript'
            },
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
                name: 'jsToMathScript'
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true
            },
            {
                file: packageJson.system,
                format: 'system',
                sourcemap: true
            }
        ],
        plugins: [
            external(),
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
            // terser()
        ]
    },
    {
        input: 'build/module/types/src/index.d.ts',
        output: [{ file: packageJson.types, format: "esm" }],
        plugins: [dts()],
    }
]