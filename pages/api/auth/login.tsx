import { sign } from 'jsonwebtoken';
import { Client } from '@notionhq/client';
import { compare } from 'bcryptjs';

const handler = async (req, res) => {
		if (req.method !== 'POST') {
			return res
				.status(405)
				.json({ message: 'Method not allowed' });
		}

		try {
			const noiton = new Client({ auth: process.env.NOTION_API_KEY });

			const response = await noiton.databases.query({
				database_id: process.env.NOTION_USERS_DB,
				filter: {
					property: 'UserName',
					title: {
						equals: req.body.userName
					}
				}
			});

			const comparation = await compare(req.body.password, response.results[0]['properties'].Password.rich_text[0].plain_text);

			if (!comparation) {
				return res
					.status(403)
					.json({ message: 'Forbidden' });
			}

			const userData = {
				id: response.results[0].id,
				rol: response.results[0]['properties'].Rol.select.name
			}

			const userAuth = {
				userName: req.body.userName,
				password: req.body.password
			}

			const user = {
				fullName: response.results[0]['properties']['Full Name'].rich_text[0].plain_text,
				email: response.results[0]['properties'].Email.email,
				rol: response.results[0]['properties'].Rol.select.name
			}

			const token = sign(userData, process.env.SECRET_KEY, { expiresIn: '15s' });
			const token_refresh = sign(userAuth, process.env.SECRET_KEY_REFRESH, { expiresIn: '3600s' });

			res
				.status(200)
				.json({ token, token_refresh, user });
		} catch (error) {
			res
				.status(400)
				.json({ error });
		}
}

export default handler;