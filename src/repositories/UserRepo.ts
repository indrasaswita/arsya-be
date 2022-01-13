import Postgres from '../config/postgres'

const getAllUsers: (
	roleId: number[],
	keyword: string, 
	page: number, 
	perPage: number,
) => 
	Promise<any> = (
		roleId: number[],
		keyword: string, 
		page: number, 
		perPage: number,
	) => 
		new Promise((
			resolve: (value: any) => void,
			reject: (reason?: any) => void,
		) => {
			const postgres = new Postgres()

			postgres
				.query(
					`
						SELECT *
						FROM "user"
						WHERE email LIKE $2
							AND role_id IN ($1)
					`,
					[
						roleId.join(','),
						`%${keyword}%`,
					],
				)
				.then((result: any) => {
					resolve(result.rows)
				})
				.catch((reason: any) => {
					reject(reason)
				})
		})

const getCountUsers: (
	roleId: number[],
) => 
	Promise<any> = (
		roleId: number[],
	) => 
		new Promise((
			resolve: (value: any) => void,
			reject: (reason?: any) => void,
		) => {
			const postgres = new Postgres()

			postgres
				.query(
					`
						SELECT COUNT(*)
						FROM "user"
						WHERE role_id IN ($1)
					`,
					[
						roleId.join(',')
					]
				)
				.then((result: any) => {
					resolve(result.rows[0].count)
				})
				.catch((reason: any) => {
					reject(reason)
				})
		})

export default {
	getAllUsers,
	getCountUsers,
}