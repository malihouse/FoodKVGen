import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 深度混淆插件：将代码逻辑、变量名、字符串彻底“乱码化”
    obfuscator({
      options: {
        compact: true, // 紧凑输出，移除所有空格和换行
        controlFlowFlattening: true, // 逻辑流扁平化，打乱代码执行顺序
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true, // 将数字变成复杂的数学表达式
        simplify: true,
        stringArray: true, // 将所有字符串（包括 Prompt）存入加密数组
        stringArrayThreshold: 0.75,
        splitStrings: true, // 拆分长字符串，防止搜索关键词定位
        unicodeEscapeSequence: true, // 将字符转换为 Unicode 编码，无法肉眼阅读
        deadCodeInjection: true, // 注入死代码，增加逆向工程难度
        deadCodeInjectionThreshold: 0.4
      },
    }),
  ],
  build: {
    // 🔴 极其重要：强制关闭生产环境的 Source Map
    // 如果不设为 false，混淆将毫无意义，因为浏览器可以一键还原源码
    sourcemap: false,
    
    // 使用 Terser 进行深度压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 自动删除代码中所有的调试日志，防止敏感信息泄露
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true, // 开启变量名混淆
    },
    // 打包后的文件块大小警告阈值（可选）
    chunkSizeWarningLimit: 1500,
  },
})