import { Pool, PoolConfig } from "pg";

type CallbackReturnType = (a: any) => void;

class Postgres {
	private pool: Pool | null = null;
	private config: PoolConfig | null = null;

	constructor() {
		// untuk isi config
		this.config = {
			host: 'localhost',
			user: 'postgres',
			password: '1234',
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		}

		// set-up pool with pre-define config
		this.pool = new Pool(this.config);
	}

	public query = (
		sql: string,
		values: any[] = [], 
	) => 
		new Promise((
			resolve: (value: unknown) => void, 
			reject: (reason?: any) => void,
		) => {
			if(this.pool != null) {
				this.pool.connect((err, client, release) => {
					if (err) {
						// JIKA CONNECTION FAILED
						reject(err)
					}

					client
						.query(sql, values)
						.then((result) => {
							// JIKA BERHASIL
							resolve(result)
						})
						.catch((err) => {
							// KALAU ERROR saat QUERY
							reject(err)
						})
						.finally(() => {
							// supaya ga kepenuhan, client harus di release
							release()
						})
				})
			} else {
				// KALAU POOL TIDAK BERHASIL KE CREATE
				reject("pool has not been set")
			}
		})

}

export default Postgres
