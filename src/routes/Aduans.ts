/* eslint-disable @typescript-eslint/no-unsafe-call */
import StatusCodes from "http-status-codes";
import { Request, Response } from 'express';
import AduanRepo from '../repositories/AduanRepo'
const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;


// eslint-disable-next-line max-len
export const getAllAduans: (req: Request, res: Response) => any = (req: Request, res: Response) => {

	const keyword: string = req.query.keyword ? req.query.keyword as string : '';
	const perPage: number = req.query.per_page 
		? parseInt(req.query.per_page as string) : 10;
	const page: number = req.query.page 
		? parseInt(req.query.page as string) : 1;

	AduanRepo
		.getAllAduans(keyword, page, perPage)
		.then(async (result: any) => {
			let countRow = -1

			// getting total row of aduan
			await AduanRepo
				.getCountAduans()
				.then((value: number) => {
					countRow = value;
				})

			// return result with paginated count
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
						aduan: result,
					}
				});
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
		});

}