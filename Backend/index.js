const express =require("express")
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
require("dotenv").config()

const config=require("./config.json")
const mongoose=require("mongoose")
mongoose.connect(config.connectionstring)

const User=require("./models/user.model")
const Note=require("./models/note.model")

const cors= require("cors")
const app=express()

app.use(express.json())
app.use(cors({origin:"*",}))
 
//Create Account
app.post("/createaccount",async(req,res)=>{
    const{fullName,email,password}=req.body

    if(!fullName)
        return res.status(400).json({error:true,message:"Full name is required"})

    if(!email)
        return res.status(400).json({error:true,message:"Email is required"})

    if(!password)
        return res.status(400).json({error:true,message:"Password is required"})

    const isUser=await User.findOne({email:email})

    if(isUser)
    {
        return res.json({
            error:true,
            messsage:"User already exist"
        })
    }

    const user=new User({
        fullName,
        email,
        password,
    })
    await user.save()

    const accessToken=jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"3600m",
    })
    
    return res.json({
        error:false,
        user,
        accessToken,
        message:"Registration Successfull"
    })
})

//Login
app.post("/login",async(req,res)=>{
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }
    const userInfo=await User.findOne({email:email})

    if(!userInfo)
    {
        return res.status(400).json({message:"User not found"})
    }
    if(userInfo.email==email && userInfo.password==password)
    {
        const user={user:userInfo}
        const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"7d"
        })
        return res.json({
            error:false,
            message:"Login Successful",
            email,
            accessToken,
        })
    }
    else
    {
        return res.status(400).json({
            error:true,
            message:"Invalid Credentials"
        })
    }
});

//Get user
app.get("/getuser",authenticateToken, async(req,res)=>{
    const {user}=req.user
    const isUser= await User.findOne({_id:user._id})

    if(!user)
    {
        return res.sendStatus(401)
    }
    return res.json({
        user:{
            fullName:isUser.fullName,
            email:isUser.email,
            _id:isUser._id,
            createdOn: isUser.createdOn,
        },
        message:""
    })
})

//Add notes
app.post("/addnotes", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    // Validate request body
    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }

    if (!content) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        // Create a new note
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id
        });

        // Save the note to the database
        await note.save();

        // Return success response
        return res.json({
            error: false,
            note,
            message: "Note added successfully"
        });
    } catch (error) {
        // Handle any errors that occur during the save operation
        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
});


//Edit Notes
app.put("/editnotes/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId
    const{title,content,tags,isPinned}=req.body
    const{user}=req.user

    if(!title,!content,!tags){
        return res.status(400).json({
            error:true,
            message:"No changes provided"})
        }
    try{
        const note =await Note.findOne({_id:noteId, userId:user._id})

        if(!note){
            return res.status(404).json({error:true, message:"Note not found"})
        }

        if(title) note.title=title
        if(content) note.content=content
        if(tags) note.tags=tags
        if(isPinned) note.isPinned=isPinned

        await note.save()

        return res.json({
            error:false,
            note,
            message:"Note updated succesfully"
        })
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }   
})

//Get All Notes
app.get("/getallnotes",authenticateToken,async(req,res)=>{
    const {user}=req.user

    try{
        const notes= await Note.find({userId:user._id}).sort({isPinned:-1})
        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully"
        })
    }
    catch(error)
    {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})

//Delete Note
app.delete("/deletenote/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId
    const{user}=req.user

    try{
        const note =await Note.findOne({_id:noteId, userId:user._id})

        if(!note){
            return res.status(404).json({error:true, message:"Note not found"})
        }
        await Note.deleteOne({_id:noteId, userId:user._id})
        return res.json({
            error:false,
            note,
            message:"Note updated succesfully"})
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
    
})

//Update isPinned value
app.put("/updatenotepin/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId
    const{isPinned}=req.body
    const{user}=req.user
    try{
        const note =await Note.findOne({_id:noteId, userId:user._id})

        if(!note){
            return res.status(404).json({error:true, message:"Note not found"})
        }
        
        note.isPinned=isPinned

        await note.save()

        return res.json({
            error:false,
            note,
            message:"Note updated succesfully"
        })
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }   
})

//Search Note
app.get("/searchnote",authenticateToken,async(req,res)=>{
    const{user}=req.user
    const{query}=req.query
    if(!query)
    {
        return res.status(400).json({error:true, message:"Search query is required"})
    }
    try {
        const matchingNotes=await Note.find({
            userId:user._id,
            $or:[
                {title:{$regex:new RegExp(query,"i")}},
                {content:{$regex:new RegExp(query,"i")}}
            ],
        })
        return res.json({
            error:false,
            notes:matchingNotes,
            message:"Notes Matching the search query is retrieved successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})



app.listen(8000)

module.exports = app