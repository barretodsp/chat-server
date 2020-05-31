const { attributes } = require('structure');

const Medical = attributes({
  medical_id: {
    type: String,
    guid: {
      version: ['uuidv1']
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    nullable: false
  },
  email: {
    type: String,
    required: true,
    email: true,
    trim: true,
    nullable: false
  },
  encrypted_password: {
    type: String,
    required: false,
    trim: true,
    nullable: false
  },
  cpf: {
    type: String,
    required: false,
    trim: true,
    nullable: false
  },
  cep: {
    type: String,
    required: false,
    trim: true,
    nullable: false
  },
  crm: {
    type: String,
    required: false,
    trim: true,
    nullable: false
  },
  specialism: {
    type: String,
    required: false,
    trim: true,
  },
})(class Medical {});

module.exports = Medical;