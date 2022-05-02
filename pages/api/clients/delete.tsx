import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';

const handler = async (req, res) => {
	if (req.method !== 'DELETE') {
		return res
			.status(405)
			.json({ messaeg: 'Method not allowed' });
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

		const notion = new Client({ auth: process.env.NOTION_API_KEY});

		if (authData.rol === 'User' || authData.rol === 'Supervisor') {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		try {
			const response = await notion.pages.update({
				page_id: req.body.id,
				properties: {
					Active: {
						checkbox: false
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
				.json({ message: "Smetisomething goes wrong" });
		}
	});
}

export default handler;