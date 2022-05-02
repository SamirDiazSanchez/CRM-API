import NextCors from 'nextjs-cors';

const handler = async (req, res) => {
	await NextCors(req, res, {
		methods: ['GET'],
		origin: '*'
 });

 res.json({ message: 'Hello NextJs Cors!' });
}

export default handler;