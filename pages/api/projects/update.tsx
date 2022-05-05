import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
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

	const token = req.headers.authorization.split(" ")[0];

	verify(token, process.env.SECRET_KEY, async (error, authData) => {
		if (error) {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		if (authData.rol === 'User') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		try {
			const response = await notion.pages.update({
				page_id: req.body.id,
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
					ModifyUser: {
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
				.json({ response });
		} catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;