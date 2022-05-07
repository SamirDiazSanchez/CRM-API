import { Client } from "@notionhq/client";
import { verify } from "jsonwebtoken";
import { UserModel } from "models/userModel";
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });
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

		const user: UserModel = req.body;

		try {
			await notion.pages.update({
				page_id: user.id,
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
			});

			res
				.status(200)
				.json({ message: 'User remove success' });

		} catch (error) {
			return res
				.status(400)
				.json({ message: error ? error : "Something goes wrong" });
		}
	})
}

export default handler;