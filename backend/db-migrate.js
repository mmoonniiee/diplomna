import { addAwaiting, addSchool, createTables } from './db.js'

await createTables();

await addSchool("velikoto testovo uchilishte sv. djon atanasov", "@gmail.com", "high");
await addAwaiting("martinabikova@gmail.com", "school_admin", null, null, 1, null);