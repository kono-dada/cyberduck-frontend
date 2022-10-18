module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    disableHostCheck: true,
    client: {
      webSocketURL: 'wss://0.0.0.0:0/ws'
    }
  }
}
