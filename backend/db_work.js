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

    await pool.query(`
    create type teacher_type as ENUM("full-time", "part-time")`);

    await pool.query(`
    create table if not exists Teacher(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(64) not null,
      type teacher_type not null,
      chorarium int not null check(chorarium < 40),
      constraint teacher_school
        foreign key(teacher_school)
          references School(id)
    )`);

    await pool.query(`
    create table if not exists Admin(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(64) not null, 
      constraint admin_school
        foreign key(admin_school)
          references School(id)
    )`);
    
    await pool.query(`
    create table if not exists Class(
      id int not null serial primary key,
      paralelka varchar(5) not null unique,
      graduation_year int not null check(grad_year < CURRENT_DATE),
      constraint class_teacher foreign key(class_teacher) references Teacher(id)
    )`);

    await pool.query(`
    create table if not exists Student(
      id int not null serial primary key,
      name varchar(64) not null,
      email varchar(32) not null check(email like "%@%"),
      constraint school_id foreign key(school_id) refferences School(id)
    )`);

    await pool.query(`
    create type semester as ENUM("first", "second", "both")`);

    await pool.query(`
    create table if not exists Subject(
      id int not null serial primary key,
      name varchar(64) not null,
      chorarium int not null check(chorarium < 40),
      semester semester notnull
    )`);

    //tables class_subject & teacher_subject
    await pool.query(`
    create table if not exists ClassSubject(
      id int not null serial primary key,
      constraint class_subject foreign key(class_subject) references Class(id),
      constraint subject_class foreign key(subject_class) references Subject(id)
    )`);

    await pool.query(`
    create table if not exists TeacherSubject(
      id int not null serial primary key, 
      constraint teacher_id foreign key(teacher_id) references Teacher(id),
      cosntraint subject_id foreign key(subject_id) references Subject(id)
    )`);

    await pool.query(`
    create type week_type as ENUM("odd", "even", "both")`);

    await pool.query(`
    create type weekday as ENUM("monday", "tuesday", "wednesday", "thursday", "friday")`);

    await pool.query(`
    create table if not exists Chas(
      id int serial primary key,
      constraint subject_taught foreign key(subject) references Subject(id),
      week_taught week_type not null,
      weekday_taught weekday not null,
      start_time time not null,
      end_time time not null,
      semester semester not null
    )`);
    }

  //add & remove school 
  export async function isSchoolType(value) {
    const result = await pool.query(`select exists (select 1 from school_type 
      where typname = 'school_type' 
      and $1::status_enum is not null)`);
      return (result.rows[0].exists);
  }

  export async function addSchool(name, domain, type) {
    await pool.query("insert into School(name, domain, type) values($1, $2, $3)", name, domain, type);
  }

  export async function removeSchool(domain) {
    await pool.query("delete from School where domain = $1", domain);
  }

  const getSchoolId = async (domain) => {
    try {
      result = await pool.query(`select id from School where domain = $1`, domain);
      if (result.rows.lenght > 0) {
        return result.row[0].domain;
      }
      else {
        throw new Error("School domain not found");
      } 
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  const getStudentId = async (email) => {
    try {
      result = await pool.query('select id from Student where email = $1', email);
      if (result.row[0].lenght > 0)
        return result.row[0].id;
      else 
        throw new Error("Student with that email not found");
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  //add & remove student
  //TODO: error for nonexistent school?
  export async function addStudent(name, email){
    const match = email.match(/@(.*)/); 
    const domain = match[0];
    try {
      school_id = getSchoolId(domain);
    }
    catch (error) {
      console.error(error);
    }
    await pool.query("insert into Student(name, email, student_school) values($1, $2, $3)", name, email, school_id)
  }

  export async function removeStudent(email) {
    try {
      student_id = getStudentId(email);
    }
    catch (error) {
      console.error(error);
    }
    await pool.query("delete from Student where id = $1", student_id);
  }

  //add & remove class
  export async function addClass(paralelka, grad_year) {
    await pool.query(`insert into Class (paralelka, graduation_year) values($1, $2)`, paralelka, grad_year);
  }

  const getClassId = async (paralelka) => {
    try {
      result = await pool.query('select id from Class where paralelka = $1', paralelka);
      if (result.row[0].lenght > 0)
        return result.row[0].id;
      else 
        throw new Error("Class with that subgroup not found");
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  //format classes
  export async function studentIntoClass(email, paralelka) {
    const class_id = getClassId(paralelka);
    const student_id = getStudentId(email);
    await pool.query(`update Student set school_id = $1 where id = $2`, class_id, student_id);
  }

  const getStaffId = async (email) => {
    try {
      result = await pool.query('select id from Staff where email = $1', email);
      if (result.row[0].lenght > 0)
        return result.row[0].id;
      else 
        throw new Error("Staff with that email not found");
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  //add & remove staff
  export async function addStaff(name, email){
    const match = email.match(/@(.*)/); 
    const domain = match[0];
    try {
      school_id = getSchoolId(domain);
    }
    catch (error) {
      console.error(error);
    }
    await pool.query("insert into Staff(name, email, student_school) values($1, $2, $3)", name, email, school_id)
  }

  export async function removeStaff(email) {
    try {
      staff_id = getStaffId(email);
    }
    catch (error) {
      console.error(error);
    }
    await pool.query("delete from Staff where id = $1", staff_id);
    await pool.query("delete from Teacher where id = $1", staff_id);
    await pool.query("delete from Admin where id = $1", staff_id);
  }

  export async function isTeacherType(value) {
    const result = await pool.query(`select exists (select 1 from teacher_type 
      where typname = 'teacher_type' 
      and $1::status_enum is not null)`);
      return (result.rows[0].exists);
  }

  //split staff into teachers and admins
  export async function staffIntoTeacher(email, type, chorarium) {
    staff_id = getStaffId(email);
    await pool.query(`insert into Teacher (id, name, email, type, chorarium, school_id)
    select id, name, email, $1, $2, staff_school from Staff`, type, chorarium);
  }
 
  export async function staffIntoAdmin(email) {
    staff_id = getStaffId(email);
    await pool.query(`insert into Admin (id, name, email, school_id)
    select id, name, email, staff_school from Staff`);
  }
 
  const getSubjectId = async (name, chorarium, semester) => {
    try {
      result = await pool.query('select id from Subject where name = $1, chorarium = $2, semester = $3', name, chorarium, semester);
      if (result.row[0].lenght > 0)
        return result.row[0].id;
      else 
        throw new Error("Subject like that not found");
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }
 
  //add & remove subject
  export async function addSubject(name, chorarium, semester) {
    await pool.query(`insert into Subject (name, chorarium, semester) values ($1, $2, $3)`, name, chorarium, semester);
  }
 
  export async function removeSubject(name, chorarium, semester) {
    const subject_id = getSubjectId(name, chorarium, semester);
    await pool.query(`delete from Subject where id = $1`, subject_id);
    await pool.query(`delete from TeacherSubject where subject_id = $1`, subject_id);
    await pool.query(`delete from ClassSubject where subject_id = $1`, subject_id);
  }

  //add subjects to teachers
  export async function subjectToTeacher(name, chorarium, semester, email) {
    const teacher_id = getTeacherId(email);
    const subject_id = getSubjectId(name, chorarium, semester);
    await pool.query(`insert into TeacherSubject (teacher_id, subject_id) values($1, $2)`, teacher_id, subject_id);
  }
 
  //add subjects to classess 
  export async function subjectToClass(name, chorarium, semester, paralelka) {
    const class_id = getClassId(paralelka);
    const subject_id = getSubjectId(name, chorarium, semester);
    await pool.query(`insert into ClassSubject (class_id, subject_id) values($1, $2)`, class_id, subject_id);
  }

  const getTeacherId = async (email) => {
    try {
      result = await pool.query('select id from Teacher where email = $1', email);
      if (result.row[0].lenght > 0)
        return result.row[0].id;
      else 
        throw new Error("Teacher with that email not found");
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  //get teacher's subjects
  export async function getTeacherSubjects() {
    const teacher_id = getTeacherId;
    const result = await pool.query(`select name, chorarium, semester from Subject 
    left join TeacherSubject on TeacherSubject.subject_id = Subject.id 
    where TeacherSubject.teacher_id = $1`, teacher_id);
    //TODO: reformat result into an array to return
  }

  //get class' subjects
  export async function getClassSubjects(paralelka) {
    const class_id = getClassId(paralelka);
    const result = await pool.query(`select name, chorarium, semester from Subject 
    left join ClassSubject on ClassSubject.subject_id = Subject.id 
    where ClassSubject.class_id = $1`, class_id);
    //TODO: reformat result into an array to return
  }

  //TODO: insert into schedule table
  export async function insertIntoSchedule();