import axios from "axios";
import { Form } from "react-router";

const shiftToBG = (shift) => {
  switch(shift) {
    case "first": return "Първа смяна";
    case "second": return "Втора смяна";
    default: return "";
  }
}

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
  await axios.post(`http://localhost:5000/school/${params.schoolId}/grade`, body);
}

export default function GradeAdd({loaderData}) {
  console.log("loader data", loaderData);
  const { shifts, teachers } = loaderData;

  return (
      <div className="text-white h-full w-full">
        <Form method="POST" className="flex flex-col space-y-8 justify-center items-center h-full">
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col">
            <label>Випуск</label>
            <input type="number" name="grad_year" minvalue="2026" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2"/>
          </div>
          <div className="flex flex-col">
            <label>Паралелка</label>
            <input name="subgroup" type="text" maxlength="3" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2"/>
          </div>
        </div>
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col">
            <label>Смяна за първи срок</label>
            <select name="first_term" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
              {shifts.map(shift => 
                <option value={shift}>{shiftToBG(shift)}</option>
              )}
            </select>
          </div>
          <div className="flex flex-col">
            <label>Смяна за втори срок</label>
            <select name="second_term" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
              {shifts.map(shift => 
                <option value={shift}>{shiftToBG(shift)}</option>
              )}
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <label>Класен ръководител</label>
          <select name="teacher_id" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
            {teachers.map(teacher => 
              <option value={teacher.id}>{teacher.name}</option>  
            )}
          </select>
        </div>
        <button className="bg-[rgba(238,108,77,1)] text-white p-2 rounded-lg self-center">Добавяне</button>
      </Form>
    </div>
  )
}