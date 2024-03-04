const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Task = require("./task")
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, avatar : {
    type: Buffer
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw Error("Password should not include password.");
      }
      if (value.length < 6) {
        throw new Error("Password needs to be more than Six characters");
      }
    },
  },
  email: {
    unique: true,
    type: String,
    trim: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email.");
      }
    },
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be greater than 100");
      }
    },
  }, tokens : [{
    token : {
      type : String,
      required : true
  }
  }]
},{
  timestamps: true
});

userSchema.virtual("tasks", {
  ref : 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObj = user.toObject()
  delete userObj.tokens
  delete userObj.password
  delete userObj.avatar
  return userObj
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({_id : user._id.toString()}, process.env.JWT_SECRETE)
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {a
    throw new Error("Unable to login");
  }

  return user
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getQuery());
    await Task.deleteMany({owner : user._id})
    next()
})

const User = mongoose.model("User", userSchema);

module.exports = User;
