import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';
import { ProjectModel } from 'models/projectModel';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });

	if (req.method !== 'GET') {
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

		const projects: ProjectModel[] = [];

		let dataQuery;

		if(authData.rol === 'Super Admin') {
			dataQuery = {
				database_id: process.env.NOTION_PROJECT_DB
			}
		}
		else {
			dataQuery = {
				database_id: process.env.NOTION_PROJECT_DB,
				filter: {
					property: 'Active',
					checkbox: {
						equals: true
					}
				}
			}
		}

		let response;

		try {
			response = await notion.databases.query(dataQuery);
		}
		catch (error) {
			return res
				.status(400)
				.json({ message: "Something goes wrong", error });
		}

		response.results.map((item: any) => {
			const project: ProjectModel = {
				id: item.id,
				name: item.properties['Name'].title[0].plain_text,
				description: item.properties['Description'].rich_text[0].plain_text,
				client: item.properties['Client'].relation[0] ? item.properties['Client'].relation[0].id : null,
				active: item.properties.Active.checkbox
			}

			projects.push(project);
		})

		res
			.status(200)
			.json({projects});
	});
}

export default handler;