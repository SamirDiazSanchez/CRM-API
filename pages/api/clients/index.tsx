import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	req.get();

	res.status(200).json({ response: 'success' });
}

export default apiMiddleware(handler);