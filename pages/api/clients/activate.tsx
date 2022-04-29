import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = async (req, res) => {
	if (req.put()) {
		req.jwtVerify(async (authData) => {
			try {
				const notion = new Client({ auth: process.env.NOTION_API_KEY});
		
				const response = await notion.pages.update({
					page_id: req.body.id,
					properties: {
						Active: {
							checkbox: true
						},
						modifyUser: {
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
					.json({ response })
			}
			catch(error) {
				res
					.status(error.status)
					.json({ error });
			}
		})
	}
}

export default apiMiddleware(handler);