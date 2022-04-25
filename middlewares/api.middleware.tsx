export const apiMiddleware = (handler) => {
	return (req, res) => {
		res.get = () => {
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

		res.post = (callback) => {
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

		res.put = (callback) => {
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

		res.del = (callback) => {
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

		handler(req, res);
	}
}