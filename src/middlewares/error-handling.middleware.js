export default function (error, req, res, next) {
  console.error(error);

  res.status(400).json({ error: error.message });
}
