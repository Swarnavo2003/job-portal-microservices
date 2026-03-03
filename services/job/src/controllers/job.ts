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

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { companyId } = req.params;

    const [company] = await sql`
      SELECT logo_public_id FROM COMPANIES WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you do not have permission to delete it",
      );
    }

    await sql`
      DELETE FROM COMPANIES WHERE company_id = ${companyId}
    `;

    res.json({
      message: "Company and all associated jobs deleted successfully",
    });
  },
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
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

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;

  if (
    !title ||
    !description ||
    !salary ||
    !location ||
    !role ||
    !job_type ||
    !work_location ||
    !company_id ||
    !openings
  ) {
    throw new ErrorHandler(400, "Bad Request - Missing required fields");
  }

  const [company] = await sql`
    SELECT company_id FROM COMPANIES WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}
  `;

  if (!company) {
    throw new ErrorHandler(
      404,
      "Company not found or you do not have permission to create a job for it",
    );
  }

  const [newJob] = await sql`
    INSERT INTO jobs (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recruiter_id, openings)
    VALUES (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings})
    RETURNING *
  `;

  return res.status(201).json({
    message: "Job created successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Unauthorized - Authentication required");
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
    is_active,
  } = req.body;

  const [existingJob] = await sql`
    SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${req.params.jobId}
  `;

  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }

  if (existingJob.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(
      403,
      "Forbidden - You do not have permission to update this job",
    );
  }

  const [updatedJob] = await sql`
    UPDATE jobs SET
      title = ${title},
      description = ${description},
      salary = ${salary},
      location = ${location},
      role = ${role},
      job_type = ${job_type},
      work_location = ${work_location},
      company_id = ${company_id},
      openings = ${openings},
      is_active = ${is_active}
    WHERE job_id = ${req.params.jobId}
    RETURNING *;
  `;

  return res.status(200).json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompanies = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies = await sql`
    SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}
  `;
    res.status(200).json(companies);
  },
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "Company ID is required");
    }

    const [companyData] = await sql`
      SELECT c.*, COALESCE(
        (
          SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
        ),
        '[]'::json
      ) AS jobs
      FROM companies c
      WHERE c.company_id = ${id} GROUP BY c.company_id;
    `;

    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }

    res.status(200).json(companyData);
  },
);

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query as {
    title?: string;
    location?: string;
  };

  let queryString = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.role, j.job_type, j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;

  const values = [];

  let paramsIndex = 1;

  if (title) {
    queryString += ` AND j.title ILIKE $${paramsIndex}`;
    values.push(`%${title}%`);
    paramsIndex++;
  }

  if (location) {
    queryString += ` AND j.location ILIKE $${paramsIndex}`;
    values.push(`%${location}%`);
    paramsIndex++;
  }

  queryString += ` ORDER BY j.created_at DESC`;

  const jobs = (await sql.query(queryString, values)) as any[];

  return res.status(200).json(jobs);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const [job] =
    await sql`SELECT * FROM jobs WHERE job_id = ${req.params.jobId}`;

  return res.status(200).json(job);
});
