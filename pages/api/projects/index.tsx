import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = (req, res) => {
	if(req.get()) {
		req.jwtVerify(async (authData) => {
			try {
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
		})
	}
}

export default apiMiddleware(handler);