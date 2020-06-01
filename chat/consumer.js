const uuid = require('uuid');
const patientController = require('../controllers/patient_controller');
const medicalController = require('../controllers/medical_controller');
const waitingController = require('../controllers/waiting_queue_controller');
const consultationController = require('../controllers/medical_consultation_controller');
const pg = require('pg');

var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);

module.exports = function (io) {

  io.on('connection', function (socket) {

    socket.on('start_consultation', async function (queue_id, medical_id, medical_name) {
      console.log('START CONSULTATION');
      console.log('queue_id', queue_id);
      console.log('medical_id', medical_id);
      // socket.name = name
      let patient = await waitingController.getById(queue_id);
      if (patient) {
        console.log('PCT veio da Queue', patient)
        let resp = await waitingController.exitPatient(queue_id);
        if (resp) {
          let cid = await consultationController.start(medical_id, patient.patient_id)
          console.log('Consultation ID', cid)
          
          // TO MEDICAL
          let medical_message = [
            {
              text: `${medical_name}, a consulta foi iniciada!`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('consultation_started', {
            message: medical_message,
            consultation_id: cid,
            patient_socket: patient.socket_id,
            patient_name: patient.patient_name,
          });

          // TO PATIENT
          let patient_message = [
            {
              text: `${patient.patient_name}, a consulta começou!`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(patient.socket_id).emit('consultation_started', {
            message: patient_message,
            consultation_id: cid,
            medical_socket: socket.id,
            medical_name: medical_name,
          });
        } else {
          console.log('Paciente not found!')
          let message = [
            {
              text: `O paciente não estava mais na fila! Realize uma nova escolha.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('patient_not_found', message);
        }
      }
    });

    socket.on('hello_patient', function (email) {
      console.log('hello_patient: ', email)
      let msg = [
        {
          text: "Olá, informe seu e-mail!",
          user: { _id: 999, name: 'ChatBot' },
          createdAt: new Date(),
          _id: uuid.v1()
        }
      ]
      io.to(socket.id).emit('fill_email', msg);
    });

    socket.on('patient_email', async function (email) {
      console.log('patient_email', email)
      const patient = await patientController.getByEmail(email);
      if (patient) {
        socket.user_id = patient.patient_id;
        let resp = await waitingController.joinPatient(socket.id, patient.patient_id, patient.name)
        if (resp) {
          let msg_waiting = [
            {
              text: `Olá, ${patient.name}! \n Aguarde uns instantes para ser atendido por um médico.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('waiting_queue', msg_waiting);
        } else {
          let msg_waiting = [
            {
              text: `Servidor indisponível. Tente novamente mais tarde.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('unavailable_server', msg_waiting);
        }
      } else {
        let msg_register = [
          {
            text: `Olá, para que possamos proceder com seu atendimento, será necessário o preenchimento dos seguintes dados:\n
               Para começar, digite o seu Nome.`,
            user: { _id: 999, name: 'ChatBot' },
            createdAt: new Date(),
            _id: uuid.v1()
          }
        ]
        io.to(socket.id).emit('fill_name', msg_register);
      }
    });


    socket.on('create_patient', async function (data) {
      console.log('create_patient', data)
      let patient_id = await patientController.add(data);
      if (patient_id) {
        let resp = await waitingController.joinPatient(socket.id, patient_id, data.name)
        if (resp) {
          let msg_waiting = [
            {
              text: `Olá, ${data.name}! \n Aguarde uns instantes para ser atendido por um médico.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('waiting_queue', msg_waiting);
        } else {
          let msg_waiting = [
            {
              text: `Servidor indisponível. Tente novamente mais tarde.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ]
          io.to(socket.id).emit('unavailable_server', msg_waiting);
        }
      }
    });

    //lidar com acesso concorrente
    socket.on('medical_choose_patient', function (queue_id) {
      //retirar patient da fila de espera
      // enviar notificação de nova consulta p/ paciente, com os ids do medico como referencia
      //
      if (patient) {
        delete waitingQueue[id];
        io.to(id).emit("medical_choosed", { medical_id: socket.id, message: `O médico ${socket.name} entrou na sala.` });
      } else {
        io.to(socket.id).emit("user_not_found", "Usuário não disponível.")
      }
    });


    socket.on('send_private_message', function (to_id, message) {
      console.log('MSG to', to_id)
      console.log('UUID?', uuid.v1());
      //system message example
      let msg_system = [
        {
          text: "Sala Criada",
          system: true,
          createdAt: new Date(),
          _id: uuid.v1()
        }
      ]
      // user message example
      let msg = [
        {
          text: "Sala Criada",
          user: { _id: 2, name: 'Servidor' },
          createdAt: new Date(),
          quickReplies: {
            type: 'checkbox', // or 'radio',
            values: [
              {
                title: 'Yes',
                value: 'yes',
              },
              {
                title: 'Yes, let me show you with a picture!',
                value: 'yes_picture',
              },
              {
                title: 'Nope. What?',
                value: 'no',
              },
            ],
          },
          _id: uuid.v1()
        }
      ]
      io.to(to_id).emit('receive_private_message', msg);
    });

    //*************************************************** */


    socket.on('create_user', function (data) {
      console.log('SID - CREATE-USER', socket.id);
      console.log('Dados recebidos REGISTER: ', data)
    });

    socket.on('message', function (message) {
      // socket.username = username;
      // connectedUsers[username] = socket.id;
      console.log('SID - MESSAGE', socket.id);
      console.log('Mensagem: ', message)
      // io.to(socket.id).emit('private_chat',{
      //         //The sender's username
      //         username : `Olá ${username}`,
      //         //Message sent to receiver
      //         message : 'Como vai?'
      //     });
      // console.log('Lista de Usuários', connectedUsers)
    });
    // getApiAndEmit(socket);

  });
};

