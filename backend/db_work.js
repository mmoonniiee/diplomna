import {Pool} from 'pg';

const pool = new Pool({
    host: 'localhost',
    user: 'pgsql',
    database: 'diplomna',
    password: 'AzsymMoon',
    port: 5432,
  });

  //connect
  await pool.connect();

  //create all the tables
  export async function createTables() {
    await pool.query(`
    create type school_type as ENUM("primary", "secondary", "high", "college");
    `);

    await pool.query(`
    create table if not exists School (
      id int not null serial primary key,
      name not null varchar(256),
      domain not null varchar(32) check(domain like "@%"),
      type school_type not null
    )`);

    await pool.query(`
    create table if not exists Staff (
      id int not null serial primary key,
      name varchar(64) not null,
      email varchar(64) not null,
      constraint staff_school
        foreign key(staff_school)
          references School(id)
    )`);

    //teachers & staff
    await pool.query(`
    create table if not exists Teacher(
      id int not null serial primary key
    )`)

    await pool.query(`
    create table if not exists Admin(
      id int not null serial primary key
    )`)
    
    //check grad_year > current
    await pool.query(`
    create table if not exists Class(
      id int not null serial primary key,
      paralelka varchar(5) not null unique,
      graduation_year int not null,
      constraint class_teacher foreign key(class_teacher) references Teacher(id)
    )`)

    //check email 
    await pool.query(`
    create table if not exists Student(
      id int not null serial primary key,
      name varchar(64) not null,
      email varchar(32) not null check(email like "%@%"),
      constraint student_school foreign key(student_school) refferences School(id)
    )`)

    await pool.query(`
    create type semester as ENUM("first", "second", "both")`)

    //check for chorarium?
    await pool.query(`
    create table if not exists Subject(
      id int not null serial primary key,
      name varchar(64) not null,
      chorarium int not null,
      semester semester notnull
    )`)

    //tables class_subject & teacher_subject

    await pool.query(`
    create type week_type as ENUM("odd", "even", "both")`)

    await pool.query(`
    create type weekday as ENUM("monday", "tuesday", "wednesday", "thursday", "friday")`)

    //weekday??????
    await pool.query(`
    create table if not exists Chas(
      id int serial primary key,
      constraint subject_taught foreign key(subject) references Subject(id),
      week_taught week_type not null,
      weekday_taught weekday not null,
      start_time time not null,
      end_time time not null,
      semester semester not null
    )`)
    }
  //add & remove school 

  //add & remove student

  //format classes?

  //add & remove staff

  //add & remove subject

  //get teacher's subjects

  //get class' subjects

  //insert into schedule table