import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';

const handler = (req, res) => {
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

		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY});

			const response = await notion.pages.create({
				parent: {
					database_id: process.env.NOTION_CLIENT_DB
				},
				properties: {
					Name: {
						title: [
							{
								text: {
									content: req.body.name
								}
							}
						]
					},
					"Last Name": {
						rich_text: [
							{
								text: {
									content: req.body.lastName
								}
							}
						]
					},
					Email: {
						email: req.body.email
					},
					Phone: {
						phone_number: req.body.phone
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
				.json({ message: "Smetisomething goes wrong" });
		}
	});
}

export default handler;