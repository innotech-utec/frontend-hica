const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    host: '0.0.0.0',   // Escuchar en todas las interfaces de red
    port: 8081,        // Puerto en el que se sirve la aplicación
    https: process.env.PROD === 'true',       // HTTPS está habilitado
    proxy: { 
    }
  },

  pluginOptions: {
    vuetify: {
      
    }
  }
})
