import { Form } from "react-router";
import axios from "axios";

export async function clientLoader({ params }) {
  const { data: subject } = await axios.get(`http://localhost:5000/subject/${params.subjectId}`);
  const { data: grades } = await axios.get(`http://localhost:5000/school/${params.schoolId}/grades`);
  const { data: teachers } = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);

  return { subject, grades, teachers };
}

export async function clientAction({request}) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const result = await axios.post(`http://localhost:5000/subject/${body.subject_id}/teacher/${body.teacher_id}/grade/${body.grade_id}`, body);
}

export default function SubjectAdd({loaderData, params}) {
  const {subject, grades, teachers } = loaderData;

  return(
    <Form method="POST">
      <h1>Оправяне на {subject.name}</h1>
      <div>
      </div>
      <div>
      <label>Клас</label>
        <select name="grade_id">
          {grades.map(grade => 
            <option value={grade.id}>10{grade.subgroup}</option>
          )}
        </select>
      <div>
      <label>Учител</label>
        <select name="teacher_id">
          {teachers.map(teacher => 
            <option value={teacher.id}>{teacher.name}</option>
          )}
        </select>
      </div>
      </div>
      <button>Добавете</button>
    </Form>
  )
}