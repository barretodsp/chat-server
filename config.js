 module.exports = {
    port: process.env.PORT || 3000,
    saltingRounds: 10,
    db: {
      database: "chatdb",
      host: 'localhost',
      port: 5432,
      user: "chatadm",
      password: "aaa"  
    },
    JWT_SECRET: 'codeworkrauthentication',
  };