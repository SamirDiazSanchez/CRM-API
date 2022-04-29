import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = (req, res) => {
	if (req.post()) {
		req.jwtVerify(async (authData) => {
			try {
				const notion = new Client({ auth: process.env.NOTION_API_KEY });

				const response = await notion.pages.update({
					page_id: req.body.id,
					properties: {
						Active: {
							checkbox: true
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
					.json({ error });
			}
		});
	}
}

export default apiMiddleware(handler);