export default function (error, req, res, next) {
  console.error(error);

<<<<<<< HEAD
  res.status(400).json({ error: error.message });
=======
  res.status(400).json({ error: err.message });
>>>>>>> 6db91f577553823053ffd5bae39150518afcaca5
}
