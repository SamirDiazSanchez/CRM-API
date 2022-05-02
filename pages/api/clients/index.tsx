import { Client } from '@notionhq/client';
import { verify } from 'jsonwebtoken';

const handler = (req, res) => {
	if (req.method !== 'GET') {
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

		const notion = new Client({ auth : process.env.NOTION_API_KEY });
		const clients = [];

		const rol = authData.rol;

		let dataQuery;

		if (rol === 'Super Admin') {
			dataQuery = {
				database_id: process.env.NOTION_CLIENT_DB
			}
		}
		else {
			dataQuery = {
				database_id: process.env.NOTION_CLIENT_DB,
				filter: {
					property: 'Active',
					checkbox: {
						equals: true
					}
				}
			}
		}

		try {
			const response = await notion.databases.query(dataQuery);

			response.results.map((item: any) => {
				const client = {
					id: item.id,
					name: item.properties.Name.title[0].text.content,
					lastName: item.properties['Last Name'].rich_text[0].text.content,
					phone: item.properties.Phone.phone_number,
					email: item.properties.Email.email,
					active: item.properties.Active.checkbox
				}

				clients.push(client);
			});
		}
		catch (error) {
			return res
				.status(400)
				.json({ message: "Smetisomething goes wrong" });
		}

		res
			.status(200)
			.json(clients);
	});
}

export default handler;