// $(window).on('load', function () {
//     $(".ct_loader_main").hide();
//     });
$(document).ready(function(){
    $('.ct_menu_bar').click(function(){
        $('.ct_menu_list ul').addClass('ct_menu_show')
    })
    $('.ct_close_bar').click(function(){
        $('.ct_menu_list ul').removeClass('ct_menu_show')
    })


    // Testimonial Slider Js S
    $('.ct_testimonial_slider').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        responsive:{
            0:{
                items:1
            },
            767:{
                items:2
            },
            1000:{
                items:3
            }
        }
    })

    // Calender Slider S

    $('.ct_calender_slider').owlCarousel({
        loop:true,
        margin:20,
        nav:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:4
            }
        }
    })
    // Testimonial Slider Js E

    AOS.init();


    $(window).scroll(function() {    
        var scroll = $(window).scrollTop();
    
         //>=, not <=
        if (scroll >= 200) {
            //clearHeader, not clearheader - caps H
            $(".ct_navbar").addClass("ct_sticky_menu");
        }else{
            $(".ct_navbar").removeClass("ct_sticky_menu");
        }
    }); //missing );

})