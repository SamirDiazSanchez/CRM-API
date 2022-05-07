import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ProjectModel } from 'models/projectModel';
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
				.json({ message: 'Unauthorized' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		if (authData.rol === 'User') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const project: ProjectModel = req.body;

		try {
			await notion.pages.update({
				page_id: project.id,
				properties: {
					Name: {
						title: [
							{
								text: {
									content: project.name
								}
							}
						]
					},
					Description: {
						rich_text: [
							{
								text: {
									content: project.description
								}
							}
						]
					},	
					Client: {
						relation: [
							{
								id: project.client
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
				.json({ message: 'Project update success' });
		} catch (error) {
			res
				.status(400)
				.json({ message: error ? error : "Something goes wrong" });
		}
	});
}

export default handler;