
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


async function getById(medical_consultation_id) {
  console.log("getById- medical_consultation");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM medical_consultation WHERE medical_consultation_id = $1 AND end_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [medical_consultation_id]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}

async function getPatientSocket(medical_socket_id) {
  console.log("getPatientSocket");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT patient_socket_id FROM medical_consultation WHERE medical_socket_id = $1 AND end_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [medical_socket_id]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}

async function getMedicalSocket(patient_socket_id) {
  console.log("getMedicalSocket");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT medical_socket_id FROM medical_consultation WHERE patient_socket_id = $1 AND end_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [patient_socket_id]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}



async function start(medical_id, medical_socket_id, patient_id, patient_socket_id) {
  try {
    console.log("start - Consultation");
    console.log('patient_id', patient_id);
    console.log('medical_id', medical_id);

    let nid = uuid.v1()
    const query = {
      text: "INSERT INTO medical_consultation (medical_consultation_id, medical_id, medical_socket_id, patient_id, patient_socket_id, start_dt) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [nid, medical_id, medical_socket_id, patient_id, patient_socket_id]);
    return nid
  } catch (er) {
    console.log('ERRO START CONSULT', er);
    return false
  }
}

async function finish(medical_consultation_id) {
  try {
    console.log("finish - consultation");
    const query = {
      text: "UPDATE medical_consultation set end_dt = CURRENT_TIMESTAMP WHERE medical_consultation_id = $1 )",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [medical_consultation_id]);
    return true
  } catch (er) {
    return false
  }
}

async function exit(socket_id) {
  try {
    console.log("exit - consultation");
    const query = {
      text: "UPDATE medical_consultation set end_dt = CURRENT_TIMESTAMP WHERE (patient_socket_id = $1 OR medical_socket_id = $1) and end_dt is NULL )",
      rowMode: "array"
    };
    var dbCon = await pool.connect();
    await dbCon.query(query, [patient_id]);
    return true
  } catch (er) {
    return false
  }
}

module.exports = {
  getById,
  getMedicalSocket,
  getPatientSocket,
  start,
  finish,
  exit
}