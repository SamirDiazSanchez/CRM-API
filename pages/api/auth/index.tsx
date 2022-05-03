import { sign, verify } from 'jsonwebtoken';
import { Client } from '@notionhq/client';
import { compare } from 'bcryptjs';
import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });

	if (req.method !== 'POST') {
		return res
			.status(405)
			.json({ message: 'Method not allowed' });
	}

	if (!req.headers.refresh) {
		return res
			.status(403)
			.json({ message: 'Forbidden' });
	}

	verify(req.headers.refresh, process.env.SECRET_KEY_REFRESH, async (error, authData) => {
		if (error) {
			return res
				.status(401)
				.json({ error });
		}
		
		const noiton = new Client({ auth: process.env.NOTION_API_KEY });

		try {
			const response = await noiton.databases.query({
				database_id: process.env.NOTION_USER_DB,
				filter: {
					property: 'UserName',
					title: {
						equals: authData.userName
					}
				}
			});

			const comparation = await compare(authData.password, response.results[0]['properties'].Password.rich_text[0].plain_text);

			if (!comparation) {
				return res
					.status(403)
					.json({ message: 'Forbidden' });
			}

			const userData = {
				id: response.results[0].id,
				rol: response.results[0]['properties'].Rol.select.name
			}

			const token = sign(userData, process.env.SECRET_KEY, { expiresIn: '15s' });

			res
				.status(200)
				.json({ token, authData });
		} catch (error) {
			return res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;