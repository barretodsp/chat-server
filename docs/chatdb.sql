CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET CLIENT_ENCODING = 'UTF8';

CREATE ROLE chatadm WITH LOGIN PASSWORD 'aaa';

ALTER ROLE chatadm CREATEDB;

CREATE DATABASE chatdb WITH ENCODING 'UTF8';

-- DROP TABLE strype;
DROP TABLE patient;
DROP TABLE medical;
DROP TABLE waiting_queue;
DROP TABLE consultation_chat_message;
DROP TABLE medical_consultation;


CREATE TABLE patient (
  patient_id uuid NOT NULL,
  name VARCHAR(100) NOT NULL, 
  cep VARCHAR(8) NOT NULL,
  email VARCHAR(100) NOT NULL,
  cpf VARCHAR(11) NOT NULL, 
  created_dt TIMESTAMP NOT NULL,
  deleted_dt TIMESTAMP,
  PRIMARY KEY (patient_id)
);
GRANT ALL PRIVILEGES ON TABLE patient TO chatadm;


CREATE TABLE medical (
  medical_id uuid NOT NULL,
  name VARCHAR(100) NOT NULL, 
  cep VARCHAR(8) NOT NULL,
  email VARCHAR(100) NOT NULL,
  cpf VARCHAR(11) NOT NULL, 
  crm VARCHAR(12) NOT NULL, 
  encrypted_password VARCHAR(200),
  created_dt TIMESTAMP NOT NULL,
  deleted_dt TIMESTAMP,
  PRIMARY KEY (patient_id)
);
GRANT ALL PRIVILEGES ON TABLE medical TO chatadm;


CREATE TABLE waiting_queue (
  waiting_queue_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  socket_id VARCHAR(100) NOT NULL,
  join_dt TIMESTAMP NOT NULL,
  exit_dt TIMESTAMP,
  deleted_dt TIMESTAMP,
  PRIMARY KEY (waiting_queue_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
);
GRANT ALL PRIVILEGES ON TABLE waiting_queue TO chatadm;


CREATE TABLE medical_consultation (
  medical_consultation_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  medical_id uuid NOT NULL,
  start_dt TIMESTAMP NOT NULL,
  end_dt TIMESTAMP,
  deleted_dt TIMESTAMP,
  PRIMARY KEY (medical_consultation_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
  FOREIGN KEY (medical_id) REFERENCES medical(medical_id)
);
GRANT ALL PRIVILEGES ON TABLE medical_consultation TO chatadm;


CREATE TABLE consultation_chat_message (
  consultation_chat_message_id uuid NOT NULL,
  from_id uuid NOT NULL,
  to_id uuid NOT NULL,
  medical_consultation_id uuid NOT NULL,
  msg VARCHAR(400) NOT NULL,
  created_dt TIMESTAMP NOT NULL,
  deleted_dt TIMESTAMP,
  PRIMARY KEY (consultation_chat_message_id),
  FOREIGN KEY (medical_consultation_id) REFERENCES medical_consultation(medical_consultation_id),
);
GRANT ALL PRIVILEGES ON TABLE consultation_chat_message TO chatadm;




