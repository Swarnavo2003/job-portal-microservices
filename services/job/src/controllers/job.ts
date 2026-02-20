import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Unauthorized - Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden - Only Recruiters can create companies",
      );
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler(400, "Bad Request - Missing required fields");
    }

    const existingCompany = await sql`
      SELECT company_id FROM companies WHERE name = ${name}
    `;

    if (existingCompany.length > 0) {
      throw new ErrorHandler(
        409,
        "Conflict - Company with this name already exists",
      );
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Company Logo is required");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(
        400,
        "Failed to create file buffer from the uploaded logo",
      );
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const [newCompany] = await sql`
      INSERT INTO COMPANIES (name, description, website, logo, logo_public_id, recruiter_id)
      VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id}) 
      RETURNING *
    `;

    res.status(201).json({
      message: "Company create successfully",
      company: newCompany,
    });
  },
);
