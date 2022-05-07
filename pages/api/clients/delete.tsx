import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ClientModel } from 'models/clientModel';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });

	if (req.method !== 'PUT') {
		return res
			.status(405)
			.json({ messaeg: 'Method not allowed' });
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

		const notion = new Client({ auth: process.env.NOTION_API_KEY});

		if (authData.rol === 'User' || authData.rol === 'Supervisor') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const client: ClientModel = req.body;

		try {
			await notion.pages.update({
				page_id: client.id,
				properties: {
					Active: {
						checkbox: false
					},
					modifyUser: {
						relation: [
							{
								id: authData.id
							}
						]
					}
				}
			});
	
			res
				.status(200)
				.json({ message: 'Remove client success' });
		}
		catch(error) {
			res
				.status(error.status)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;