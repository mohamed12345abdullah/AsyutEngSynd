

// var x="";

// if(x){
//     console.log("true");
// }else{
//     console.log("false");
// }

// var x="mohamed"
// if(x=="ahmed"){
//     console.log("true");
// }else{
//     console.log("false");
// }





// var percentage=75;
// if(percentage>=50){
//     console.log("pass");
// }else if(percentage>=60){
//     console.log("B");
// }else if(percentage>=70){
//     console.log("C");
// }else if(percentage>=80){
//     console.log("D");
// }else{
//     console.log("F");
// }



// var x=10;
             
// while( x<0){
//     x=x-1;
// }

// console.log(x);
 
 

// var x=0;
// for(var i=1;i<=3; i=i+2){
//     x=x+i;
//     console.log("x:",x);
// }
// console.log(x);

// for(var i=1;i<=10; i=i+1){
//     console.log("i:",i);
// }

// for(var i=1; i<=12; i++){
//     console.log(`5*${i}=${5*i}`); 
// }

// random from 1 to 20

// var random=Math.random()*20
// random=Math.floor(random) 
// console.log(random)

// var content=document.getElementById("content")

// do{
//     var num=prompt("guess the number from 1 to 20")

// }while(num!=random)

// content.innerHTML="good jop"

// var numbers=[]

// do{
//     var num=prompt("enter a number")
//     if(num >0){
//         numbers.push(num)
//     }
// }
// while(num!=0)

// content.innerHTML=numbers
// console.log(numbers)

// var student={
//     name:"ahmed",
//     age:20,
//     grade:"A",
//     subjects:["math","arabic","english"]
// };
// student.subjects.push("chemistry");
// student.age=21;
// student.grade="B";

// console.log(student);
//   نم لقأ هرمع ناك اذإ :لفط 13 اماع . 
//   نيب هرمع ناك اذإ :قهارم 13 و 17 اماع . 
//   نيب هرمع ناك اذإ :غلاب 18 و 59 اماع . 
//   هرمع ناك اذإ :نس ريبك 60 رثكأ وأ اماع . 

// const calcAge=(age)=>{
//     if(age<=13){
//         console.log("child")
//     }else if(age<=17){
//         console.log("teenager")
//     }else if(age<=59){
//         console.log("adult")
//     }else{
//         console.log("senior")
//     }
// }

// calcAge(15)



// function evenOrOdd(num){
//     if(num%2==0){
//         console.log("even")
//     }else{
//         console.log("odd")
//     }
// }

// evenOrOdd(4)



function calc(num1,num2,num3){

    if(num1 > num2  && num1 >num3){
        console.log(num1);
        
    }else if (num2>num1 && num2>num3){
        console.log(num2);
        
    }else{
        console.log(num3);
        
    }
     
}


calc(9,7,5)


