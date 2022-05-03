import { verify } from "jsonwebtoken"

const handler = (req, res) => {
	if (!req.headers.authorization) {
		return res.status(403).json({ message: 'forbidden' });
	}

	const token = req.headers.authorization.split(" ")[1];
	verify(token, process.env.SECRET_KEY, (error, authData) => {
		if (error) {
			return res.status(400).json(error);
		}

		res.status(200).json({ authData });
	})
}

export default handler;