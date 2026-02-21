const express = require("express");
const router = express.Router();
const Placement = require("../models/placement");
const sharp = require("sharp");
const cors = require("cors");

router.use(cors());

// ================= IMAGE RESIZER =================
async function resizeBase64(base64String) {
  if (!base64String) return "";
  const buffer = Buffer.from(base64String.split(",")[1], "base64");
  const resized = await sharp(buffer)
    .resize(300, 300)
    .jpeg({ quality: 70 })
    .toBuffer();
  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}

// ================= GET PLACEMENTS BY DOMAIN =================
router.get("/:domain", async (req, res) => {
  try {
    const domain = req.params.domain.trim();
    const placements = await Placement.find({
      instituteDomain: { $regex: `^${domain}$`, $options: "i" },
    });
    res.json(placements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= POST =================
router.post("/:domain", async (req, res) => {
  try {
    const image = req.body.imageBase64
      ? await resizeBase64(req.body.imageBase64)
      : "";

    const placement = new Placement({
      name: req.body.name,
      college: req.body.college,
      company: req.body.company,
      position: req.body.position,
      packageAmount: req.body.packageAmount,
      image,
      instituteDomain: req.params.domain.trim(),
    });

    await placement.save();
    res.status(201).json(placement);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// ================= PUT =================
router.put("/:domain/:id", async (req, res) => {
  try {
    const placement = await Placement.findOne({
      _id: req.params.id,
      instituteDomain: { $regex: `^${req.params.domain.trim()}$`, $options: "i" },
    });

    if (!placement) return res.status(404).json({ message: "Not found" });

    placement.name = req.body.name || placement.name;
    placement.college = req.body.college || placement.college;
    placement.company = req.body.company || placement.company;
    placement.position = req.body.position || placement.position;
    placement.packageAmount =
      req.body.packageAmount || placement.packageAmount;

    if (req.body.imageBase64)
      placement.image = await resizeBase64(req.body.imageBase64);

    await placement.save();
    res.json(placement);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// ================= DELETE =================
router.delete("/:domain/:id", async (req, res) => {
  try {
    await Placement.deleteOne({
      _id: req.params.id,
      instituteDomain: { $regex: `^${req.params.domain.trim()}$`, $options: "i" },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
