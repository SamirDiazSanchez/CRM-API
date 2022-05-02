import { Client } from "@notionhq/client";
import { hash } from "bcryptjs";
import { verify } from "jsonwebtoken";

const handler = (req, res) => {
	if (req.method !== 'POST') {
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
				.json({ message: 'Token error' });
		}

		if (authData.rol !== 'Super Admin' && authData.rol !== 'Admin') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		const notion = new Client({ auth: process.env.NOTION_API_KEY });

		const password = await hash(req.body.password, 8);

		try {
			const response = await notion.pages.create({
				parent: {
					database_id: process.env.NOTION_USER_DB
				},
				properties: {
					UserName: {
						title: [
							{
								text: {
									content: req.body.userName
								}
							}
						]
					},
					['Full Name']: {
						rich_text: [
							{
								text: {
									content: req.body.fullName
								}
							}
						]
					},
					Email: {
						email: req.body.email
					},
					Rol: {
						select: {
							name: req.body.rol
						}
					},
					Password: {
						rich_text: [
							{
								text: {
									content: password
								}
							}
						]
					},
					CreatedUser: {
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
				.json({ message: 'Created' });
		}
		catch (error) {
			res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;