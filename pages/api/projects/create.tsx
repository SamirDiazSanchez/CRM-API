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
				.json({ message: 'Token error' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		try {
			const response = await notion.pages.create({
				parent: {
					database_id: process.env.NOTION_PROJECT_DB
				},
				properties: {
					"Project Name": {
						title: [
							{
								text: {
									content: req.body.projectName
								}
							}
						]
					},
					Description: {
						rich_text: [
							{
								text: {
									content: req.body.description
								}
							}
						]
					},
					Client: {
						relation: [
							{
								id: req.body.client
							}
						]
					},
					Active: {
						checkbox: true
					},
					CreatedUser: {
						relation: [
							{
								id: authData.id
							}
						]
					}
				}
			});

			res
				.status(201)
				.json({ message: 'Created' });
		} catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;