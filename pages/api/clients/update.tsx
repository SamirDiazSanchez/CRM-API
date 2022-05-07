import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ClientModel } from 'models/clientModel';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });
	
	if (req.method !== 'PUT') {
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

		if (authData.rol === 'User') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const client: ClientModel = req.body;

		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY});

			await notion.pages.update({
				page_id: client.id,
				properties: {
					Name: {
						title: [
							{
								text: {
									content: client.name
								}
							}
						]
					},
					"Last Name": {
						rich_text: [
							{
								text: {
									content: client.lastName
								}
							}
						]
					},
					Email: {
						email: client.email
					},
					Phone: {
						phone_number: client.phone
					},
					modifyUser: {
						relation: [
							{
								id: authData.id
							}
						]
					},
					Active: {
						checkbox: true
					}
				}
			});

			res
				.status(200)
				.json({ message: 'Client udpate success' });
		}
		catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}
export default handler;