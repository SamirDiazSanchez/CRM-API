import { sign, verify } from 'jsonwebtoken';
import { Client } from '@notionhq/client';
import { compare } from 'bcryptjs';
import NextCors from 'nextjs-cors';
import { LoginModel } from 'models/loginModel';
import { UserModel } from 'models/userModel';
import { AuthModel } from 'models/authModel';

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
				.json({ message: error.message });
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

			const loginData: LoginModel = {
				userName: authData.userName,
				password: authData.password
			}

			const user: UserModel = {
				id: response.results[0].id,
				userName: response.results[0]['properties'].UserName.title[0].plain_text,
				password: null,
				fullName: response.results[0]['properties']['Full Name'].rich_text[0].plain_text,
				email: response.results[0]['properties'].Email.email,
				rol: response.results[0]['properties'].Rol.select.nameauthData,
				active: response.results[0]['properties'].Active.checkbox
			}

			const token = sign(user, process.env.SECRET_KEY, { expiresIn: '15s' });
			const refresh_token = sign(loginData, process.env.SECRET_KEY_REFRESH, { expiresIn: '1800s' });

			const auth: AuthModel = {
				token,
				refresh_token,
				user
			}

			res
				.status(200)
				.json(auth);
		} catch (error) {
			return res
				.status(400)
				.json({ message: "Something goes wrong" });
		}
	});
}

export default handler;