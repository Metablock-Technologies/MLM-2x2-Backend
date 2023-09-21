const express = require("express")
const router = express.Router();
const { s3Client } = require('../config/awsConfig');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
router.get("/health-check", (req, res) => {
    res
        .status(200)
        .send(
            "API response? You got it! No need to keep refreshing, it's all good. 10/10, would serve again."
        );
});


router.get("/image/:key", async (req, res, next) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.IMAGE_BUCKET,
            Key: req.params.key,

        });

        let response = await s3Client.send(command);
        response.Body?.pipe(res);
    } catch (err) {
        next(err);
    }
});

const paymentRouter = require("./payment")
const userRouter = require("./users");
const adminRouter = require("./admin");
const { isVerifiedUser, verifyRole } = require("../middlewares/authMiddleware");
router.use("/user", userRouter);
router.use("/admin", isVerifiedUser, verifyRole("admin"), adminRouter);
router.use("/payment", paymentRouter);


module.exports = router;