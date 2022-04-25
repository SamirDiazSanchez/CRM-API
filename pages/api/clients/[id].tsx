export default (req, res) => {

	console.log(req.query);

	res.status(200).json({ message: 'post update', id: req.query.id });
}