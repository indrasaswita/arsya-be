/* eslint-disable @typescript-eslint/no-unsafe-call */
import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import UserDao from '@daos/User/UserDao.mock';
import { paramMissingError } from '@shared/constants';
import Postgres from '../config/postgres';
import UserRepo from 'src/repositories/UserRepo';

const userDao = new UserDao();
const { BAD_REQUEST, CREATED, OK, INTERNAL_SERVER_ERROR } = StatusCodes;


export function getUserPelapor(req: Request, res: Response) {
	getUserByRoleId(req, res, [2])
}

export function getUserLembaga(req: Request, res: Response) {
	getUserByRoleId(req, res, [3,4,5,6,7])
}


function getUserByRoleId(req: Request, res: Response, roleId: number[]) {

	const keyword: string = req.query.keyword ? req.query.keyword as string : '';
	const perPage: number = req.query.per_page 
		? parseInt(req.query.per_page as string) : 10;
	const page: number = req.query.page 
		? parseInt(req.query.page as string) : 1;

	UserRepo
		.getAllUsers(
			roleId, 
			keyword,
			page,
			perPage,
		)
		.then(async (result: any) => {
			let countRow = 0
			await UserRepo
				.getCountUsers(roleId)
				.then((result: number) => {
					countRow = result
				})
			
			return res
				.status(OK)
				.json({
					message: 'Success',
					data: {
						total: countRow,
						per_page: perPage,
						current_page: page,
						from: (page - 1) * perPage + 1,
						to: (page - 1) * perPage + result.length,
						users: result,
					}
				})
		})
		.catch((reason: any) => {
			return res
				.status(INTERNAL_SERVER_ERROR)
				.json({
					message: 'Server Error',
					data: {
						reason,
					}
				})
		})
}


/**
 * Add one user.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function addOneUser(req: Request, res: Response) {
	const { user } = req.body;
	if (!user) {
		return res.status(BAD_REQUEST).json({
			error: paramMissingError,
		});
	}
	await userDao.add(user);
	return res.status(CREATED).end();
}


/**
 * Update one user.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function updateOneUser(req: Request, res: Response) {
	const { user } = req.body;
	if (!user) {
		return res.status(BAD_REQUEST).json({
			error: paramMissingError,
		});
	}
	user.id = Number(user.id);
	await userDao.update(user);
	return res.status(OK).end();
}


/**
 * Delete one user.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function deleteOneUser(req: Request, res: Response) {
	const { id } = req.params;
	await userDao.delete(Number(id));
	return res.status(OK).end();
}
