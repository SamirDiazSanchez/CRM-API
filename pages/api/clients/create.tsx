import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if (req.post()) {
		res.status(201).json({ response: 'success' });
	}
}

export default apiMiddleware(handler);