import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 根据环境变量确定配置
  const isProduction = mode === 'production'
  const isTest = mode === 'test'
  const isDevelopment = mode === 'development'

  // 从环境变量读取配置，如果没有则使用默认值
  // GitHub Pages 部署需要仓库名作为 base 路径
  const base = env.VITE_BASE_URL || (isProduction ? '/vue-component-collection/' : '/')
  const enableSourcemap = env.VITE_SOURCEMAP === 'true'
  const enableMinify = env.VITE_MINIFY !== 'false'
  const dropConsole = env.VITE_DROP_CONSOLE === 'true'

  // 根据环境设置输出目录
  const outDir = isTest ? 'dist-test' : 'dist'

  return {
    base,
    plugins: [
      vue(),
      vueJsx(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // esbuild 压缩选项
    esbuild: {
      // 根据环境变量决定是否移除 console 和 debugger
      drop: dropConsole ? ['console', 'debugger'] : [],
    },
    build: {
      // 输出目录（测试环境使用 dist-test）
      outDir,
      // 根据环境变量决定是否生成 sourcemap
      sourcemap: enableSourcemap,
      // 启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 构建后是否生成 gzip 压缩报告
      reportCompressedSize: false,
      // chunk 大小警告限制（kb）
      chunkSizeWarningLimit: 1000,
      // 资源内联限制（kb），小于此限制的资源会被内联为 base64
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          // 手动指定 chunk 分割策略
          manualChunks: (id) => {
            // node_modules 中的包单独打包
            if (id.includes('node_modules')) {
              // Vue 相关库单独打包
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vue-vendor'
              }
              // UI 库单独打包
              if (id.includes('tdesign') || id.includes('element-plus') || id.includes('naive-ui')) {
                return 'ui-vendor'
              }
              // 其他第三方库
              return 'vendor'
            }
          },
          // 文件命名规则
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop().replace('.vue', '').replace('.jsx', '').replace('.js', '')
              : 'chunk'
            return `js/${facadeModuleId}-[hash].js`
          },
          entryFileNames: 'js/[name]-[hash].js',
          // CSS 文件命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`
            }
            if (ext === 'css') {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
        },
      },
      // 压缩配置（根据环境变量决定是否压缩）
      minify: enableMinify ? 'esbuild' : false,
    },
    // 定义全局常量替换
    define: {
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || 'VUE-组件收集'),
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || '/api'),
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://spark-api-open.xf-yun.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
