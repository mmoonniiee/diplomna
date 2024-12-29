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
    create table if not exists Grade(
      id int not null serial primary key,
      subgroup varchar(5) not null unique,
      graduation_year int not null check(grad_year < CURRENT_DATE),
      constraint grade_teacher foreign key(grade_teacher) references Teacher(id)
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

  export async function removeSchool(school_id) {
    await pool.query("delete from School where id = $1", school_id);
  }

  //add & remove student
  export async function addStudent(name, email, school_id){
    await pool.query("insert into Student(name, email, student_school) values($1, $2, $3)", name, email, school_id)
  }

  export async function removeStudent(student_id) {
    await pool.query("delete from Student where id = $1", student_id);
  }

  //add & remove grade
  export async function addGrade(subgroup, grad_year) {
    await pool.query(`insert into Grade (subgroup, graduation_year) values($1, $2)`, subgroup, grad_year);
  }

  //format grades
  export async function studentIntoGrade(student_id, grade_id) {
    await pool.query(`update Student set school_id = $1 where id = $2`, grade_id, student_id);
  }

  //add & remove staff
  export async function addStaff(name, email, school_id){
    await pool.query("insert into Staff(name, email, student_school) values($1, $2, $3)", name, email, school_id)
  }

  export async function removeStaff(staff_id) {
    await pool.query("delete from Staff where id = $1", staff_id);
    await pool.query("delete from Teacher where id = $1", staff_id);
    await pool.query("delete from Admin where id = $1", staff_id);
  }

  export async function isTeacherType(value) {
    const result = await pool.query(`select exists (select 1 from teacher_type 
      where typname = 'teacher_type' 
      and $1::status_enum is not null)`, value);
      return result.rows[0].exists;
  }

  //split staff into teachers and admins
  export async function staffIntoTeacher(staff_id, type, chorarium) {
    await pool.query(`insert into Teacher (id, name, email, type, chorarium, school_id)
    select id, name, email, $1, $2, staff_school from Staff
    where Staff(id) = $1`, type, chorarium, staff_id);
  }
 
  export async function staffIntoAdmin(staff_id) {
    await pool.query(`insert into Admin (id, name, email, school_id)
    select id, name, email, staff_school from Staff
    where Staff(id) = $1`, staff_id);
  }

  export async function isSemesterType(value) {
    const result = await pool.query(`select exists (select 1 from semester 
      where typname = 'semester' and $1::status_enum is not null)`, value);
      return result.rows[0].exists;
  }
 
  //add & remove subject
  export async function addSubject(name, chorarium, semester) {
    await pool.query(`insert into Subject (name, chorarium, semester) values ($1, $2, $3)`, name, chorarium, semester);
  }
 
  export async function removeSubject(subject_id) {
    await pool.query(`delete from Subject where id = $1`, subject_id);
    await pool.query(`delete from TeacherSubject where subject_id = $1`, subject_id);
    await pool.query(`delete from GradeSubject where subject_id = $1`, subject_id);
  }

  //add subjects to grades and teachers
  export async function subjectTeacherGrade(subject_id, grade_id, teacher_id) {
    await pool.query(`insert into SubjectGradeTeacher (subject_id, grade_id, teacher_id) 
    values ($1, $2, $3)`, subject_id, grade_id, teacher_id);
  }
  
  //get teacher's subjects
  export async function getTeacherSubjects(teacher_id) {
    const result = await pool.query(`select name, chorarium, semester from Subject 
    left join SubjectGradeTeacher as SCT on SCT.subject_id = Subject.id 
    where SCT.teacher_id = $1`, teacher_id);
    //TODO: reformat result into an array to return
  }

  //get grade' subjects
  export async function getGradeSubjects(grade_id) {
    const result = await pool.query(`select name, chorarium, semester from Subject 
    left join SubjectGradeTeacher as SCT on SCT.subject_id = Subject.id 
    where SCT.grade_id = $1`, grade_id);
    //TODO: reformat result into an array to return
  }

  //TODO: insert into schedule table
  export async function insertIntoSchedule(){
    //no
  }