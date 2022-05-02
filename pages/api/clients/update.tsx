import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';

const handler = async (req, res) => {
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

		if (authData.rol !== 'User') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY});

			const response = await notion.pages.update({
				page_id: req.body.id,
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
				.json({ response });
		}
		catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}
export default handler;