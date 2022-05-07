import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ClientModel } from 'models/clientModel';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });

	if (req.method !== 'POST') {
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
				.json({ message: "Token error" });
		}

		const client: ClientModel = req.body

		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY});

			await notion.pages.create({
				parent: {
					database_id: process.env.NOTION_CLIENT_DB
				},
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
					createdUser: {
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
				.status(201)
				.json({ message: 'Created' });
		}
		catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;