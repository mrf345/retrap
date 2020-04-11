module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          debug: false,
          targets: {
            browsers: ['last 5 version']
          }
        }
      ]
    ],
    plugins: []
}
