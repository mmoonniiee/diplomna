import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

export async function createTables() {
  //WARNING: may cause SQL injection if untrusted input is passed. Use it ONLY for migrations!!
  async function ignore_duplicate(line) {
    await pool.query(`
      DO $$ BEGIN
        ${line}
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`);
  }
  
  try {
    await ignore_duplicate(`create type user_role as ENUM ('site_admin', 'student', 'teacher', 'school_admin', 'teacher_admin');`);

    await pool.query(`  
    create table if not exists "User" (
      id serial primary key,
      google_id varchar(256) not null,
      name varchar(64) not null,
      email varchar(64) not null unique,
      role user_role not null
    )`);
    
    await ignore_duplicate(`create type school_type as ENUM('elementary', 'middle', 'high', 'college');`);

    await pool.query(`
    create table if not exists School (
      id serial primary key,
      name varchar(256) not null,
      domain varchar(32) check(domain like '@%') unique not null,
      "type" school_type not null
    )`);

    await pool.query(`
    create table if not exists Staff (
      id int not null primary key, 
      name varchar(64) not null,
      email varchar(64) not null,
      staff_school int not null,
      constraint staff_school foreign key(staff_school) references School(id)
    )`);

    await ignore_duplicate(`create type teacher_type as ENUM('full-time', 'part-time');`);

    await pool.query(`
    create table if not exists Teacher(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(64) not null,
      "type" teacher_type not null,
      chorarium int not null check(chorarium < 40),
      schedule_see boolean default false,
      teacher_school int not null,
      constraint teacher_school foreign key(teacher_school) references School(id)
    )`);

    await pool.query(`
    create table if not exists Admin(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(64) not null, 
      admin_school int not null,
      constraint admin_school foreign key(admin_school) references School(id)
    )`);
    
    await ignore_duplicate(`create type shift as ENUM('first', 'second');`);

    await pool.query(`
    create table if not exists Grade(
      id serial primary key,
      subgroup varchar(5) not null unique,
      graduation_year int not null check(graduation_year > extract(year from CURRENT_DATE)),
      first_term shift not null,
      second_term shift not null,
      grade_teacher int not null,
      schedule_see boolean default false,
      school_grade int not null,
      constraint grade_teacher foreign key(grade_teacher) references Teacher(id),
      constraint school_grade foreign key(school_grade) references School(id)
    )`);

    await pool.query(`
    create table if not exists Student(
      id int not null primary key,
      name varchar(64) not null,
      email varchar(32) not null,
      school_id int not null,
      grade_id int not null,
      constraint school_id foreign key(school_id) references School(id),
      constraint grade_id foreign key(grade_id) references Grade(id)
    )`);

    await pool.query(`
    create table if not exists Awaiting (
      id serial primary key,
      email varchar(64) not null unique,
      role user_role not null check(role <> 'site_admin'),
      chorarium int check(chorarium < 40),
      teacher_type teacher_type,
      school_id int not null,
      grade_id int,
      constraint school_id foreign key(school_id) references School(id),
      constraint grade_id foreign key(grade_id) references Grade(id)
    )`);

    await ignore_duplicate(`create type term as ENUM('both', 'first', 'second');`);

    await pool.query(`
    create table if not exists Subject(
      id serial primary key,
      name varchar(64) not null,
      chorarium int not null check(chorarium < 40),
      term term not null,
      school_id int not null,
      constraint school_id foreign key(school_id) references School(id)
    )`);

    await pool.query(`
    create table if not exists SubjectGradeTeacher(
      id serial primary key,
      subject_id int not null,
      grade_id int not null,
      teacher_id int not null,
      constraint subject_id foreign key(subject_id) references Subject(id),
      constraint grade_id foreign key(grade_id) references Grade(id),
      constraint teacher_id foreign key(teacher_id) references Teacher(id)
    )`);

    await ignore_duplicate(`create type week_type as ENUM('odd', 'even', 'both');`);

    await ignore_duplicate(`create type weekday as ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday');`);

    await pool.query(`
    create table if not exists Class(
      id serial primary key,
      week_taught week_type not null,
      weekday_taught weekday not null,
      class_number int not null,
      start_time time not null,
      end_time time not null,
      term term not null,
      school_id int not null,
      subject_taught int not null,
      constraint subject foreign key(subject_taught) references SubjectGradeTeacher(id),
      constraint school_id foreign key(school_id) references School(id)
    )`);
  } finally {
    //pool.end();
  }
}

export async function getSchoolTypes() {
  const result = await pool.query(`select e.enumlabel from pg_enum as e
  left join pg_type as t on t.oid = e.enumtypid where t.typname = 'school_type'
  order by t.typname, e.enumsortorder;`);
  return result.rows.map((row) => row.enumlabel);
}

