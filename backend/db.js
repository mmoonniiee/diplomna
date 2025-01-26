import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  //connect
  await pool.connect();

  //create all the tables
  export async function createTables() {
    await pool.query(`
    create type user_type as ENUM("site_admin", "student", "teacher", "school_admin", "teacher_admin");
    `);

    await pool.query(`
    create table if not exists User (
      id int not null serial primary key,
      google_id varchar(128) not null,
      name varchar(64) not null,
      email varchar(64) not null unique,
      role user_role not null
    )`);
    
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
      id int not null primary key,
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
    create type shift as ENUM("first", "second")`);

    await pool.query(`
    create table if not exists Grade(
      id int not null serial primary key,
      subgroup varchar(5) not null unique,
      graduation_year int not null check(grad_year < CURRENT_DATE),
      1st_term shift not null,
      2nd_term shift not null,
      constraint grade_teacher foreign key(grade_teacher) references Teacher(id),
      constraint school_grade foreign key(school_grade) references School(id)
    )`);

    await pool.query(`
    create table if not exists Student(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(32) not null check(email like "%@%"),
      constraint school_id foreign key(school_id) refferences School(id)
    )`);

    await pool.query(`
    create table if not exists Awaiting (
      email varchar(64) not null unique,
      role user_role not null check (role > 0),
      chorarium int,
      teacher_type teacher_type,
      constraint school_id foreign key(school_id) references School(id),
      constraint grade_id foreign key(grade_id) references Grade(id)
    )`);

    await pool.query(`
    create type term as ENUM("both", "first", "second")`);

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
      id int serial primary key not null,
      constraint subject foreign key(subject_taught) references SubjectGradeTeacher(id),
      week_taught week_type not null,
      weekday_taught weekday not null,
      start_time time not null,
      end_time time not null,
      term term not null,
      constraint school foreign key(school) references School(id)
    )`);
    }

  //TODO: get school types??
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

  const getSchoolId = async (domain) => {
    try {
      result = await pool.query(`select id from School where domain = $1`, domain);
      if (result.rows.length > 0) {
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

  //add & remove student
  async function addStudent(email){
    const result = await pool.query(`select id, name from User where email = $1`, email);
    if(!result.rows.length > 0) {
      throw new Error(`there's no user like that`);
    }
    const match = email.match(/@(.*)/); 
    const domain = match[0];
    try {
      school_id = getSchoolId(domain);
    }
    catch (error) {
      console.error(error);
    }
    const id = await pool.query(`insert into Student(id, name, email, student_school) 
    values($1, $2, $3) returning id, name`, result.rows.id, result.rows.name, email, school_id);
    return id;
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

  export async function getGrade(grade_id) {
    const result = await pool.query(`select * from Grade where id = $1`, grade_id);
    return result;
  }

  export async function getAllGrades(school_id) {
    const result = await pool.query(`select * from Grade where school_id = $1`, school_id);
    return result; 
  }

  //format grades
  export async function studentIntoGrade(student_id, grade_id) {
    await pool.query(`update Student set school_id = $1 where id = $2`, grade_id, student_id);
  }

  export async function addAwaiting() {

  }

  //add & remove staff
  export async function addStaff(email){
    const result = await pool.query(`select id, name from User where email = $1`, email);
    if(!result.rows.length > 0) {
      throw new Error(`there's no user like that`);
    }
    const match = email.match(/@(.*)/); 
    const domain = match[0];
    try {
      school_id = getSchoolId(domain);
    }
    catch (error) {
      console.error(error);
    }
    const id = await pool.query(`insert into Staff(id, name, email, staff_school) 
    values($1, $2, $3, $4) returning id, name`, result.rows.id, result.rows.name, email, school_id);
    return id;
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
  async function staffIntoTeacher(staff_id, type, chorarium) {
    const result = await pool.query(`insert into Teacher (id, name, email, type, chorarium, school_id)
    select id, name, email, $1, $2, staff_school from Staff
    where Staff(id) = $1 returning id, name`, type, chorarium, staff_id);
    return result;
  }

  export async function getTeacher(teacher_id) {
    const result = await pool.query(`select name, email, chorarium, type from Teacher where Teacher(id) = $1`, teacher_id);
    return result;
  }

  export async function getAllTeachers(school_id) {
    const result = await pool.query(`select * from Teacher where school_id = $1`, school_id);
    return result;
  }
 
  async function staffIntoAdmin(staff_id) {
    const result = await pool.query(`insert into Admin (id, name, email, school_id)
    select id, name, email, staff_school from Staff
    where Staff(id) = $1 returning id, name`, staff_id);
    return result;
  }

  export async function findOrCreate(google_id, name, email) {
    const user = await pool.query(`select * from User where google_id = $1`, google_id);
    if(user.rows.length > 0) {
      return user;
    }
    const result = await pool.query(`select * from Awaiting where email = $1`, email);
    if(result.rows.length > 0) {
      if(result.rows.role == 1) { //maybe change this to ==="student" and so on
        const newStudent = await pool.query(`insert into User (google_id, name, email, role) 
        values($1, $2, $3, $4) returning id, name, email, role`, google_id, name, email, 1);
        addStudent(email);
        return newStudent;
      }
      if(result.rows.role == 2) {
        const newTeacher = await pool.query(`insert into User (google_id, name, email, role) 
        values($1, $2, $3, $4) returning id, name, email, role`, google_id, name, email, 2);
        addStaff(email);
        if((!result.rows.chorarium) || (!result.rows.teacher_type)) {
          throw new Error(`not enough data to create teacher`);
        }
        const id = await pool.query(`select id from Staff where email = $1`, email);
        staffIntoTeacher(id.rows.id, result.rows.chorarium, result.rows.teacher_type);
        return newTeacher;
      }
      if(result.rows.role == 3) {
        const newAdmin = await pool.query(`insert into User (google_id, name, email, role) 
        values($1, $2, $3, $4) returning id, name, email, role`, google_id, name, email, 3);
        addStaff(email);
        const id = await pool.query(`select id from Staff where email = $1`, email);
        staffIntoAdmin(id.rows.id);
        return newAdmin;
      }
      if(result.rows.role == 4) {
        const newStaff = await pool.query(`insert into User (google_id, name, email, role) 
        values($1, $2, $3, $4) returning id, name, email, role`, google_id, name, email, 2);
        addStaff(email);
        if((!result.rows.chorarium) || (!result.rows.teacher_type)) {
          throw new Error(`not enough data to create teacher`);
        }
        const id = await pool.query(`select id from Staff where email = $1`, email);
        staffIntoTeacher(id.rows.id, result.rows.chorarium, result.rows.teacher_type);
        staffIntoAdmin(id.rows.id);
        return newStaff;
      }
    }
  }

  export async function getUser(id) {
    const result = await pool.query(`select * from User where google_id = $1`, id);
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
    left join SubjectGradeTeacher as SGT on SGT.subject_id = Subject.id 
    where SGT.teacher_id = $1`, teacher_id);
    //TODO: reformat result into an array to return
    return result;
  }

  //get grade' subjects
  export async function getGradeSubjects(grade_id) {
    const result = await pool.query(`select id, name, chorarium, term from Subject 
    left join SubjectGradeTeacher as SGT on SGT.subject_id = Subject.id 
    where SGT.grade_id = $1`, grade_id);
    //TODO: reformat result into an array to return
    return result;
  }

  //TODO: insert into schedule table
  export async function insertIntoSchedule(sgt_id, week_taught, weekday_taught, start_time, end_time, term, school_id){
    await pool.query(`insert into Class values(subject_taught, week_taught, weekday_taught, start_time, end_time, term, school_id)
    values ($1, $2, $3, $4, $5, $6, $7)`, sgt_id, week_taught, weekday_taught, start_time, end_time, term, school_id);
  }

  export async function getGradeSchedule(grade_id) {
    const result = await pool.query(`select * from Class join SubjectGradeTeacher as SGT 
    on Class.subject_taught = SGT.id where SGT.grade_id = $1`, grade_id);
    return result;
  }

  export async function getTeacherSchedule(teacher_id) {
    const result = await pool.query(`select * from Class join SubjectGradeTeacher as SGT 
    on Class.subject_taught = SGT.id where SGT.teacher_id = $1`, teacher_id);
    return result;
  }