import { apiMiddleware } from "middlewares/api.middleware";
import { Client } from '@notionhq/client';

const handler = (req, res) => {
	if (req.post()) {
		req.jwtVerify(async (authData) => {
			try {
				const notion = new Client({ auth: process.env.NOTION_API_KEY });

				const response = await notion.pages.create({
					parent: {
						database_id: process.env.NOTION_PROJECT_DB
					},
					properties: {
						"Project Name": {
							title: [
								{
									text: {
										content: req.body.projectName
									}
								}
							]
						},
						Description: {
							rich_text: [
								{
									text: {
										content: req.body.description
									}
								}
							]
						},
						Client: {
							relation: [
								{
									id: req.body.client
								}
							]
						},
						Active: {
							checkbox: true
						},
						CreatedUser: {
							relation: [
								{
									id: authData.id
								}
							]
						}
					}
				});

				res
					.status(201)
					.json({response});
			} catch (error) {
				res
					.status(400)
					.json({ error });
			}
		});
	}
}

export default apiMiddleware(handler);