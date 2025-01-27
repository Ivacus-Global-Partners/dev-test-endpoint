module.exports = {
  apps: [
    {
      script: './built/index.js',
      name: 'dev::test-endpoint',
      interpreter: '/root/.bun/bin/bun',
    },
  ],
  env: {
    PORT: 3000,
    NODE_ENV: 'production',
  },
  time: true,
}
