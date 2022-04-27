import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = async (req, res) => {
	if (req.put()) {
		try {
			const notion = new Client({ auth: process.env.NOTION_API_KEY});

			const response = await notion.pages.update({
				page_id: req.body.id,
				properties: {
					Name: {
						title: [
							{
								text: {
									content: req.body.name
								}
							}
						]
					},
					"Last Name": {
						rich_text: [
							{
								text: {
									content: req.body.lastName
								}
							}
						]
					},
					Email: {
						email: req.body.email
					},
					Phone: {
						phone_number: req.body.phone
					},
					modifyUser: {
						email: "samir.diaz.1206@gmail.com"
					}
				}
			});

			res
				.status(200)
				.json({ response });
		}
		catch (error) {
			res
				.status(400)
				.json({ error });
		}
	}
}

export default apiMiddleware(handler);