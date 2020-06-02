
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

async function getByEmail(email) {
  console.log("getByEmail - Patient");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM patient WHERE email = $1 AND deleted_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [email]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}

async function add(patient) {
  try {
    console.log("add - Patient");
    let nid = uuid.v1()
    const query = {
      text: "INSERT INTO patient (patient_id, name, cep, email, cpf, address, created_dt) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    let dbCon = await pool.connect();
    await dbCon.query(query, [nid, patient.name, patient.cep, patient.email, patient.cpf, patient.address]);
    return nid;
  } catch (er) {
    console.log('ERRO add-patient =>', er);
    return false
  }
}


module.exports = {
  getByEmail,
  add
}