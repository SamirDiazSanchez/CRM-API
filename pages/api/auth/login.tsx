import { sign } from 'jsonwebtoken';
import { Client } from '@notionhq/client';
import { compare } from 'bcryptjs';
import NextCors from 'nextjs-cors';
import { AuthModel } from 'models/authModel';
import { UserModel } from 'models/userModel';
import { LoginModel } from 'models/loginModel';

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });
	
	if (req.method !== 'POST') {
		return res
			.status(405)
			.json({ message: 'Method not allowed' });
	}

	const authData: LoginModel = {
		userName: req.body.userName,
		password: req.body.password
	}

	const noiton = new Client({ auth: process.env.NOTION_API_KEY });

	let response;
	try {
		response = await noiton.databases.query({
			database_id: process.env.NOTION_USER_DB,
			filter: {
				and: [
					{
						property: 'UserName',
						title: {
							equals: authData.userName
						}
					},
					{
						property: 'Active',
						checkbox: {
							equals: true
						}
					}
				]
			}
		});

		
	} catch (error) {
		return res
			.status(400)
			.json({ message: "Something goes wrong" });
	}

	if (response.results.length === 0) {
		return res
			.status(403)
			.json({ message: 'User not found' });
	}

	const comparation = await compare(authData.password, response.results[0]['properties'].Password.rich_text[0].plain_text);

	if (!comparation) {
		return res
			.status(403)
			.json({ message: 'Password is wrong' });
	}

	const user: UserModel = {
		id: response.results[0].id,
		userName: response.results[0].properties.UserName.title[0].plain_text,
		fullName: response.results[0]['properties']['Full Name'].rich_text[0].plain_text,
		password: null,
		email: response.results[0]['properties'].Email.email,
		rol: response.results[0]['properties'].Rol.select.name,
		active: response.results[0].properties.Active.checkbox
	}

	const token = sign(user, process.env.SECRET_KEY, { expiresIn: '1500s' });
	const refresh_token = sign(authData, process.env.SECRET_KEY_REFRESH, { expiresIn: '1800s' });

	const auth: AuthModel = {
		token,
		refresh_token,
		user
	}

	res
		.status(200)
		.json(auth);
}

export default handler;