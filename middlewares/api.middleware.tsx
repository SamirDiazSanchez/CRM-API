export const apiMiddleware = (handler) => {
	return (req, res) => {
		req.get = () => {
			if (req.method !== 'GET') {
				return res
					.status(405)
					.json({ response: 'Method not allowed' });
			}
		}

		req.post = () => {
			if (req.method !== 'POST') {
				return res
					.status(405)
					.json({ response: 'Method not allowed' });
			}
		}

		req.put = () => {
			if (req.method !== 'PUT') {
				return res
					.status(405)
					.json({ response: 'Method not allowed' });
			}
		}

		req.del = () => {
			if (req.method !== 'DELETE') {
				return res
					.status(405)
					.json({ response: 'Method not allowed' });
			}
		}

		handler(req, res);
	}
}