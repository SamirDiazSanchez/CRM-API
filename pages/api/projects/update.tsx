import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if (req.put()) {
		res.status(200).json({ response: 'update success' });
	}
}

export default apiMiddleware(handler);