const express = require("express")
const router = express.Router();

router.get("/health-check", (req, res) => {
    res
      .status(200)
      .send(
        "API response? You got it! No need to keep refreshing, it's all good. 10/10, would serve again."
      );
  });
const userRouter = require("./users");
const adminRouter = require("./admin");
const { isVerifiedUser, verifyRole } = require("../middlewares/authMiddleware");
router.use("/user", userRouter);
router.use("/admin",isVerifiedUser,verifyRole("admin"), adminRouter);


module.exports = router;