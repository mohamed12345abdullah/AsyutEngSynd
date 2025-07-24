const mongoose = require("mongoose");

const lectureProgressSchema= new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    lecture:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture",
        required:true
    }, 
    attendance:{
        type:String,
        enum:["present","absent","late"],
        default:"absent"
    },
    file:{
        type:String,
    },
    grade:{
        type : Number,
        default : 0
    },
    notes:{
        type:String,
        default : ""
    },
    isSubmitted:{
        type:Boolean,
        default : false
    }

})  



const courseProgressSchema = new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },
    lectureProgress:[lectureProgressSchema],
    

})

const courseProgress=mongoose.model("CourseProgress",courseProgressSchema);
module.exports={submission,courseProgress};




