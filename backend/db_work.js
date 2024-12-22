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
      domain not null varchar(32) check(domain like "@%") unique,
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

    //TODO: teachers & staff
    await pool.query(`
    create table if not exists Teacher(
      id int not null serial primary key
    )`)

    await pool.query(`
    create table if not exists Admin(
      id int not null serial primary key
    )`)
    
    //TODO: check grad_year > current
    await pool.query(`
    create table if not exists Class(
      id int not null serial primary key,
      paralelka varchar(5) not null unique,
      graduation_year int not null,
      constraint class_teacher foreign key(class_teacher) references Teacher(id)
    )`)

    //TODO: check email 
    await pool.query(`
    create table if not exists Student(
      id int not null serial primary key,
      name varchar(64) not null,
      email varchar(32) not null check(email like "%@%"),
      constraint student_school foreign key(student_school) refferences School(id)
    )`)

    await pool.query(`
    create type semester as ENUM("first", "second", "both")`)

    //TODO: check for chorarium?
    await pool.query(`
    create table if not exists Subject(
      id int not null serial primary key,
      name varchar(64) not null,
      chorarium int not null,
      semester semester notnull
    )`)

    //tables class_subject & teacher_subject
    await pool.query(`
    create table if not exists ClassSubject(
      id int not null serial primary key,
      constraint class_subject foreign key(class_subject) references Class(id),
      constraint subject_class foreign key(subject_class) references Subject(id)
    )`)

    await pool.query(`
    create table if not exists TeacherSubject(
      id int not null serial primary key, 
      constraint teacher_subject foreign key(teacher_subject) references Teacher(id),
      cosntraint subject_teacher foreign key(subject_teacher) references Subject(id)
    )`)

    await pool.query(`
    create type week_type as ENUM("odd", "even", "both")`)

    await pool.query(`
    create type weekday as ENUM("monday", "tuesday", "wednesday", "thursday", "friday")`)

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
  export async function addSchool(name, domain, type) {
    await pool.query("insert into School(name, domain, type) values($1, $2, $3)", name, domain, type)
  }

  export async function removeSchool(domain) {
    await pool.query("delete from School where domain = $1", domain)
  }

  const getSchoolId = async (domain) => {
    try {
      result = await pool.query(`select id from School where domain = $1`, domain);
      if (result.rows.lenght > 0) {
        return result.row[0].domain;
      }
      else {
        throw new Error("School domain not found")
      } 
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  //add & remove student
  //TODO: parse email for school domain
  export async function addStudent(name, email){
    try{
      school_id = getSchoolId(domain);
    }
    catch (error) {
      console.error(error);
    }
    await pool.query("insert into Student(name, email, student_school) values($1, $2, $3)", name, email, school_id)
  }

  export async function removeStudent() {
    //TODO: remove
  }

  //TODO: format classes?

  //TODO: add & remove staff

  //TODO: add & remove subject

  //TODO: add subjects to teachers

  //TODO: get teacher's subjects
  export async function getTeacherSubjects() {
    await pool.query("select")
  }

  //TODO: get class' subjects

  //TODO: insert into schedule table