export async function isSchoolType(value) {
  const result = await pool.query(`select exists (select 1 from school_type 
    where typname = 'school_type' 
    and $1::status_enum is not null)`, [value]);
  return (result.rows[0].exists);
}

export async function addSchool(name, domain, type) {
  const result = await pool.query(`insert into School(name, domain, type) values($1, $2, $3)
  returning id, name`, [name, domain, type]);
  return result.rows;
}

export async function removeSchool(school_id) {
  await pool.query("delete from School where id = $1", [school_id]);
}

const getSchoolId = async (domain) => {
  try {
    const result = await pool.query(`select id from School where domain = $1`, [domain]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
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

async function addStudent(email){
  const result = await pool.query(`select id, name from "User" where email = $1`, [email]);
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
  values($1, $2, $3) returning id, name`, [result.rows.id, result.rows.name, email, school_id]);
  return id.rows;
}

export async function removeStudent(student_id) {
  await pool.query("delete from Student where id = $1", [student_id]);
}

export async function getStudent(student_id, school_id) {
  const result = await pool.query(`select name, email from Student 
  where id = $1 and school_id = $2`, [student_id, school_id]);
  return result.rows;
}

export async function getShifts() {
  const result = await pool.query(`select e.enumlabel from pg_enum as e
  left join pg_type as t on t.oid = e.enumtypid where t.typname = 'shift'
  order by t.typname, e.enumsortorder;`);
  return result.rows.map((row) => row.enumlabel);
}

export async function addGrade(subgroup, grad_year, first_shift, second_shift, teacher_id, school_id) {
  const result = await pool.query(`insert into Grade (subgroup, graduation_year, first_term, 
  second_term, grade_teacher, school_grade) values($1, $2, $3, $4, $5, $6) 
  returning id, subgroup`, [subgroup, grad_year, first_shift, second_shift, teacher_id, school_id]);
  return result.rows;
}

export async function getGrade(grade_id) {
  const result = await pool.query(`select * from Grade where id = $1`, [grade_id]);
  return result.rows;
}

export async function getStudentGrade(student_id) {
  const result = await pool.query(`select grade_id from Student where id = $1`, [student_id]);
  return result.rows;
}

export async function getAllGrades(school_id) {
  const result = await pool.query(`select * from Grade where school_grade = $1`, [school_id]);
  return result.rows; 
}

export async function studentIntoGrade(student_id, grade_id) {
  await pool.query(`update Student set school_id = $1 where id = $2`, [grade_id, student_id]);
}

export async function addAwaiting(email, role, chorarium, teacher_type, school_id, grade_id) {
  const result = await pool.query(`insert into Awaiting(email, role, school_id) 
  values($1, $2, $3) returning id`, [email, role, school_id]);
  if(chorarium) {
    await pool.query(`update Awaiting set chorarium = $1 where id = $2`, [chorarium, result.rows.id]);
  }
  if(teacher_type) {
    await pool.query(`update Awaiting set teacher_type = $1 where id = $2`, [teacher_type, result.rows.id]);
  }
  if(grade_id) {
    await pool.query(`update Awaiting set grade_id = $1 where id = $2`, [grade_id, result.rows.id]);
  }
  return result.rows.id;
}

export async function addStaff(email){
  const result = await pool.query(`select id, name from "User" where email = $1`, [email]);
  if(!result.rows.length > 0) {
    throw new Error(`there's no user like that`);
  }
  const match = email.match(/@(.*)/); 
  const domain = match[0];
  let school_id;
  try {
    school_id = await getSchoolId(domain);
  }
  catch (error) {
    console.error(error);
  }
  const id = await pool.query(`insert into Staff(id, name, email, staff_school) 
  values($1, $2, $3, $4) returning id, name`, [result.rows[0].id, result.rows[0].name, email, school_id]);
  return id.rows;
}

export async function removeStaff(staff_id) {
  await pool.query("delete from Staff where id = $1", [staff_id]);
  await pool.query("delete from Teacher where id = $1", [staff_id]);
  await pool.query("delete from Admin where id = $1", [staff_id]);
}

export async function getStaff(staff_id) {
  const result = await pool.query(`select name, email from Staff where Staff(id) = $1`, [staff_id]);
  return result.rows;
}

export async function isTeacherType(value) {
  const result = await pool.query(`select exists (
    select 1 from pg_enum as e join pg_type as t
    on t.oid = e.enumtypid where t.typname = 'teacher_type' 
    and e.enumlabel = $1)`, [value]);
  return result.rows[0].exists;
}

export async function staffIntoTeacher(staff_id, type, chorarium) {
  const result = await pool.query(`insert into Teacher (id, name, email, type, 
  chorarium, teacher_school) select id, name, email, $2, $3, staff_school 
  from Staff where id = $1 returning id, name, teacher_school`, [staff_id, type, chorarium]);
  return result.rows;
}

export async function getTeacher(teacher_id) {
  const result = await pool.query(`select name, email, chorarium, type from Teacher where Teacher(id) = $1`, [teacher_id]);
  return result.rows;
}

export async function getAllTeachers(school_id) {
  const result = await pool.query(`select * from Teacher where teacher_school = $1`, [school_id]);
  return result.rows;
}

async function staffIntoAdmin(staff_id) {
  const result = await pool.query(`insert into Admin (id, name, email, admin_school)
  select id, name, email, staff_school from Staff
  where Staff.id = $1 returning id, name`, [staff_id]);
  return result.rows;
}

export async function findOrCreate(google_id, name, email) {
  const user = await pool.query(`select * from "User" where google_id = $1`, [google_id]);
  if(user.rows.length > 0) {
    if(user.rows[0].role === "student") {
      const student = await pool.query(`select school_id from Student where id = $1`, [user.rows[0].id]);
      return {...user.rows[0], schoolID: student.rows[0].school_id};
    }
    if(user.rows[0].role === "teacher") {
      const teacher = await pool.query(`select teacher_school from Teacher where id = $1`, [user.rows[0].id]);
      return {...user.rows[0], schoolID: teacher.rows[0].teacher_school};
    }
    if(user.rows[0].role === "school_admin") {
      const admin = await pool.query(`select admin_school from Admin where id = $1`, [user.rows[0].id]);
        return {...user.rows[0], schoolID: admin.rows[0].admin_school};
    }
    if(user.rows[0].role === "teacher_admin") {
      const teacher = await pool.query(`select teacher_school from Teacher where id = $1`, [user.rows[0].id]);
      return {...user.rows[0], schoolID: teacher.rows[0].teacher_school};
    }
  }
  const result = await pool.query(`select * from Awaiting where email = $1`, [email]);
  if(result.rows.length > 0) {
    if(result.rows[0].role === "student") { 
      const newStudent = await pool.query(`insert into "User" (google_id, name, email, role) 
      values($1, $2, $3, $4) returning id, name, email, role`, [google_id, name, email, `student`]);
      addStudent(email);
      return newStudent.rows[0];
    }
    if(result.rows[0].role === "teacher") {
      const newTeacher = await pool.query(`insert into "User" (google_id, name, email, role) 
      values($1, $2, $3, $4) returning id, name, email, role`, [google_id, name, email, `teacher`]);
      addStaff(email);
      if((!result.rows[0].chorarium) || (!result.rows[0].teacher_type)) {
        throw new Error(`not enough data to create teacher`);
      }
      const id = await pool.query(`select id from Staff where email = $1`, email);
      staffIntoTeacher(id.rows[0].id, result.rows[0].chorarium, result.rows[0].teacher_type);
      return newTeacher.rows[0];
    }
    if(result.rows[0].role == "school_admin") {
      const newAdmin = await pool.query(`insert into "User" (google_id, name, email, role)
      values($1, $2, $3, $4) returning id, name, email, role`, [google_id, name, email, `school_admin`]);
      addStaff(email);
      const id = await pool.query(`select id from Staff where email = $1`, [email]);
      staffIntoAdmin(id.rows[0].id);
      return newAdmin.rows[0];
    }
    if(result.rows[0].role === "teacher_admin") {
      const newStaff = await pool.query(`insert into "User" (google_id, name, email, role) 
      values($1, $2, $3, $4) returning id, name, email, role`, [google_id, name, email, `teacher_admin`]);
      addStaff(email);
      if((!result.rows[0].chorarium) || (!result.rows[0].teacher_type)) {
        throw new Error(`not enough data to create teacher`);
      }
      const id = await pool.query(`select id from Staff where email = $1`, email);
      staffIntoTeacher(id.rows[0].id, result.rows[0].chorarium, result.rows[0].teacher_type);
      staffIntoAdmin(id.rows[0].id);
      return newStaff.rows[0];
    }
  }
}

export async function getUser(id) {
  const result = await pool.query(`select * from "User" where google_id = $1`, [id]);
  return result.rows;
}

export async function getTerms() {
  const result = await pool.query(`select e.enumlabel from pg_enum as e
  left join pg_type as t on t.oid = e.enumtypid where t.typname = 'term'
  order by t.typname, e.enumsortorder;`);
  return result.rows.map((row) => row.enumlabel);
}

export async function isTermType(term) {
  const result = await pool.query(`select exists (
    select 1 from pg_enum as e join pg_type as t
    on t.oid = e.enumtypid where t.typname = 'term' 
    and e.enumlabel = $1)`, [term]);
  return result.rows[0].exists;
}

export async function addSubject(name, chorarium, term, school_id) {
  const result = await pool.query(`insert into Subject (name, chorarium, term, school_id) 
  values ($1, $2, $3, $4) returning id`, [name, chorarium, term, school_id]);
  return result.rows[0];
}

export async function removeSubject(subject_id) {
  await pool.query(`delete from Subject where id = $1`, [subject_id]);
  await pool.query(`delete from subjectGradeTeacher where subject_id = $1`, [subject_id]);
}

export async function getSubject(subject_id) {
  const result = await pool.query(`select * from Subject where id = $1`, [subject_id]);
  return result.rows[0];
}

export async function getSubjects(school_id) {
  const result = await pool.query(`select * from Subject where school_id = $1`, [school_id]);
  return result.rows;
}

export async function insertSubjectTeacherGrade(subject_id, grade_id, teacher_id) {
  const result = await pool.query(`insert into SubjectGradeTeacher (subject_id, grade_id, teacher_id) 
  values ($1, $2, $3) returning id`, [subject_id, grade_id, teacher_id]);
  return result.rows;
}

export async function getTeacherSubjects(teacher_id) {
  const result = await pool.query(`select Subject.id as subject_id, Subject.name, Subject.chorarium, Subject.term, SGT.id as sgt_id
  from Subject left join SubjectGradeTeacher as SGT on SGT.subject_id = Subject.id where SGT.teacher_id = $1`, [teacher_id]);
  return result.rows;
}

export async function getGradeSubjects(grade_id) {
  const result = await pool.query(`select Subject.id as subject_id, Subject.name, Subject.chorarium, Subject.term, SGT.id as sgt_id 
  from Subject left join SubjectGradeTeacher as SGT on SGT.subject_id = Subject.id where SGT.grade_id = $1`, [grade_id]);
  return result.rows;
}

export async function gradeShiftFirst(id) {
  const result = await pool.query(`select first_term from grade where id = $1`, [id]);
  return result.rows;
}

export async function gradeShiftSecond(id) {
  const result = await pool.query(`select second_term from grade where id = $1`, [id]);
  return result.rows;
}

export async function insertIntoSchedule(sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id){
  await pool.query(`insert into Class (subject_taught, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id)
  values ($1, $2, $3, $4, $5, $6, $7, $8)`, [sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id]);
}

export async function checkTeacher(sgt_id, week_taught, weekday_taught, class_number, term) {
  const result = await pool.query(`select * from Class left join subjectgradeteacher as SGT on Class.subject_taught = SGT.id
  where SGT.teacher_id = (select teacher_id from subjectgradeteacher where id = $1) and Class.week_taught = $2 and 
  Class.weekday_taught = $3 and Class.class_number = $4 and Class.term = $5`, 
  [sgt_id, week_taught, weekday_taught, class_number, term]);
  return result.rows;
}

export async function checkGrade(sgt_id, week_taught, weekday_taught, class_number, term) {
  const result = await pool.query(`select * from Class left join subjectgradeteacher as SGT on Class.subject_taught = SGT.id
  where SGT.grade_id = (select grade_id from subjectgradeteacher where id = $1) and Class.week_taught = $2 and 
  Class.weekday_taught = $3 and Class.class_number = $4 and Class.term = $5`, 
  [sgt_id, week_taught, weekday_taught, class_number, term]);
  return result.rows;
}

export async function getGradeSchedule(grade_id, term) {
  const result = await pool.query(`select Class.subject_taught, Class.week_taught, Class.weekday_taught,
  Class.class_number, Class.start_time, Class.end_time, 
  Class."term", Class.school_id, Subject.name as subject_name,
  Teacher.name as teacher_name from Class
  left join subjectgradeteacher as SGT
  on Class.subject_taught = SGT.id
  left join Subject on SGT.subject_id = Subject.id
  left join Teacher on SGT.teacher_id = Teacher.id
  where SGT.grade_id = $1 and Class."term" = $2
  order by weekday_taught, class_number`, [grade_id, term]);
  return result.rows;
}

export async function getTeacherSchedule(teacher_id, term) {
  const result = await pool.query(`select Class.subject_taught, Class.week_taught, Class.weekday_taught,
  Class.class_number, Class.start_time, Class.end_time, 
  Class.term, Class.school_id, Subject.name as subject_name,
  Grade.subgroup as subgroup from Class 
  left join subjectgradeteacher as SGT
  on Class.subject_taught = SGT.id
  left join Subject on SGT.subject_id = Subject.id
  left join Grade on SGT.grade_id = Grade.id
  where SGT.teacher_id = $1 and Class.term = $2
  order by weekday_taught, class_number`, [teacher_id, term]);
  return result.rows;
}

export async function removeClass(sgt_id, week_taught, weekday_taught, class_number, term) {
  const result = await pool.query(`delete from Class where subject_taught = $1 and week_taught = $2 and
  weekday_taught = $3 and class_number = $4 and term = $5`, [sgt_id, week_taught, weekday_taught, class_number, term]);
}