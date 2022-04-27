import { sign } from 'jsonwebtoken';
import { apiMiddleware } from 'middlewares/api.middleware';

const handler =  (req, res) => {
		if (req.post()) {
			sign({}, process.env.SECRET_KEY, (err, token) => {
				res
					.status(200)
					.json({ token });
			})
		}
}

export default apiMiddleware(handler);

