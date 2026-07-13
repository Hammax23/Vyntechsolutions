export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");

  return {
    connection: {
      client,
      connection: {
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 5437),
        database: env("DATABASE_NAME", "vyntech_strapi"),
        user: env("DATABASE_USERNAME", "postgres"),
        password: env("DATABASE_PASSWORD", "VynTech2024"),
        ssl: env.bool("DATABASE_SSL", false) && {
          rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", true),
        },
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 0),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };
};
