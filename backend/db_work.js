import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    database: 'diplomna',
    password: 'pgsqlpassword',
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
      constraint staff_school foreign key(staff_school) references School(id)
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
      constraint teacher_school foreign key(teacher_school) references School(id)
    )`);

    await pool.query(`
    create table if not exists Admin(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(64) not null, 
      constraint admin_school foreign key(admin_school) references School(id)
    )`);
    
    await pool.query(`
    create table if not exists Grade(
      id int not null serial primary key,
      subgroup varchar(5) not null unique,
      graduation_year int not null check(grad_year < CURRENT_DATE),
      constraint grade_teacher foreign key(grade_teacher) references Teacher(id),
      constraint school_grade foreign key(school_grade) references School(id)
    )`);

    await pool.query(`
    create table if not exists Student(
      id int not null serial primary key,
      name varchar(64) not null,
      email varchar(32) not null check(email like "%@%"),
      constraint school_id foreign key(school_id) refferences School(id)
    )`);

    await pool.query(`
    create type term as ENUM("first", "second", "both")`);

    await pool.query(`
    create table if not exists Subject(
      id int not null serial primary key,
      name varchar(64) not null,
      chorarium int not null check(chorarium < 40),
      term term not null,
      constraint school_id foreign key(school_id) refferences School(id)
    )`);

    //tables subject_grade_teacher 
    await pool.query(`
    create table if not exists SubjectGradeTeacher(
      id int not null serial primary key,
      constraint subject_id foreign key(subject_id) references Subject(id)
      constraint grade_id foreign key(grade_id) references Grade(id),
      constraint teacher_id foreign key(teacher_id) references Teacher(id)
    )`);

    await pool.query(`
    create type week_type as ENUM("odd", "even", "both")`);

    await pool.query(`
    create type weekday as ENUM("monday", "tuesday", "wednesday", "thursday", "friday")`);

    await pool.query(`
    create table if not exists Class(
      id int serial primary key,
      constraint subject foreign key(subject_taught) references SubjectGradeTeacher(id),
      week_taught week_type not null,
      weekday_taught weekday not null,
      start_time time not null,
      end_time time not null,
      term term not null,
      constraint school foreign key(school) references School(id)
    )`);
    }

  //add & remove school 
  export async function isSchoolType(value) {
    const result = await pool.query(`select exists (select 1 from school_type 
      where typname = 'school_type' 
      and $1::status_enum is not null)`, value);
      return (result.rows[0].exists);
  }

  export async function addSchool(name, domain, type) {
    const result = await pool.query(`insert into School(name, domain, type) values($1, $2, $3)
    returning id, name`, name, domain, type);
    return result;  
  }

  export async function removeSchool(school_id) {
    await pool.query("delete from School where id = $1", school_id);
  }

  //add & remove student
  export async function addStudent(name, email, school_id){
    const result = await pool.query(`insert into Student(name, email, student_school) values($1, $2, $3)
    returning id, name`, name, email, school_id);
    return result;
  }

  export async function removeStudent(student_id) {
    await pool.query("delete from Student where id = $1", student_id);
  }

  export async function getStudent(student_id, school_id) {
    const result = await pool.query(`select name, email from Student 
    where Student(id) = $1 and Student(school_id) = $2`, student_id, school_id);
    return result;
  }

  //add & remove grade
  export async function addGrade(subgroup, grad_year) {
    const result = await pool.query(`insert into Grade (subgroup, graduation_year) values($1, $2) 
    returning id, subgroup`, subgroup, grad_year);
    return result;
  }

  //format grades
  export async function studentIntoGrade(student_id, grade_id) {
    await pool.query(`update Student set school_id = $1 where id = $2`, grade_id, student_id);
  }

  //add & remove staff
  export async function addStaff(name, email, school_id){
    const result = await pool.query(`insert into Staff(name, email, student_school) values($1, $2, $3)
    returnig id, name`, name, email, school_id);
    return result;
  }

  export async function removeStaff(staff_id) {
    await pool.query("delete from Staff where id = $1", staff_id);
    await pool.query("delete from Teacher where id = $1", staff_id);
    await pool.query("delete from Admin where id = $1", staff_id);
  }

  export async function getStaff(staff_id) {
    const result = await pool.query(`select name, email from Staff where Staff(id) = $1`, staff_id);
    return result;
  }

  export async function isTeacherType(value) {
    const result = await pool.query(`select exists (select 1 from teacher_type 
      where typname = 'teacher_type' 
      and $1::status_enum is not null)`, value);
      return result.rows[0].exists;
  }

  //split staff into teachers and admins
  export async function staffIntoTeacher(staff_id, type, chorarium) {
    const result = await pool.query(`insert into Teacher (id, name, email, type, chorarium, school_id)
    select id, name, email, $1, $2, staff_school from Staff
    where Staff(id) = $1 returning id, name`, type, chorarium, staff_id);
    return result;
  }

  export async function getTeacher(teacher_id) {
    const result = await pool.query(`select name, email, chorarium, type from Teacher where Teacher(id) = $1`, teacher_id);
    return result;
  }
 
  export async function staffIntoAdmin(staff_id) {
    const result = await pool.query(`insert into Admin (id, name, email, school_id)
    select id, name, email, staff_school from Staff
    where Staff(id) = $1 returning id, name`, staff_id);
    return result;
  }

  export async function isTermType(value) {
    const result = await pool.query(`select exists (select 1 from term 
      where typname = 'term' and $1::status_enum is not null)`, value);
      return result.rows[0].exists;
  }
 
  //add & remove subject
  export async function addSubject(name, chorarium, term, school_id) {
    const result = await pool.query(`insert into Subject (name, chorarium, term, school_id) 
    values ($1, $2, $3, $4) returning id, name`, name, chorarium, term, school_id);
    return result;
  }
 
  export async function removeSubject(subject_id) {
    await pool.query(`delete from Subject where id = $1`, subject_id);
    await pool.query(`delete from subjectGradeTeacher where subject_id = $1`, subject_id);
  }

  export async function getSubject(subject_id) {
    const result = await pool.query(`select name, chorarium, term from Subject where Subject(id) = $1`, subject_id);
    return result;
  }

  //add subjects to grades and teachers
  export async function subjectTeacherGrade(subject_id, grade_id, teacher_id) {
    const result = await pool.query(`insert into SubjectGradeTeacher (subject_id, grade_id, teacher_id) 
    values ($1, $2, $3) returning id`, subject_id, grade_id, teacher_id);
    return result;
  }
  
  //get teacher's subjects
  export async function getTeacherSubjects(teacher_id) {
    const result = await pool.query(`select name, chorarium, term from Subject 
    left join SubjectGradeTeacher as SCT on SCT.subject_id = Subject.id 
    where SCT.teacher_id = $1`, teacher_id);
    //TODO: reformat result into an array to return
    return result;
  }

  //get grade' subjects
  export async function getGradeSubjects(grade_id) {
    const result = await pool.query(`select name, chorarium, term from Subject 
    left join SubjectGradeTeacher as SCT on SCT.subject_id = Subject.id 
    where SCT.grade_id = $1`, grade_id);
    //TODO: reformat result into an array to return
    return result;
  }

  //TODO: insert into schedule table
  export async function insertIntoSchedule(){
    //no
  }

  export async function getSchedule(school_id) {
    const result = await pool.query(`select * from Class where Class(school_id) = $1`, school_id);
    return result;
  }