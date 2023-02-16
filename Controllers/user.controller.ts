import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Utils/AsyncHandler";
import userModel from "../Models/user.models";
import bcrypt from "bcrypt";
import { AppError, HttpCode } from "../Utils/AppError";
import jwt from "jsonwebtoken";
import { generateToken } from "../Middlewares/authorization/authorization";

// Register Users:
export const RegisterUsers = AsyncHandler(
  async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { name, email, password, confirmPassword } = req.body;
    const salt: string = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createUser = await userModel.create({
      name,
      email,
      password: hash,
      confirmPassword: hash,
    });

    if (!createUser)
      next(
        new AppError({
          message: "Account Not created",
          httpCode: HttpCode.UNAUTHORIZED,
        })
      );

    return res.status(200).json({
      message: "Successfully Created",
      data: createUser,
    });
  }
);

export const login = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const checkEmailIExist = await userModel.findOne({ email });
    if (!checkEmailIExist)
      next(
        new AppError({
          message: "User not Found",
          httpCode: HttpCode.NOT_FOUND,
        })
      );
    const checkPassword = await bcrypt.compare(
      password,
      checkEmailIExist!.password
    );

    if (!checkPassword)
      next(
        new AppError({
          message: "User Or Password Not exist",
          httpCode: HttpCode.NOT_FOUND,
        })
      );

    const token = generateToken({
      email: checkEmailIExist!.email,
      _id: checkEmailIExist!._id,
    });
    return res.status(200).json({
      message: `Welcome ${checkEmailIExist!.name}`,
      data: token,
    });
  }
);

export const getAll = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const getAllUsers = await userModel.find();
    return res.status(HttpCode.OK).json({
      message: "Successfully gotten All User",
      data: getAllUsers,
    });
  }
);
