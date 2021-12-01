console.log("connected");
var Banner = document.querySelector(".cookie-container");
var ButtonCookie= document.querySelector(".cookie-button");
ButtonCookie.addEventListener("click", function(){
	Banner.classList.remove("shown");
	localStorage.setItem("banner-displayed", true);
})

if(!localStorage.getItem("banner-displayed")){
Banner.classList.add("shown");	
	
}