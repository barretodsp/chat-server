
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

async function getByEmail(email) {
  console.log("getByEmail");
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM medical WHERE email = $1 AND deleted_dt IS NULL) t",
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

async function getByEmailCpf(email, cpf) {
  console.log("getByEmailCPF", cpf);
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM medical WHERE (email = $1 OR cpf = $2) AND deleted_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [email, cpf]);
  if ((qresult.rowCount > 0) && (qresult.rows[0][0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}



async function getCryptedPassword(medicalId) {
  console.log("getCryptedPassword", medicalId);
  const query = {
    text: "SELECT encrypted_password FROM medical WHERE medical_id = $1 AND deleted_dt IS NULL",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [medicalId]);
  if ((qresult.rowCount > 0) && (qresult.rows[0] != null)) {
    return qresult.rows[0][0];
  }
  else {
    return null;
  }
}

async function getById(medicalId) {
  console.log("getById", medicalId);
  const query = {
    text: "select array_to_json(array_agg(row_to_json(t))) from (SELECT * FROM medical WHERE medical_id = $1 AND deleted_dt IS NULL) t",
    rowMode: "array"
  };
  var dbCon = await pool.connect();
  var qresult = await dbCon.query(query, [medicalId]);
  if ((qresult.rowCount > 0) && (qresult.rows[0] != null)) {
    return qresult.rows[0][0][0];
  }
  else {
    return null;
  }
}

async function checkPassword(passwordToCheck, prmDbPass) {
  try {
    console.log("checkPassword");
    console.log("passwordToCheck");
    console.log(passwordToCheck);
    console.log("prmDbPass");
    console.log(prmDbPass);
    return await bcrypt.compare(passwordToCheck, prmDbPass);
  }
  catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  getByEmail,
  getById,
  checkPassword,
  getCryptedPassword,
  add: async (req, res) => {
    console.log("medical-add");
    const query = {
      text: "INSERT INTO medical (medical_id, name, cep, address, email, cpf, crm, specialism, encrypted_password, created_dt) VALUES (uuid_generate_v1(), $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    console.log("Dados recebidos:");
    console.log(req.body);
    var medical = new Medical({
      name: req.body.name,
      email: req.body.email,
      cep: req.body.cep,
      cpf: req.body.cpf,
      crm: req.body.crm,
      specialism: req.body.specialism,
      address: req.body.address,
      encrypted_password: req.body.password
    });
    const { valid, errors } = medical.validate();
    if (valid) {
      const user = await getByEmailCpf(medical.email, medical.cpf);
      console.log('USER EXISTS?', user)
      if (user) {
        res.status(400).json({
          type: 'emailInvalid',
          details: "E-mail ou CPF inválido para cadastro."
        });
      } else {
        bcrypt.hash(medical.encrypted_password, cfg.saltingRounds, function (err, hash) {
          medical.pwd = hash;
          console.log('SENHA HASH', medical.pwd)
          if (err) {
            console.log(err);
            res.status(500).json({
              type: 'addResponse',
              type: 'Error hashing password for user',
              details: err
            });
          }
          else {
            pool.connect().then(client => {
              return client.query(query, [medical.name, medical.cep, medical.address, medical.email, medical.cpf, medical.crm, medical.specialism, medical.pwd])
                .then(qresult => {
                  res.status(200).json({
                    type: 'addResponse',
                    data: qresult.rowCount
                  });
                })
                .catch(e => {
                  res.status(500).json({
                    type: 'addError2',
                    details: JSON.stringify(e),
                    errorlist: e
                  });
                })
            }).catch(e => {
              res.status(500).json({
                type: 'addError1',
                details: JSON.stringify(e),
                errorlist: e
              });
            })
          }
        });
      }
    } else {
      res.status(400).json({
        type: 'emptyParams',
        details: JSON.stringify(errors),
        errorlist: errors
      });
    }
  }, get: async (req, res) => {
    console.log("medical-get");
    console.log("Dados recebidos USER:", req.user);
    if (req.user) {
      res.status(200).json({
        type: "getMedical",
        medical: req.user,
      });
    }
    else {
      res.status(200).json({
        type: "loginMedical",
        medical: null,
        auth: false
      });
    }
  }, update: async (req, res) => {
    console.log("medical-update");
    const query = {
      text: "UPDATE medical set  name = $1, cep = $2, address = $3, email = $4, cpf = $5, crm = $6, specialism = $7 WHERE medical_id = $8 ",
      rowMode: "array"
    };
    console.log("Dados recebidos:");
    console.log(req.body);
    var medical = new Medical({
      name: req.body.name,
      email: req.body.email,
      cep: req.body.cep,
      cpf: req.body.cpf,
      crm: req.body.crm,
      specialism: req.body.specialism,
      address: req.body.address,
      encrypted_password: req.body.password
    });
    const { valid, errors } = medical.validate();
    if (valid) {
      pool.connect().then(client => {
        return client.query(query, [medical.name, medical.cep, medical.address, medical.email, medical.cpf, medical.crm, medical.specialism, req.body.medical_id])
          .then(qresult => {
            res.status(200).json({
              type: 'addResponse',
              data: qresult.rowCount
            });
          })
          .catch(e => {
            res.status(500).json({
              type: 'addError2',
              details: JSON.stringify(e),
              errorlist: e
            });
          })
      }).catch(e => {
        res.status(500).json({
          type: 'addError1',
          details: JSON.stringify(e),
          errorlist: e
        });
      })
    } else {
      res.status(400).json({
        type: 'emptyParams',
        details: JSON.stringify(errors),
        errorlist: errors
      });
    }

  }

}