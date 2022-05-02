import { Client } from "@notionhq/client";
import { verify } from "jsonwebtoken";

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

		const notion = new Client({ auth: process.env.NOTION_API_KEY });
		
		try {
			const response = await notion.databases.query({
				database_id: process.env.NOTION_USER_DB
			});

			console.log(response.results)

			const userResponse: any = response.results.filter(user => user.id === authData.id);

			const user = {
				userName: userResponse[0].properties.UserName.title[0].plain_text,
				fullName: userResponse[0].properties['Full Name'].rich_text[0].plain_text,
				email: userResponse[0].properties.Email.email,
				rol: userResponse[0].properties.Rol.select.name,
				active: userResponse[0].properties.Active.checkbox
			}

			res
				.status(200)
				.json(user);

		} catch (error) {
			return res
				.status(400)
				.json({ message: "Smetisomething goes wrong" });
		}
	})
}

export default handler;