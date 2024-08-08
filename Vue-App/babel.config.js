// Babel configuration to support legancy Javascript versions (Browser compatibility)
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-proposal-class-properties']
};
