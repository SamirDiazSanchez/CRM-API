import { Client } from '@notionhq/client';
import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if (req.post()) {
		req.jwtVerify(async (authData) => {
			try {
				const notion = new Client({ auth: process.env.NOTION_API_KEY});
	
				const response = await notion.pages.create({
					parent: {
						database_id: process.env.NOTION_CLIENT_DB
					},
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
						createdUser: {
							relation: [
								{
									id: authData.id
								}
							]
						},
						Active: {
							checkbox: true
						}
					}
				});
	
				res
					.status(201)
					.json({ response });
			}
			catch (error) {
				res
					.status(400)
					.json({ error });
			}
		});
	}
}

export default apiMiddleware(handler);