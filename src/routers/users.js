const express = require("express");
const sharp = require("sharp")
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/accounts")
const multer = require("multer");
const User = require("../models/user");
const router = new express.Router();

router.get("/test", (req, res) => {
  res.send("This is from my other router");
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    await sendWelcomeEmail(user.email, user.name)
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(401).send(err);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500);
  }
});

router.post("/user/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.splice();
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const validKeys = ["name", "email", "password", "age"];
  const receivedKeys = Object.keys(req.body);
  const isValid = receivedKeys.every((key) => validKeys.includes(key));

  if (!isValid) {
    res.status(400).send("Invalid Request");
  } else {
    try {
      const user = await User.findById(req.user._id);
      receivedKeys.forEach((receivedKey) => {
        user[receivedKey] = req.body[receivedKey];
      });

      await user.save();
      // const update = await User.findByIdAndUpdate(req.params.id, req.body, {
      //   new: true,
      //   runeValidators: true,
      // });
      // if (!update) {
      //   res.status(404).send();
      // }
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user._id });
    // await req.user.remove()
    sendGoodbyeEmail(user.email, user.name)
    res.status(200).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please send a Picture"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer =await sharp( req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message });
  }
);

router.delete("/user/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/user/:id/avatar", async(req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
      throw new Error()
    }

    res.set("Content-Type", "image/jpg")
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router;
