/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import StatusCodes from "http-status-codes";
import { Request, Response } from 'express';
import Postgres from "../config/postgres";
const { OK } = StatusCodes;

function pad(value: number) {
	return ('00'+value).slice(-2)
}

function getDate(dt: Date) {
	// return dt.getFullYear()+'-'+pad(dt.getMonth() + 1)+'-'+pad(dt.getDate())
	const hasil = dt.toISOString().substring(0, 10)

	if(hasil === '2021-01-00') {
		console.log('gagal', dt)
	}

	return hasil
}

function newData() {
	const map: Map<string, any> = new Map()

	for(let i = 1; i <= 31; i++)
		map.set('2021-01-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // jan
	for(let i = 1; i <= 28; i++)
		map.set('2021-02-' + pad(i), { saldo: 0, earn: 0, redeem: [] })  
	for(let i = 1; i <= 31; i++)
		map.set('2021-03-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) 
	for(let i = 1; i <= 30; i++)
		map.set('2021-04-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // apr 
	for(let i = 1; i <= 31; i++)
		map.set('2021-05-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // mei 
	for(let i = 1; i <= 30; i++)
		map.set('2021-06-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // jun 
	for(let i = 1; i <= 31; i++)
		map.set('2021-07-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // jul 
	for(let i = 1; i <= 31; i++)
		map.set('2021-08-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // aug 
	for(let i = 1; i <= 30; i++)
		map.set('2021-09-' + pad(i), { saldo: 0, earn: 0, redeem: [] }) // sep

	return map
}

export async function getTest(req: Request, res: Response) {

	const postgres = new Postgres()
	const map: Map<string, Map<string, any>> = new Map()

	await postgres
		.query(
			`
				SELECT *
				FROM phones
				ORDER BY phone ASC
			`, []
		)
		.then((result: any) => {
			result.rows.forEach((r: any) => {
				map.set(r['id']+'', newData())
			})
		})


	await postgres
		.query(
			`
				SELECT * 
				FROM "points"
				ORDER BY phone_id, dt ASC
			`,
			[]
		)
		.then((result: any) => {
			result.rows.forEach((r: any) => {

				const user: Map<string, any> | undefined = map.get(r['phone_id']+'')

				if(user === undefined)
					return

				const tgl: string = getDate(new Date(r['dt'] as string))

				let temp: any | undefined = user.get(tgl)

				if(temp === undefined) {
					return
				}

				temp = {
					...temp,
					earn: temp.earn + r['earn'],
				}

				user.set(tgl, temp)

				map.set(r['phone_id']+'', user)
				
			})

		})


	await postgres
		.query(
			`
				SELECT * 
				FROM "redeems"
				WHERE gagal = false
				ORDER BY phone_id, dt ASC
			`,
			[]
		)
		.then((result: any) => {
			result.rows.forEach((r: any) => {

				const user: Map<string, any> | undefined = map.get(r['phone_id']+'')

				if(user === undefined)
					return

				const tgl: string = getDate(new Date(r['dt'] as string))
				let temp: any | undefined = user?.get(tgl)

				if(temp === undefined) {
					return
				}

				temp = {
					...temp,
					redeem: [
						...temp.redeem,
						{
							id: r['id'],
							type: r['type'],
							point: r['point'],
						},
					],
				}

				user.set(tgl, temp)

			})

		})

	let gagal: number[] = []
	const phones: Map<string, {
		q1: number,
		q2: number,
		q3: number,
	}> = new Map()

	const tttMap: Map<string, {
		phone_id: string,
		dt: string,
		awal: number,
		earn: number,
		gopay: number,
		ovo: number,
		akhir: number,
	}> = new Map()

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	map.forEach((user: any, phone_id: string) => {
		let saldo = 0
		let totalRedeem: {
			gopay: number,
			ovo: number,
		} = {
			gopay: 0,
			ovo: 0,
		}

		user.forEach((data: any, tgl: string) => {

			let ttt = {
				phone_id: '',
				dt: '',
				awal: 0,
				earn: 0,
				gopay: 0,
				ovo: 0,
				akhir: 0,
			}

			if(tgl === '2021-04-01') {
				let pp = phones.get(phone_id as string) || {
					q1: 0,
					q2: 0,
					q3: 0,
				}

				pp = {
					...pp,
					q1: saldo,
				}

				phones.set(phone_id as string, pp)

				saldo = 0
			} 
			
			if(tgl === '2021-07-01') {
				let pp = phones.get(phone_id as string) || {
					q1: 0,
					q2: 0,
					q3: 0,
				}

				pp = {
					...pp,
					q2: saldo,
				}

				phones.set(phone_id as string, pp)

				saldo = 0
			}

			ttt = {
				...ttt,
				awal: saldo,
			}

			let temp: any = { ...data }

			if(temp.earn) {
				ttt = {
					...ttt,
					earn: temp.earn,
				}
				saldo += temp.earn
			}

			temp.redeem?.forEach((redeem: any) => {
				if(saldo >= redeem.point) {
					if(redeem.type.toLowerCase() === 'ovo') {
						totalRedeem = {
							...totalRedeem,
							ovo: totalRedeem.ovo + redeem.point,
						}
						ttt = {
							...ttt,
							ovo: redeem.point,
						}
					} else {
						totalRedeem = {
							...totalRedeem,
							gopay: totalRedeem.gopay + redeem.point,
						}
						ttt = {
							...ttt,
							gopay: redeem.point,
						}
					}

					saldo -= redeem.point
				} else {
					console.log("SALDO TIDAK CUKUP ", phone_id, tgl, `(butuh ${redeem.point as number}, tapi cuma punya ${saldo})`)
					gagal = [
						...gagal,
						redeem['id'],
					]
				}
			})

			temp = {
				...temp,
				saldo,
				totalRedeem,
			}

			ttt = {
				...ttt,
				akhir: saldo,
				dt: tgl,
				phone_id: phone_id,
			}

			tttMap.set(phone_id + '' + tgl, ttt)

			user.set(tgl, temp)
		})


		let pp = phones.get(phone_id) || {
			q1: 0,
			q2: 0,
			q3: 0,
		}

		pp = {
			...pp,
			q3: saldo,
		}

		phones.set(phone_id, pp)

		if(totalRedeem.gopay > 0 || totalRedeem.ovo > 0) {
			// console.log(phone_id, totalRedeem, saldo)
		}
	})

	// console.log(gagal.length)
	// postgres.query(
	// 	`
	// 		UPDATE redeems
	// 		SET gagal = true
	// 		WHERE id IN (${gagal.join(',')})
	// 	`, []
	// )

	// let updateStr = ''
	// phones.forEach((val: {
	// 	q1: number,
	// 	q2: number,
	// 	q3: number,
	// }, phone_id: string) => {
	// 	updateStr += `UPDATE phones SET saldo_q1=${val.q1}, saldo_q2=${val.q2}, saldo_q3=${val.q3} WHERE id=${phone_id}; `
	// })

	// postgres.query(
	// 	updateStr, []
	// )



	let updateStr2 = 'INSERT INTO histories(phone_id, dt, awal, earn, gopay, ovo, akhir) VALUES '
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	tttMap.forEach((val: {
		phone_id: string,
		dt: string,
		awal: number,
		earn: number,
		gopay: number,
		ovo: number,
		akhir: number,
	}, phone_id: string) => {

		// const tm = new Date(val.dt)
		// if(tm.getMonth() === 0 && tm.getDate() < 2)
			updateStr2 += `('${val.phone_id}', '${val.dt}', ${val.awal}, ${val.earn}, ${val.gopay}, ${val.ovo}, ${val.akhir}),  `
	})

	updateStr2 += `(0, '2020-01-02', 0, 0, 0, 0, 0);`

	// console.log(updateStr2)

	console.log("mulai ")
	await postgres.query(
		updateStr2, []
	)
	console.log("selesai")

	// console.log(updateStr2)



	map.forEach((user: any, phone_id: any) => {
		user.forEach((data: any, tgl: any) => {
			// console.log(phone_id, tgl, data.saldo, data.redeem, data.earn, data.totalRedeem)
		})
	})


	// console.log(map)
	return res.status(OK).end()

}