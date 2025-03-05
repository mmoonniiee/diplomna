import axios from "axios";
import { Form } from "react-router";

export async function clientLoader({ params }) {
  const {data: shifts} = await axios.get(`http://localhost:5000/shifts`);
  const {data: teachers} = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);
  console.log(shifts.data);
  return { shifts, teachers };
}

export async function clientAction({request, params}) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  body.grad_year = Number(body.grad_year);
  const result = await axios.post(`http://localhost:5000/school/${params.schoolId}/grade`, body);
}

export default function GradeAdd({loaderData}) {
  console.log("loader data", loaderData);
  const { shifts, teachers } = loaderData;

  return (
    <div>
      <Form method="POST">
        <div>
          <label>Випуск</label>
          <input type="number" name="grad_year" minvalue="2026"/>
          <label>Паралелка</label>
          <input name="subgroup" type="text" maxlength="2"/>
        </div>
        <div>
          <select name="first_term">
            {shifts.map(shift => 
              <option value={shift}>{shift}</option>
            )}
          </select>
          <select name="second_term">
            {shifts.map(shift => 
              <option value={shift}>{shift}</option>
            )}
          </select>
        </div>
        <div>
          <select name="teacher_id">
            {teachers.map(teacher => 
              <option value={teacher.id}>{teacher.name}</option>  
            )}
          </select>
        </div>
        <button>Добавяне</button>
      </Form>
    </div>
  )
}