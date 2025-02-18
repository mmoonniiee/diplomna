import { route } from "@react-router/dev/routes";
  
  export default [
    // * matches all URLs, the ? makes it optional so it will match / as well
    route("*?", "catchall.jsx"),
    route("/home/admin/teacher", "HomeTeacherAdmin.jsx"),
    route("/home/admin", "HomeAdmin.jsx"),
    route("/home", "HomeStudentTeacher.jsx"),
    route("/admin/schedule", "schedule.jsx"),
    route("/schedule", "SchedulePage.jsx"),
    route("/admin/subjects", "SubjectEditor.jsx"),
  ] 
  