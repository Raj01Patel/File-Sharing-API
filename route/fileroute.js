const express = require('express');
const router = express.Router();
const fileController = require("../controller/filecontroller")

router.post("/api/file", fileController.uploadFile);
router.get("/file/:fileid",fileController.generateSharableLink);
router.get("/file/download/:fileid",fileController.downloadFile);
router.post("/api/file/send",fileController.sendEmail);

module.exports = router;