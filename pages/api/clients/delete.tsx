import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if (res.del()) {
		res.status(200).json({ response: 'succeess' });
	}
}

export default apiMiddleware(handler);