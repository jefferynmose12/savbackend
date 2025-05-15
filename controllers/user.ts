import { Request, Response } from "express";
import Lead from "../leadModel.js";

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { email, companyName } = await Lead.findOne({
      _id: "6822328bce994e1b2d890a80",
    });
    res.json({ data: { email, companyName } });
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
};

export const testEndpoint = (req: Request, res: Response) => {
  res.json({ message: "Testing" });
};

