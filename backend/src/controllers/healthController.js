exports.health = (req, res) => {
  res.json({ success: true, name: "RICHU API", status: "running" });
};
