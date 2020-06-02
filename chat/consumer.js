const uuid = require('uuid');
const patientController = require('../controllers/patient_controller');
const medicalController = require('../controllers/medical_controller');
const waitingController = require('../controllers/waiting_queue_controller');
const consultationController = require('../controllers/medical_consultation_controller');
const messageController = require('../controllers/consultation_chat_message_controller');
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

    socket.on('disconnect', async function () {
      console.log('##### Got disconnect! #####');
      console.log('SocketID', socket.id)
      if (socket.type) {
        if (socket.type == 2) {
          console.log('TIPO PACIENTE')
          await waitingController.deletePatient(socket.id);
          let resp = await consultationController.getMedicalSocket(socket.id);
          console.log('UEEEEE', resp);
          if (resp && resp.medical_socket_id) {
            console.log('SOCKID MED', resp.medical_socket_id);
            await consultationController.exit(socket.id);
            let message = [
              {
                text: "Opa, o usuário encerrou a consulta!",
                user: { _id: 999, name: 'ChatBot' },
                createdAt: new Date(),
                _id: uuid.v1()
              }
            ]
            io.to(resp.medical_socket_id).emit('patient_exit', message);
            console.log('MSG ENVIADA')
          }
        } else {
          console.log('TIPO MEDICO')
          let resp = await consultationController.getPatientSocket(socket.id);
          if (resp && resp.patient_socket_id) {
            console.log('SOCKID PCT', resp.patient_socket_id);
            await consultationController.exit(socket.id);
            let message = [
              {
                text: "O médico encerrou a consulta!",
                user: { _id: 999, name: 'ChatBot' },
                createdAt: new Date(),
                _id: uuid.v1()
              }
            ]
            io.to(resp.patient_socket_id).emit('medical_exit', message);
            console.log('MSG ENVIADA')

          }
        }
      }else{
        console.log('Only exit.')
      }


    });


    socket.on('start_consultation', async function (queue_id, medical_id, medical_name) {
      console.log('START CONSULTATION');
      console.log('queue_id', queue_id);
      console.log('medical_id', medical_id);

      // socket.name = name
      let patient = await waitingController.getById(queue_id);
      if (patient) {
        console.log('PCT veio da Queue', patient);
        socket.type = 1;
        socket.target_user_id = patient.socket_id;
        await waitingController.exitPatient(queue_id);
        let cid = await consultationController.start(medical_id, socket.id, patient.patient_id, patient.socket_id)
        console.log('Consultation ID', cid);

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
          patient_id: patient.patient_id,
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
          medical_id: medical_id,
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
        //RECEBER ALARME
        io.to(socket.id).emit('patient_not_found', message);
      }
    });

    socket.on('hello_patient', function (email) {
      console.log('hello_patient: ', email);

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
      console.log('patient socket', socket.id)

      const patient = await patientController.getByEmail(email);
      console.log('PAciente', patient);
      if (patient) {
        socket.type = 2
        let resp = await waitingController.joinPatient(socket.id, patient.patient_id, patient.name)
        if (resp) {
          console.log('Enviando Mensagem')
          let msg_waiting = [
            {
              text: `Olá, ${patient.name}! \n Aguarde uns instantes para ser atendido(a) por um médico.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ];

          console.log('Enviando Mensagem')
          io.to(socket.id).emit('waiting_queue', {message: msg_waiting, patient});
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
      data.patient_id = patient_id;
      if (patient_id) {
        socket.type = 2
        let resp = await waitingController.joinPatient(socket.id, patient_id, data.name);
        console.log('RESP JOIN', resp);
        if (resp) {
          let msg_waiting = [
            {
              text: `Olá, ${data.name}! \n Aguarde uns instantes para ser atendido(a) por um médico.`,
              user: { _id: 999, name: 'ChatBot' },
              createdAt: new Date(),
              _id: uuid.v1()
            }
          ];

          console.log('Enviando MSG ao PATIENT');
          io.to(socket.id).emit('waiting_queue', {message: msg_waiting, patient: data});
          console.log('Enviado!')

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

    socket.on('send_consultation_message', async function (target_socket_id, target_user_id, consultation_id, message) {
      console.log('** send-consultation_message **')
      console.log('target_socket_id', target_socket_id);
      console.log('target_user_id', target_user_id);
      console.log('consultation_id', consultation_id);
      console.log('message', message);

      await messageController.add(message[0].user._id, target_user_id, consultation_id, message[0].text);
      io.to(target_socket_id).emit('receive_consultation_message', message);

    });


    socket.on('finish_consultation', async function (target_socket_id, target_user_id, consultation_id, message) {
      console.log('** finish_consultation **')
      console.log('target_socket_id', target_socket_id);
      console.log('target_user_id', target_user_id);
      console.log('consultation_id', consultation_id);
      console.log('message', message);

      await messageController.add(message[0].user._id, target_user_id, consultation_id, message[0].text);
      io.to(target_socket_id).emit('receive_consultation_message', message);

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

