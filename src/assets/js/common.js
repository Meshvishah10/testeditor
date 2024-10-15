$(document).ready(function() {
	$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});

function myFunction(x) {
  x.classList.toggle("change");
}

$(function () {
    var windowWidth = $(window).width();
    if (windowWidth > 1025) {
        $("#sidebar-wrapper").mCustomScrollbar({
            axis:"Y",
            theme: "minimal-dark",
            scrollButtons:{ enable: true },
             mouseWheel: true
        });
    }
});

$(document).ready(function(){
  $("#decimal").keyup(function(){
    var number = ($(this).val().split('.'));
    if (number[1]?.length > 2)
    {
        var salary = parseFloat($("#decimal").val());
        $("#decimal").val( salary.toFixed(2));
    }
          });
})

// $(function(){
//   $("input[type=date]").datepicker({
//     dateFormat: 'mm-dd-yyyy',
//     onSelect: function(dateText, inst) {
//       $(inst).val(dateText); // Write the value in the input
//     }
//   });
// })

// Main Menu Dropdown Js
// $(function() {
//     $('#main-menu').smartmenus({
//         subMenusSubOffsetX: 1,
//         subMenusSubOffsetY: -8,
// 		collapsibleBehavior: 'accordion-toggle'
//     });
//     $('#main-menu').smartmenus('keyboardSetHotkey', 123, 'shiftKey');
// });

// jQuery(function($) {
//     var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
//     $(".sm > li > a").each(function() {
//         console.log("Getting name", pgurl , $(this).attr("routerLink"));
//         if ($(this).attr("routerLink") == pgurl || $(this).attr("routerLink") == '')
//             $(this).addClass("current");
//         else
//             $(this).removeClass("current");
//     })
// });

$(document).ready(function() {

  $('.toggle-accordion').on('click', () => {
    const accordionId = $('.toggle-accordion').attr('accordion-id');
    const numPanelOpen = $(`${accordionId} .collapse.show`).length;

    $('.toggle-accordion').toggleClass('active');

    if (numPanelOpen === 0) {
      openAllPanels(accordionId);
    } else {
      closeAllPanels(accordionId);
    }
  });
  
    openAllPanels = function(aId) {
      // console.log("setAllPanelOpen");
      $(`${aId} .collapse:not(".show")`).collapse('show');
    }
    closeAllPanels = function(aId) {
      // console.log("setAllPanelclose");
      $(`${aId} .collapse.show`).collapse('hide');
    }
       
  });



// DatePicker Js
    // jQuery(".date-picker").datetimepicker({
    //     format: "L",
    //     icons: {
    //         next: "fa fa-chevron-right",
    //         previous: "fa fa-chevron-left"
    //     }
    // });

// tooltip
// If you do not want to use jQuery you can use Pure JavaScript. See FAQ below
$( document ).ready(function() {
    $('[data-bs-toggle="tooltip"]').tooltip();
});

// Easy-responsive-tabs Js
$(document).ready(function() {
	//Horizontal Tab
	$('#ClientProfile').easyResponsiveTabs({
		type: 'default', //Types: default, vertical, accordion
		width: 'auto', //auto or any width like 600px
		fit: true, // 100% fit in a container
		tabidentify: 'hor_1', // The tab groups identifier
		activate: function(event) { // Callback function if tab is switched
			var $tab = $(this);
			var $info = $('#nested-tabInfo');
			var $name = $('span', $info);
			$name.text($tab.text());
			$info.show();
		}
	});
	
});

/*Show hide div*/
    // document.getElementById('show-element').onclick = function() {
    //     var element = document.getElementById('to-show');
    //     if (element.className === 'hide') {
    //     element.className = 'show';
    //     document.getElementsByTagName('body')[0].className = 'on';
    //     document.getElementById('show-element').className = 'active';
    //     } else {
    //     element.className = 'hide';
    //     document.getElementsByTagName('body')[0].className = 'off';
    //     document.getElementById('show-element').className = '';
    //     }
    // }


    $(document).ready(function(){
      // Toggle collapse on button click
      $('.accordion-button').click(function(){
          $(this).toggleClass('collapsed');
          var target = $(this).attr('data-bs-target');
          $(target).collapse('toggle');
      });
  });
  



  