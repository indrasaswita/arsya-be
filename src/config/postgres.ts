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
		values: any[], 
		whendone: CallbackReturnType | null = null, 
		whenfailed: CallbackReturnType | null = null
	) => {
		if(this.pool != null) {
			this.pool.connect((err, client, release) => {
				if (err) {
						if(whenfailed != null)
							whenfailed(err)
						else {
							return console.error('Error acquiring client', err.stack)
						}
				}

				client
					.query(sql, values)
					.then((result) => {
						client.release()
						// kalo berhasil
						if(whendone != null) {
							whendone(result)
						}
					})
					.catch((err) => {
						client.release()
						if(whenfailed != null) {
							whenfailed(err)
						} else {
							return console.error('Error executing query', err.stack)
						}
					})
			})
		} else {
			if(whenfailed != null)
				whenfailed("pool has not been set")
			else
				console.error("pool has not been set")
		}
	}

}

export default Postgres;
