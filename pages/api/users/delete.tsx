import { Client } from "@notionhq/client";
import { verify } from "jsonwebtoken";

const handler = (req, res) => {
	if (req.method !== 'PUT') {
		return res
			.status(200)
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

		if (authData.rol !== 'Super Admin') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		try {
			const response = await notion.pages.update({
				page_id: req.body.id,
				properties: {
					ModifyUser: {
						relation: [
							{
								id: authData.id
							}
						]
					},
					Active: {
						checkbox: false
					}
				}
			})

		} catch (error) {
			res
				.status(400)
				.json({ message: "Smetisomething goes wrong" });
		}
	})
}

export default handler;