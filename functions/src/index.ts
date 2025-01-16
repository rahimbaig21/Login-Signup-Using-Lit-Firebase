import './firebase-config';
const { onCall } = require("firebase-functions/v2/https");
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Userinfo',
    password: 'root',
    port: 5432,
});

interface UserSignupData {
    name: string;
    password: string;
    email: string;
}

const auth = getAuth();

export const signupUser = onCall(async (request: any) => {
    const { name, password, email }: UserSignupData = request.data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userid = user.uid;
    await pool.query("SELECT * from add_user($1, $2, $3, $4)", [userid, name, email, password]);
    return { Message: "User signup Successfull" };
});

export const getusername = onCall(async (request: any) => {
    console.log('Received Get username request:', request);
    const { userid } = request.data;
    console.log('Extracted userid:', userid);
    const result = await pool.query('SELECT * from get_user_name($1)', [userid]);
    console.log('Query result:', result.rows);
    const userName = result.rows[0]?.get_user_name;
    console.log('Returned userName:', userName);
    return { userName };
});

export const addemployee = onCall(async (request: any) => {
    console.log('Received Add Employee request:', request.data);
    const { userid, name, email, dob, designation, address } = request.data;
    console.log('Extracted userid:', userid, name, email, designation, dob, address);
    const result = await pool.query('SELECT * from add_employee($1, $2, $3, $4, $5, $6)', [userid, name, email, dob, designation, address]);
    console.log('Query result:', result.rows);
});

export const getemployeedetails = onCall(async (request: any) => {
    console.log('Received Get Employee request:', request.data);
    const { userid } = request.data;
    const result = await pool.query('SELECT * from get_employee_details($1)', [userid]);
    console.log('Employees:', result.rows);
    return { result: result.rows };
});

export const update_employee = onCall(async (request: any) => {
    console.log('Received Update request:', request.data);
    const { emp_id, userid, name, email, dob, designation, address } = request.data;
    console.log("Data;", emp_id, userid, name, email, address, dob, designation)
    const query = 'SELECT update_employee($1, $2, $3, $4, $5, $6, $7)';
    const result = await pool.query(query, [emp_id, userid, name, email, dob, designation, address]);
    console.log('Updated Employee details:', result.rows);
    return result.rows;
});

export const delete_employee = onCall(async (request: any) => {
    console.log('Received Delete request:', request.data);
    const { emp_id } = request.data;
    const query = 'SELECT delete_employee($1)';
    const result = await pool.query(query, [emp_id]);
    console.log(result);
    return result;
});
