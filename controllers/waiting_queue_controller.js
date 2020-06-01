
const pg = require("pg");
const cfg = require("../config");
const bcrypt = require("bcrypt");
const Medical = require("../models/Medical");

var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);


async function getById(queue_id) {
  console.log("getById- Queue");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM waiting_queue WHERE waiting_queue_id = $1 AND exit_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [queue_id]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}


async function joinPatient(socket_id, patient_id, patient_name) {
  try {
    console.log("joinPatient");
    const query = {
      text: "INSERT INTO waiting_queue (waiting_queue_id, socket_id, patient_id, patient_name, join_dt) VALUES (uuid_generate_v1(), $1, $2, $3, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [socket_id, patient_id, patient_name]);
    return true
  } catch (er) {
    return false
  }
}

async function exitPatient(queue_id) {
  try {
    console.log("exitPatient", queue_id);
    const query = {
      text: "UPDATE waiting_queue set exit_dt = CURRENT_TIMESTAMP WHERE waiting_queue_id = $1",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [queue_id]);
    return true
  } catch (er) {
    console.log('ERRO EXIT PCT', er)
    return false
  }
}

module.exports = {
  getById,
  joinPatient,
  exitPatient,
  getAll: async (req, res) => {
    console.log("getAll");
    const query = {
      text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT waiting_queue_id as key, socket_id, patient_id, patient_name FROM waiting_queue WHERE exit_dt IS NULL AND deleted_dt IS NULL) t",
      rowMode: "array"
    };
    pool.connect().then(client => {
      return client.query(query)
        .then(qresult => {
          console.log('UEE 2', qresult.rows[0][0])
          if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
            res.status(200).json({
              type: 'getAll',
              data: qresult.rows[0][0]
            });
          }
          else {
            res.status(200).json({
              type: 'getAll',
              data: []
            });
          }
        })
        .catch(e => {
          res.status(500).json({
            type: 'getError2',
            details: JSON.stringify(e),
            errorlist: e
          });
        })
    }).catch(e => {
      res.status(500).json({
        type: 'getError1',
        details: JSON.stringify(e),
        errorlist: e
      });
    })
  }
}