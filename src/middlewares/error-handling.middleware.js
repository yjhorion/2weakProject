export default function (error, req, res, next) {
  console.error(error);

  res.status(400).json({ message: error.message });
}
