import { apiMiddleware } from "middlewares/api.middleware";

const handler = (req, res) => {
	if(req.get()) {
		res.status(200).json({ message: 'get success' });
	}
}

export default apiMiddleware(handler);