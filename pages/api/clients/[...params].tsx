const create = (req, res) => {
	res.status(200).json({ message: 'ok' });
}

export default (req, res) => {
	const params = req.query.params;

	const route = params[0];

	switch(route) {
		case 'get':
			if (req.method !== 'GET') {
				return res
					.status(405)
					.json({ message: 'Method not allowed' });
			}

			create(req, res);
			break;

		case 'create':
			if (req.method !== 'POST') {
				return res
					.status(405)
					.json({ message: 'Method not allowed' });
			}

			res.status(200).json({ message: '20' });
	}
}