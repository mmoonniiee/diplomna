import { Form } from "react-router";
import axios from "axios";

export async function clientLoader({ params }) {
  const { data: subject } = await axios.get(`http://localhost:5000/subject/${params.subjectId}`);
  const { data: grades } = await axios.get(`http://localhost:5000/school/${params.schoolId}/grades`);
  const { data: teachers } = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);

  return { subject, grades, teachers };
}

export async function clientAction({request, params}) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  console.log('body params', body);
  const result = await axios.post(`http://localhost:5000/subject/${params.subjectId}/teacher/${body.teacher_id}/grade/${body.grade_id}`, body);
}

export default function SubjectAdd({loaderData}) {
  const {subject, grades, teachers } = loaderData;

  return(
    <Form method="POST" className="flex h-full justify-center items-center">
      <div className="flex flex-col items-center space-y-10">
        <h1 className="text-white text-[24px] font-bold">Редактиране на {subject.name}</h1>
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col">
            <label>Клас</label>
            <select name="grade_id" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
              {grades.map(grade => 
                <option value={grade.id}>{grade.subgroup}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label>Учител</label>
            <select name="teacher_id" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
              {teachers.map(teacher => 
                <option value={teacher.id}>{teacher.name}</option>)}
            </select>
          </div>
        </div>
        <button className="bg-[rgba(238,108,77,1)] text-white p-2 rounded-lg">Добавете</button>
      </div>
    </Form>
  )
}