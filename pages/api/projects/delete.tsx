import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ProjectModel } from 'models/projectModel';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });
	if (req.method !== 'DELETE') {
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

		if (authData.rol === 'User') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const project: ProjectModel = req.body;

		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY });

			await notion.pages.update({
				page_id: project.id,
				properties: {
					Active: {
						checkbox: false
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
				.json({ message: 'Project remove success' });
		} catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;