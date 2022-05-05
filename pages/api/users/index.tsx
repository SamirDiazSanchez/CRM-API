import { Client } from "@notionhq/client";
import { verify } from "jsonwebtoken";
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });
	if (req.method !== 'GET') {
		return res
			.status(405)
			.json({ message: 'Method not allowed' });
	}

	if (!req.headers.authorization) {
		return res
			.status(403)
			.json({ message: 'Forbidden' });
	}

	const token = req.headers.authorization.split(" ")[1];

	verify(token, process.env.SECRET_KEY, async (error, authData) => {
		if (error) {
			return res
				.status(401)
				.json({ message: 'Token error' });
		}

		if (authData.rol !== 'Super Admin' && authData.rol !== 'Admin') {
			return res
				.status(403)
				.json({ message: 'Forbidden' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });
		const users = [];
		let query;

		if (authData.rol === 'Super Admin') {
			query = {
				database_id: process.env.NOTION_USER_DB
			}
		}
		else {
			query = {
				database_id: process.env.NOTION_USER_DB,
				filter: {
					property: 'Acrive',
					checkbox: {
						equals: true
					}
				}
			}
		}

		try {
			const response = await notion.databases.query(query);

			response.results.map((item: any) => {
				const user = {
					id:  item.id,
					userName: item.properties.UserName.title[0].plain_text,
					fullName: item.properties['Full Name'].rich_text[0].plain_text,
					email: item.properties.Email.email,
					rol: item.properties.Rol.select.name,
					ative: item.properties.Active.checkbox
				}

				users.push(user);
			});

			res
				.status(200)
				.json(users);
		} catch(error) {
			return res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;