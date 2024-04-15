const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken")
const { User } = require("../models/user");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middlewares/auth");
const { Account } = require("../models/Bank");
const router = express.Router();

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional,
    firstName: zod.string().optional,
    lastName: zod.string().optional
})


router.post("/signup", async (req,res) => {
   // const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect Inputs"
        })
    }

    const user = User.findOne({
        username: req.body.username
    })

    if(user._id){
        return res.status(411).json({
            message: "Email already taken / Incorrect Inputs" 
        })
    }
    const dbUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    const userId = dbUser._id;
    //=============================== CREATING NEW ACCOUNT ==========================================================

    await Account.create({
        userId,
        balance: 1 + Math.random()*1000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        message: "User created successfully",
        token: token
    })

})

//==========================================================================================================================================
const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post("/signin", async (req, res) => {
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    const user = User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)

        res.json({
            token: token
        })
        return
    }

    res.status(411).json({
        message: "Error while logging in"
    })
})

router.get("/", authMiddleware, async (req,res) => {

    const {success} = updateBody.safeParse(req.body);

    if(!success){
        res.status(411).json({
            message: "Error while updating the information"
        })
    }

    await User.updateOne(req.body, {
        _id: re.userId
    })
    
    res.json({
        message: "Updated Successfully"
    })
})

//route to get users from backend, filterable via firstName/lastName
router.get("/bulk", async (req,res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map( user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports = router ;