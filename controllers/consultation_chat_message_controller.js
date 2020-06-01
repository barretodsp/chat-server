
const pg = require("pg");
const uuid = require("uuid");

var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);


async function add(from_user_id, to_user_id, consultation_id, message) {
  try {
    console.log("add - ChatMessage");
    console.log('from_user_id', from_user_id);
    console.log('to_user_id', to_user_id);
    console.log('message', to_user_id);


    let nid = uuid.v1()
    const query = {
      text: "INSERT INTO consultation_chat_message (consultation_chat_message_id, from_id, to_id, medical_consultation_id, msg, created_dt) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [nid, from_user_id, to_user_id, consultation_id, message]);
    return true
  } catch (er) {
    console.log('ERRO Add ChatMessage', er);
    return false
  }
}

module.exports = {
  add
}