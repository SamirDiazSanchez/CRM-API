import { Client } from "@notionhq/client";
import { verify } from "jsonwebtoken";
import { compare, hash } from 'bcryptjs';

const handler = (req, res) => {
	if (req.method !== 'PUT') {
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

		try {
			const response = await notion.databases.query({
				database_id: process.env.NOTION_USER_DB
			});

			if (response.results.length === 0) {
				return res
					.status(403)
					.json({ message: 'Forbidden' });
			}

			const user: any = response.results.filter(user => user.id === authData.id);

			const comparation = await compare(req.body.oldPassword, user[0].properties.Password.rich_text[0].plain_text);

			if (!comparation) {
				return res
					.status(403)
					.json({ message: 'Forbidden' });
			}

			const password = await hash(req.body.password, 8);

			const update = await notion.pages.update({
				page_id: authData.id,
				properties: {
					Password: {
						rich_text: [
							{
								text: {
									content: password
								}
							}
						]
					},
					ModifyUser: {
						relation: [
							{
								id: authData.id
							}
						]
					},
				}
			})

			res
				.status(200)
				.json({ message: 'Success' });
		}
		catch (error) {
			return res
				.status(400)
				.json({ message: "Something goes wrong", error });
		}
	});
}

export default handler;