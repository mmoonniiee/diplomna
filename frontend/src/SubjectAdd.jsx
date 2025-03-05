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
      <h1>Добавяне на предмет</h1>
      <div>
        <label>Име на предмета</label>
        <input type="text" name="name"/>
      </div>
      <div>
        <select name="term">
          {terms.map(term => 
            <option value={term}>{term}</option>
          )}
        </select>
        <input type="number" name="chorarium"/>
      </div>
      <button>Добавете</button>
    </Form>
  )
}