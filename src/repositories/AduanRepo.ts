import Postgres from '../config/postgres'

// eslint-disable-next-line max-len
const getAllAduans: (keyword: string, page: number, perPage: number) => Promise<any> = (keyword: string, page: number, perPage: number) => new Promise((
	resolve: (value: any) => void, 
	reject: (reason?: any) => void,
) => {

	const postgres = new Postgres()
	postgres
		.query(
			`
				SELECT 
					aduan.*, 
					"role".nama as role_nama, 
					aduan_kategori.kategori,
					"user".email as user_email,
					lembaga.nama as lembaga_nama
				FROM "aduan"
					LEFT JOIN role ON role.id = aduan.role_id
					LEFT JOIN aduan_kategori ON aduan_kategori.id = aduan.aduan_kategori_id
					LEFT JOIN "user" ON "user".id = aduan.user_id
					LEFT JOIN lembaga ON lembaga.id = aduan.lembaga_id
				WHERE "user".email LIKE $1
				LIMIT $2 OFFSET $3
			`,
			[
				`%${keyword}%`, // yang di search
				perPage, // total row
				(page - 1) * perPage, // mulainya
			],
			(result: any) => {
				// kalo berhasil
				resolve(result.rows)
			},
			(reason: any) => {
				// kalo gagal
				reject(reason)
			}
	)
})

const getCountAduans: () => Promise<any> = async() => new Promise((
	resolve: (value: any) => void, 
	reject: (reason?: any) => void,
) => {
	const postgres = new Postgres();
	postgres
		.query(
			`
				SELECT COUNT(*)
				FROM "aduan"
			`,
			[],
			(result: any) => {
				resolve(parseInt(result.rows[0].count as string))
			},
			(reason: any) => {
				reject(reason)
			}
		)
})

export default {
	getAllAduans,
	getCountAduans,
}