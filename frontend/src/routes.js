import { route, prefix, layout } from "@react-router/dev/routes";
  
  export default [
    ...prefix("/school/:schoolId", [
      route("/home/admin/teacher", "HomeTeacherAdmin.jsx"),
      route("/home/admin", "HomeAdmin.jsx"),
      route("/home", "HomeStudentTeacher.jsx"),
      route("/admin/term/:term", "./ScheduleTablist.jsx", [
        route("/grade/:gradeId", "ScheduleEditorGrade.jsx"),
        route("/teacher/:teacherId", "ScheduleEditorTeacher.jsx")
      ]),
      route("/schedule", "SchedulePage.jsx"),
      layout("./components/Sidebar.jsx", [
        route("/admin/subjects/add", "SubjectAdd.jsx"),
        route("/admin/subjects/:subjectId/edit", "SubjectEditor.jsx")
      ]),
      route("/admin/grades/add", "GradeAdd.jsx")
    ]),
      route("/", "Start.jsx")
  ] 
  