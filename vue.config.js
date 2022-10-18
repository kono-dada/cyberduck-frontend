module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    allowedHosts: [
      "duck.forkingpark.cn",
      "clownfish-app-iez76.ondigitalocean.app"
    ],
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  }
}
