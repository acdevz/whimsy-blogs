const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
  });
};

export { healthCheck };