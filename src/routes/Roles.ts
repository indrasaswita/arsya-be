/* eslint-disable @typescript-eslint/no-unsafe-call */
import StatusCodes from "http-status-codes";
import { Request, Response } from 'express';
import RoleRepo from '../repositories/RoleRepo'
const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;


export const getAllRoles: (req: Request, res: Response) => any = (req: Request, res: Response) => {

	RoleRepo
		.getAllRoles()
		.then((result: any) => {
			return res
				.status(OK)
				.json({
					message: 'Success',
					data: {
						roles: result,
					}
				})
		}, (reason: any) => {
			return res
				.status(INTERNAL_SERVER_ERROR)
				.json({
					message: 'Server Error',
					data: {
						reason,
					},
				})
		})
}
