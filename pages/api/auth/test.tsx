import { verify } from "jsonwebtoken"
import NextCors from "nextjs-cors";

const handler = async (req, res) => {
	await NextCors(req, res, { origin: '*' });

	// if (!req.headers.authorization) {
	// 	return res.status(403).json({ message: 'forbidden' });
	// }
	// const token = req.headers.authorization.split(" ")[1];
	
	// verify(token, process.env.SECRET_KEY, (error, authData) => {
	// 	if (error) {
	// 		return res
	// 			.status(400)
	// 			.json(error);
	// 	}

	// 	res.status(200).json({ authData });
	// })
	
	if (!req.headers.refresh) {
		return res
			.status(403)
			.json({ message: 'Forbidden' });
	}

	verify(req.headers.refresh, process.env.SECRET_KEY_REFRESH, (error, authData) => {
		if (error) {
			return res
				.status(401)
				.json({ message: 'Unauthorized' });
		}

		res
			.status(200)
			.json({ authData });
	})
}

export default handler;