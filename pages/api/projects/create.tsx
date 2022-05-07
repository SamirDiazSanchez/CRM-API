import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ProjectModel } from 'models/projectModel';
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
				.json({ message: 'Token error' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		const project: ProjectModel = req.body;

		try {
			const response = await notion.pages.create({
				parent: {
					database_id: process.env.NOTION_PROJECT_DB
				},
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
				.json({ message: 'Success' });
		} catch (error) {
			res
				.status(400)
				.json({ message: error ? error : "Something goes wrong" });
		}
	});
}

export default handler;