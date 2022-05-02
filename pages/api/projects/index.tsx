import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';

const handler = (req, res) => {
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

		const projects = [];
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

		try {
			const response = await notion.databases.query(dataQuery);

			response.results.map((item: any) => {
				const project = {
					name: item.properties['Project Name'].title[0].plain_text,
					description: item.properties['Description'].rich_text[0].plain_text,
					client: item.properties['Client'].relation[0].id
				}

				projects.push(project);
			})

			res
				.status(200)
				.json({projects});
		}
		catch (error) {
			res
				.status(400)
				.json({ error });
		}
	});
}

export default handler;