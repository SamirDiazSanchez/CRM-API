import { sign } from 'jsonwebtoken';
import { apiMiddleware } from 'middlewares/api.middleware';
import { Client } from '@notionhq/client';
import { compare } from 'bcryptjs';

const handler = async (req, res) => {
		if (req.post()) {
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

				const dbPassword = response.results[0]['properties'].Password.rich_text[0].plain_text;

				const userData = {
					id: response.results[0].id,
					rol: response.results[0]['properties'].Rol.select.name
				}

				const user = {
					fullName: response.results[0]['properties']['Full Name'].rich_text[0].plain_text,
					email: response.results[0]['properties'].Email.email,
					rol: response.results[0]['properties'].Rol.select.name
				}

				const comparation = await compare(req.body.password, dbPassword);

				if (!comparation) {
					return res
						.status(401)
						.json({ errorMessage: 'Bad Login' })
				}

				sign(userData, process.env.SECRET_KEY, { expiresIn: '300s' }, (err, token) => {
					// sign(userData, process.env.SECRET_KEY, (err, token) => {
					res
						.status(200)
						.json({
							user,
							token
						});
				})
			} catch (error) {
				res
					.status(400)
					.json({ error });
			}
		}
}

export default apiMiddleware(handler);

