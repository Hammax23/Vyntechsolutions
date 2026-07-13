module.exports = {
  apps: [
    {
      name: "vyntech-strapi",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 1338,
        HOST: "0.0.0.0",
      },
    },
  ],
};
