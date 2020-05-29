
const pg = require("pg");

var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);

module.exports = {
  add_patient: (req, res) => {
    console.log("add");
    const query = {
      text: "INSERT INTO patient (patient_id, name, cep, email, cpf, created_dt) VALUES (uuid_generate_v1(), $1, $2, $3, $4, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    console.log("Dados recebidos:");
    console.log(req.body);
    //call patient validator
    // console.log(batch);
    // const { valid, errors } = patient.validate();
    const errors = 'Oops!'
    if (true) {
      var patient = {
        name: req.body.name,
        cep: req.body.cep,
        email: req.body.email,
        cpf: req.body.cpf
      }
      console.log("Vai usar o pool");
      console.log(pool);
      pool.connect().then(client => {
        console.log("Executando query");
        return client.query(query, [patient.name, patient.cep, patient.email, patient.cpf])
          .then(qresult => {
            res.status(200).json({
              type: 'addResponse',
              data: qresult.rowCount
            });
          })
          .catch(e => {
            console.error(e.stack);
            res.status(500).json({
              type: 'addQueryError',
              details: "Erro:\n" + e.stack
            });
          })
          .finally(() => {
            client.release();
          })
      }).catch(e => {
        console.error(e.stack);
        res.status(500).json({
          type: 'addQueryError',
          details: "Erro:\n" + e.stack
        });
      }).finally(() => pool.end());
    }
    else {
      res.status(400).json({
        type: 'addValidationError',
        details: JSON.stringify(errors),
        errorlist: errors
      });
    }
  },
  login_medical: (req, res) => {
    console.log("add");
    const query = {
      text: "INSERT INTO patient (patient_id, name, cep, email, cpf, created_dt) VALUES (uuid_generate_v1(), $1, $2, $3, $4, CURRENT_TIMESTAMP)",
      rowMode: "array"
    };
    console.log("Dados recebidos:");
    console.log(req.body);
        //call patient validator
    // console.log(batch);
    // const { valid, errors } = patient.validate();
    const { valid, errors} = {valid: false, errors: 'Oops'}
    if (valid) {
      var patient = {
        name: req.body.name,
        cep: req.body.cep,
        email: req.body.email,
        cpf: req.body.cpf
      }
      console.log("Vai usar o pool");
      console.log(pool);
      pool.connect().then(client => {
        console.log("Executando query");
        return client.query(query, [patient.name, patient.cep, patient.email, patient.cpf])
          .then(qresult => {
            res.status(200).json({
              type: 'addResponse',
              data: qresult.rowCount
            });
          })
          .catch(e => {
            console.error(e.stack);
            res.status(500).json({
              type: 'addQueryError',
              details: "Erro:\n" + e.stack
            });
          })
          .finally(() => {
            client.release();
          })
      }).catch(e => {
        console.error(e.stack);
        res.status(500).json({
          type: 'addQueryError',
          details: "Erro:\n" + e.stack
        });
      }).finally(() => pool.end());
    }
    else {
      res.status(400).json({
        type: 'addValidationError',
        details: JSON.stringify(errors),
        errorlist: errors
      });
    }
  }
}