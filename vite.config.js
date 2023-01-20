import path from 'path'
import { defineConfig } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl' // https

const root = path.resolve(path.resolve(), 'src')
const outDir = path.resolve(path.resolve(), 'dist')

function CustomHmr() {
    return {
        name: 'custom-hmr',
        enforce: 'post',
        // HMR
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.json')) console.log('reloading json file...')
            server.ws.send({ type: 'full-reload', path: '*' });
        },
    }
}

export default defineConfig({
    root,
    base: './', // 상대 경로로 설정하기 
    plugins:[
        CustomHmr(), 
        // basicSsl() 
    ],
    server: {
        host : true,
        // host: 'localhost',
        port: 3000,
        cors: '*',
        hmr: {
            host: 'localhost',
            protocol: 'ws',
        },
    },
    build:{
        outDir, // 설정하지 않으면 같은폴더 안에 dist 폴더가 자동으로 생성됨.
        emptyOutDir: true,

        minify: 'terser',
        manifest: true,    // 번들링 되는 정보 저장 
        terserOptions: {
            compress: {
                drop_console: true,  // console.log 삭제
                drop_debugger: true
            }
        },

        rollupOptions: {  // 빌드를 위한 경로 셋팅 //
            input: {
                index: path.resolve(root, "index.js"), //-> html이 아닌 JS 파일 연결.. 여러 경로 설치 가능
            },

            /* out 을 명시 안하면 assets 폴더 안에 다 담김 */
            output: {
                entryFileNames: 'src/[name].js', // 해시값 없이 dist/src 안에 넣고 싶을 때
                // entryFileNames: 'assets/[name]-[hash].js',   // works
                // chunkFileNames: 'assets/[name]-[hash].js',   // works
                assetFileNames: assetInfo => { /*  사용한 소스 중 js 파일 이외의 것들 처리 (css img 등) */
                    if (/\.css$/.test(assetInfo.name)) return 'assets/css/[name]-[hash][extname]'
                    return 'assets/img/[name]-[hash][extname]'
                }
            }
        },

    },
})