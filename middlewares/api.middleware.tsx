import { verify } from 'jsonwebtoken';

export const apiMiddleware = (handler) => {
	return (req, res) => {
		req.get = () => {
			if (req.method !== 'GET') {
				res
					.status(401)
					.json({
						response: 'Method not allowed'
					});
			}
			else {
				return true;
			}
		}

		req.post = () => {
			if (req.method !== 'POST') {
				res
					.status(405)
					.json({
						response: 'Method not allowed'
					});
			}
			else {
				return true;
			}
		}

		req.put = () => {
			if (req.method !== 'PUT') {
				res
					.status(405)
					.json({
						response: 'Method not allowed'
					});
			}
			else {
				return true;
			}
		}

		req.del = () => {
			if (req.method !== 'DELETE') {
				res
					.status(405)
					.json({
						response: 'Method not allowed'
					});
			}
			else {
				return true;
			}
		}

		// jwt verify
		req.jwtVerify = (callback) => {
			if(!req.headers.authorization) {
				return res
					.status(403)
					.json({ error: 'token is required' });
			}

			const token = req.headers.authorization.split(" ");

			verify(token[1], process.env.SECRET_KEY, (error, authData) => {
				if (error) {
					return res
						.status(401)
						.json({ error });
				}

				callback(authData);
			});
		}		

		handler(req, res);
	}
}