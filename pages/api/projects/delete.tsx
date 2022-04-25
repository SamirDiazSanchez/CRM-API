import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if (req.del()) {
		res.status(200).json({ response: 'delete success' });
	}
}

export default apiMiddleware(handler);