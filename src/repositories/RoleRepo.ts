import Postgres from '../config/postgres'

const getAllRoles: () => Promise<any> = () => new Promise((
	resolve: (value: any) => void, 
	reject: (reason?: any) => void,
) => {

	const postgres = new Postgres()
	postgres
		.query(
			'SELECT * FROM "role"',
		)
		.then((result: any) => {
			resolve(result.rows)
		})
		.catch((reason: any) => {
			reject(reason)
		})
})

export default {
	getAllRoles,
}