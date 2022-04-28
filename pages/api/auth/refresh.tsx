import { apiMiddleware } from 'middlewares/api.middleware';
import { sign } from 'jsonwebtoken';

const handler = (req, res) => {
	if (req.post()) {
		req.jwtVerify(async (authData) => {
			const user = {
				id: authData.id,
				rol: authData.rol
			}

			sign(user, process.env.SECRET_KEY, { expiresIn: '300s' }, (error, token) => {
				if (error) {
					return res
						.status(400)
						.json(error);
				}

				res
					.status(200)
					.json({ token });
			});
		});
	}
}

export default apiMiddleware(handler);