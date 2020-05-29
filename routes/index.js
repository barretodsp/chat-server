

module.exports = (router) => {
  router.post("/test", (req, res) => {
    res.send({ response: "I'm alive" }).status(200);
  });
  return router
}