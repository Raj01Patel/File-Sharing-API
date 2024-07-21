const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const FileModel = require("../model/filemodel")
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "127.0.0.1",
    port: "1025",
});


const uploadFolderPath = "uploads";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolderPath),
    filename: (req, file, cb) => {
        console.log(file);
        const filename = uuidv4() + path.extname(file.originalname);
        cb(null, filename);
    }
})

const upload = multer({
    storage: storage,
}).single("attachment");

const uploadFile = async (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            console.log(error);
            return res.status(400).json({
                success: false,
                message: "File size too large",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        console.log(req.file);
        const fileData = {
            originalName: req.file.originalname,
            newName: req.file.filename,
            size: req.file.size,
        };
 
        try {
            const newlyInsertedFile = await FileModel.create(fileData);
            console.log(newlyInsertedFile);
            res.json({
                success: true,
                message: "File uploaded successfully",
                fileId: newlyInsertedFile._id,
            });
        } catch (dbError) {
            console.log(dbError);
            res.status(500).json({
                success: false,
                message: "Database error",
            });
        }
    })
}

const generateSharableLink = async (req, res) => {
    try {
        const fileData = await FileModel.findById(req.params.fileid);
        if (!fileData) {
            // File is not available for this ID
            return res.status(400).json({
                success: false,
                message: "Invalid File ID",
            });
        }
        const sharableLink = `/file/downloads/${req.params.fileid}`;
        res.json({
            success: true,
            message: "File sharable link generated successfully",
            sharableLink: sharableLink,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Database error",
        });
    }
}

const downloadFile = async (req, res) => {
    const fileId = req.params.fileid;
    console.log(fileId);
    const fileData = await FileModel.findById(fileId);
    const path = `uploads/${fileData.newName}`;
    res.download(path, fileData.originalName)
}

const sendEmail = async (req, res) => {
    const fileId = req.body.fileid;
    const sharableLink = `${process.env.BASE_URL}/files/download/${fileId}`;
    // send mail
    const emailData = {
        to: req.body.email,
        from: "do-not-reply@filesharing.com",
        subject: "Your friend has shared a file with you!",
        html: `
          <p>
              Your friend has shared a file with you via filesharing app, please click the link to download the file <a target="_blank" href="${sharableLink}">Click Here</a>
          </p>
      `,
    };
    transporter.sendMail(emailData, (error, info) => {
        if (error) {
            return res.json({
                success: false,
                message: "Unable to send email",
                error: error,
            });
        }
        res.json({
            success: true,
            message: "Mail sent successfully",
        });
    });
};


const fileController = {
    uploadFile,
    generateSharableLink,
    downloadFile,
    sendEmail
}

module.exports = fileController;