import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const sql = neon(process.env.DB_URL as string);
