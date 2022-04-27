import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = (req, res) => {
	if (req.get()) {
		req.jwtVerify(async () => {
			try {
				const notion = new Client({ auth : process.env.NOTION_API_KEY });
				const clients = [];

				const response = await notion.databases.query({
					database_id: process.env.NOTION_CLIENT_DB
				});

				response.results.map((item: any) => {
					const client = {
						id: item.id,
						name: item.properties.Name.title[0].text.content,
						lastName: item.properties['Last Name'].rich_text[0].text.content,
						phone: item.properties.Phone.phone_number,
						email: item.properties.Email.email,
						Active: item.properties.Active.checkbox
					}

					clients.push(client);
				});

				res
					.status(200)
					.json(clients);
			}
			catch (error) {
				console.log(error)
				res
					.status(400)
					.json({ error });
			}
		})
	}
}

export default apiMiddleware(handler);