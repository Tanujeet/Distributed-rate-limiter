import { db } from '../config/db';

export async function testDb() {

    const res = await db.query("SELECT NOW()");
    console.log("DB time:",res.rows[0])
}