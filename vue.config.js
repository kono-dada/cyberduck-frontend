const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: [
        "duck.forkingpark.cn",
        "clownfish-app-iez76.ondigitalocean.app"
    ]
  }
})
