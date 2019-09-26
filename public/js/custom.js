
/******************* changing navigation bar active class ********************/

$(document).on('click', '.navbar-nav li', function() {
    $(".navbar-nav li").removeClass("active");
    $(this).addClass("active");
});

$(document).ready(function(){
    
    var href= location.href.toString();
    var url=location.origin
    if(href=== url+"/users/login"){
        $(".navbar-nav li").removeClass("active");
        $(".login").addClass("active");
        $(".navbar-nav .nav-link").addClass('darkNavPlain');
        $(".navbar").addClass('navbar-light');
    }
    
    if(href===url+"/"){
        $(".navbar-nav li").removeClass("active");
        $(".home").addClass("active");
        $(".navbar").addClass('navbar-dark');
    }

    if(href===url+"/users/register"){
        $(".navbar-nav li").removeClass("active");
        $(".register").addClass("active");
        $(".navbar-nav .nav-link").addClass('darkNavPlain');
        $(".navbar").addClass('navbar-light');
    }
    if(href===url+"/calendar"){
        $(".navbar-nav li").removeClass("active");
        $(".calendar").addClass("active");
    }

   


});



/******************** animating homepage svg ************************/



// $(window).scroll(function(){
//     let firstOffset = $(".secondSvg").offset().top-window.innerHeight ;
//     let firstSvgHeight = $(".secondSvg").innerHeight();
    
//     if($(window).scrollTop() >= firstOffset  && $(window).scrollTop() <= firstSvgHeight + $(".secondSvg").offset().top){
        
//       $('.secondSvg #svg_41').css({
          
//           'transform': 'translate('+ (($(window).scrollTop()- firstOffset)/45) +'px,'+ (($(window).scrollTop()- firstOffset)/45) +'px)'
//       });
//     } 

//     let secondOffset = $(".thirdSvg").offset().top-window.innerHeight ;
//     let secondSvgHeight = $(".thirdSvg").innerHeight();
//     // #svg_745
//     if($(window).scrollTop() >= secondOffset  && $(window).scrollTop() <= secondSvgHeight + $(".thirdSvg").offset().top){
//         let x = $(window).scrollTop() - secondOffset ;
        
//         $('.thirdSvg #svg_745').css({
            
//             'transform': 'translate('+ ((x/130)+79) +'px,'+ ((x/130)-42) +'px)'
//         });
//     } 


//     let thirdOffset = $(".fourthSvg").offset().top-window.innerHeight ;
//     let thirdSvgHeight = $(".fourthSvg").innerHeight();
//     // #svg_745
//     if($(window).scrollTop() >= thirdOffset  && $(window).scrollTop() <= thirdSvgHeight + $(".fourthSvg").offset().top){
//         let x = $(window).scrollTop() - thirdOffset ;
        
//         $('.fourthSvg #svg_1').css({
            
//             'transform': 'translate('+ ((x/100)) +'px,'+ ((x/100)) +'px)'
//         });
//     } 
    
// });

/****************** link hover effect ****************/

$(".seeMoreLink").mouseenter(function(){
    
    $(".linkContainer").css({
        "width": "95px"
    });
});
$(".seeMoreLink").mouseleave(function(){
    
    $(".linkContainer").css({
        "width": "77px"
    });
});



/********************* calendar navigation bar switching ****************/
// $(".menu").on('click',function(){
//     $(".dhx_cal_navline").toggleClass("up");
    
   
//     $(".navbar").toggleClass("navUp");
//     $(".navbar  .nav-link").toggleClass("darkNav");
//     $(".dropDown").toggleClass("dropDownColor");
// });

$(".menu").on('click',function(){
    $(".menuContainer").toggleClass("showMenu");
    $(".dhx_cal_data").toggleClass("moveCalendarBody");
    $(".dhx_cal_header").toggleClass("moveCalendarBody");
});

/*************************** validation message */

var error = document.getElementsByClassName("err");
var success = document.getElementsByClassName("success")
if(error||success){
    setTimeout(function(){
        $(".err , .success").css({
            "opacity":"0"
        });
        setTimeout(function(){
            $(".err , .success").remove();
        },400);
        
    },4000);
}


$(".form-control").on("focus",function(){
    $(this).parent().find(".wrong").css({
        "opacity":"0"
    })
    
    setTimeout(function(){
        $(this).parent().find(".wrong").remove();
    },400);

})

/**************************** home page animation **********/

$(document).ready(function() {
    function isScrolledIntoView(elem) {

        let firstOffset = $(elem).offset().top-window.innerHeight ;
        let firstSvgHeight = $(elem).innerHeight();
    
    if($(window).scrollTop() >= firstOffset-100  && $(window).scrollTop() <= firstSvgHeight + $(elem).offset().top){
        return true;
    }
    else{
        return false;
    }
       


    //   var docViewTop = $(window).scrollTop();
    //   var docViewBottom = docViewTop + $(window).height();
  
    //   var elemTop = $(elem).offset().top;
    //   var elemBottom = elemTop + $(elem).height();
    
    //   if(elemTop >= docViewBottom && elemBottom >=docViewBottom ){
          
    //   }
    //   else{
    //       return false;
    //   }
  
    //   return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    // If element is scrolled into view, fade it in
    $(window).scroll(function() {
      $('.scroll-animations .animated').each(function() {
        if (isScrolledIntoView(this) === true) {
            $()
            if($(this).hasClass("aboutImgSecondRow")){
                $(this).addClass("fadeInRight");
            }
            else if($(this).hasClass("aboutContent")||$(this).hasClass("equalHeight")){
                $(this).addClass("fadeIn");
            }
            else if($(this).hasClass("equalHeight")){
                $(this).addClass("fadeIn");
            }
            else if($(this).hasClass("chatBubbles")){
                $(this).addClass("fadeInRight");
            }
            else{
                $(this).addClass('fadeInLeft');
            }
          

        }
      });
    });
});