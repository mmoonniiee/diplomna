import { Form } from "react-router";
import axios from "axios";

export async function clientLoader() {
  const terms = await axios.get(`http://localhost:5000/terms`);
  return terms;
}

export async function clientAction({request, params}) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const result = await axios.post(`http://localhost:5000/school/${params.schoolId}/subject`, body);
}

export default function SubjectAdd({loaderData}) {
  const terms = loaderData.data;
  return(
    <Form method="POST">
      <div className="flex flex-col items-center space-y-10">
        <h1 className="text-white text-[24px] font-bold">Добавяне на предмет</h1>
        <div className="flex flex-col">
          <label>Име на предмета</label>
          <input type="text" name="name" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2"/>
        </div>
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col">
            <label>Срок</label>
            <select name="term" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2">
              {terms.map(term => 
                <option value={term}>{term}</option>
              )}
            </select>
          </div>
          <div className="flex flex-col">
            <label>Хорариум</label>
            <input type="number" name="chorarium" className="rounded-full bg-[rgba(253,253,253,0.2)] text-white p-2"/>
          </div>
        </div>
        <button className="bg-[rgba(238,108,77,1)] text-white p-2 rounded-lg">Добавете</button>
      </div>
    </Form>
  )
}