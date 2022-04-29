import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = (req, res) => {
	if (req.get()) {
		req.jwtVerify(async (authData) => {
			try {
				const notion = new Client({ auth : process.env.NOTION_API_KEY });
				const clients = [];

				const rol = authData.rol;

				let dataQuery;

				if (rol === 'Super Admin') {
					dataQuery = {
						database_id: process.env.NOTION_CLIENT_DB
					}
				}
				else {
					dataQuery = {
						database_id: process.env.NOTION_CLIENT_DB,
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
					const client = {
						id: item.id,
						name: item.properties.Name.title[0].text.content,
						lastName: item.properties['Last Name'].rich_text[0].text.content,
						phone: item.properties.Phone.phone_number,
						email: item.properties.Email.email,
						active: item.properties.Active.checkbox
					}

					clients.push(client);
				});

				res
					.status(200)
					.json(clients);
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