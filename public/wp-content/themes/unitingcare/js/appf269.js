jQuery(document).ready(function($) {
	
	/*
	 * Site Notice
	 */
	if(sessionStorage.visited) {
		// Retrieve data
		console.log("Visit = " + sessionStorage.visited);
	} else {
		sessionStorage.visited = true;
		if ($('.js-site-notice').length > 0) {
			$('body').addClass('locked');
			$('.js-site-notice').addClass('popup--active');
		}
	}
	
	/*
	 * Sliders
	 */
	var $window = $(window),
        flexslider = {
        	vars: {}
        };
	
	defaultSlider('.flexslider:not([data-columnSlider])');

	//customControlsSlider('.flexslider[data-customControls="true"])');
	
	columnSlider('.flexslider[data-columnSlider="large"]', largeColumnSize());
	columnSlider('.flexslider[data-columnSlider="small"]', smallColumnSize());
	columnSlider('.flexslider[data-columnSlider]', 1);

	/*
	 * Resize/load functions
	 */
	
	// Chooses how many thumbnails to show depending on screen size.
	function largeColumnSize() {
		return (window.innerWidth <= 639) ? 1 : 2;
	}
	function smallColumnSize() {
		return (window.innerWidth <= 639) ? 1 :
		(window.innerWidth <= 1023) ? 2 : 3; 
	}
	
	$(window).bind('resize load', function() {
		
		resizeElements();
		
		if ($('.flexslider[data-columnSlider="large"]').length > 0) {
			var _largeColumnSize = largeColumnSize();

			$('.flexslider[data-columnSlider="large"]').data("flexslider").vars.minItems = _largeColumnSize;
			$('.flexslider[data-columnSlider="large"]').data("flexslider").vars.maxItems = _largeColumnSize;
			$('.flexslider[data-columnSlider="large"]').data("flexslider").vars.move = _largeColumnSize;
		}
		if ($('.flexslider[data-columnSlider="small"]').length > 0) {
			var _smallColumnSize = smallColumnSize();

			$('.flexslider[data-columnSlider="small"]').data("flexslider").vars.minItems = _smallColumnSize;
			$('.flexslider[data-columnSlider="small"]').data("flexslider").vars.maxItems = _smallColumnSize;
			$('.flexslider[data-columnSlider="small"]').data("flexslider").vars.move = _smallColumnSize;
		}
		
	});
	
	/*
	 * Set up device menu
	 */
	$('.site-navigation__navigation > ul > li:not(.current_page_item):not(.current_page_ancestor):not(.current-page-ancestor) > ul.sub-menu').hide();
	$('.site-navigation__navigation > ul > li.current_page_item > .js-menu-expand.menu-arrow--closed, .site-navigation__navigation > ul > li.current_page_ancestor > .js-menu-expand.menu-arrow--closed, .site-navigation__navigation > ul > li.current-page-ancestor > .js-menu-expand.menu-arrow--closed').removeClass('menu-arrow--closed').addClass('menu-arrow--open');
	
	$(document).on('click', '.js-menu-expand.menu-arrow--closed', function(e) {
		e.preventDefault();
		$(this).parent('nav').find('.js-menu-expand.menu-arrow--open').removeClass('menu-arrow--open').addClass('menu-arrow--closed');
		$(this).parent('nav').find('.site-navigation__navigation ul.sub-menu').slideUp(250);
		$(this).removeClass('menu-arrow--closed').addClass('menu-arrow--open');
		$(this).parent('li').find('ul.sub-menu:first').slideDown(250);
	});
	
	$(document).on('click', '.js-menu-expand.menu-arrow--open', function(e) {
		e.preventDefault();
		$(this).removeClass('menu-arrow--open').addClass('menu-arrow--closed');
		$(this).parent('li').find('ul.sub-menu:first').slideUp(250);
	});
	
	/*
	 * Menu show/hide
	 */
	$(document).on('click', '.js-menu-trigger.menu-button--closed', function(e) {
		e.preventDefault();
		$(this).removeClass('menu-button--closed').addClass('menu-button--open');
		$('body').addClass('locked');
		$('.top-bar').addClass('top-bar--nav-open');
		$('.site-navigation').addClass('site-navigation--visible');
		$('.acknowledgement-banner').addClass('acknowledgement-banner--hidden');
		$('html,body').animate({
			scrollTop: 0
		}, 250);
		
	});
	
	$(document).on('click', '.js-menu-trigger.menu-button--open', function(e) {
		e.preventDefault();
		$(this).removeClass('menu-button--open').addClass('menu-button--closed');
		$('body').removeClass('locked');
		$('.top-bar').removeClass('top-bar--nav-open');
		$('.site-navigation').removeClass('site-navigation--visible');
		$('.acknowledgement-banner').removeClass('acknowledgement-banner--hidden');
		$('html,body').animate({
			scrollTop: 0
		}, 250);
	});
	
	/*
	 * Next Section
	 */
	$(document).on('click', '.js-next-section', function(e) {
		e.preventDefault();
		var scroll_target = $(this).parents('header, section').next('section').offset().top;
		$('html,body').animate({
			scrollTop: scroll_target
		}, 1000);
	});
	
	/*
	 * Anchor Link
	 */
	$(document).on('click', '.js-anchor-link', function(e) {
		e.preventDefault();
		var scroll_target = $(this).attr('data-target');
		$('html,body').animate({
			scrollTop: $('#' + scroll_target).offset().top
		}, 1000);
	});
	
	/*
	 * Popups
	 */
	$(document).on('click', '.js-popup-trigger', function (e) {
		e.preventDefault();
		var data_trigger = $(this).attr('data-trigger');
		$('body').addClass('locked');
		$('.js-popup[data-target=' + data_trigger + ']').addClass('popup--active');
	});
	
	// AJAX popup
	$(document).on('click', '.js-ajax-trigger, .js-ajax-link', function (e) {
		e.preventDefault();
		var target_content	= $(this).attr('href');
		
		if ($('.js-ajax-popup').hasClass('popup--active')) {
			
			$('.popup__content').fadeTo(500,0, function() {
				$('.js-ajax-loader').empty().load(target_content + ' .js-ajax-content', function(responseTxt, statusTxt, xhr){
					if(statusTxt === "success") {
						$('body').addClass('locked');
						$('.js-ajax-popup').addClass('popup--active');
						$('.popup__content').fadeTo(500,1);
					}
					if(statusTxt === "error") {
						alert("Error: " + xhr.status + ": " + xhr.statusText);
					}
				})
			});
			
			
		} else {
			$('.js-ajax-loader').empty().load(target_content + ' .js-ajax-content', function(responseTxt, statusTxt, xhr){
				if(statusTxt === "success") {
					$('body').addClass('locked');
					$('.js-ajax-popup').addClass('popup--active');
				}
				if(statusTxt === "error") {
					alert("Error: " + xhr.status + ": " + xhr.statusText);
				}
			});
		}
		
		
	});

	$(document).on('click', '.js-close-trigger', function (e) {
		e.preventDefault();
		$('body').removeClass('locked');
		$(this).parents('.popup').removeClass('popup--active');
	});
	
	/*
	 * Acknowledgement
	 */
	$(document).on('click', '.js-close-acknowledgement', function (e) {
		e.preventDefault();
		$(this).parents('.acknowledgement-container').removeClass('acknowledgement--show');
		$(this).parents('.acknowledgement-container').addClass('acknowledgement--hidden');
		$(this).parents('.acknowledgement-container').siblings('.acknowledgement-open-container').removeClass('acknowledgement-open-container--hidden');
		$(this).parents('.acknowledgement-container').siblings('.acknowledgement-open-container').addClass('acknowledgement-open-container--show');
		
	});
	$(document).on('click', '.js-open-acknowledgement', function (e) {
		e.preventDefault();
		$(this).parents('.acknowledgement-open-container').removeClass('acknowledgement-open-container--show');
		$(this).parents('.acknowledgement-open-container').addClass('acknowledgement-open-container--hidden');
		$(this).parents('.acknowledgement-open-container').siblings('.acknowledgement-container').addClass('acknowledgement--show');
		$(this).parents('.acknowledgement-open-container').siblings('.acknowledgement-container').removeClass('acknowledgement--hidden');
	});
	
	/*
	 * Accordion
	 */
	$('.accordion__panel--closed .panel__content').hide();
	$(document).on('click', '.accordion__panel--closed > .panel__title', function (e) {
		e.preventDefault();
		$(this).parent('.accordion__panel').siblings('.accordion__panel--open').find('.panel__content').each(function () {
			$(this).slideUp(500);
			$(this).parent('.accordion__panel').removeClass('accordion__panel--open').addClass('accordion__panel--closed');
			$(this).parent('.accordion__panel').parent('.accordion').find('.accordion__panel--open .panel__content').each(function () {
				$(this).slideUp(500);
				$(this).parent('.accordion__panel').removeClass('accordion__panel--open').addClass('accordion__panel--closed');
			});
		});
		$(this).parent('.accordion__panel').removeClass('accordion__panel--closed').addClass('accordion__panel--open');
		$(this).parent('.accordion__panel').children('.panel__content').slideDown(500, function () {
			$('html,body').animate({
				scrollTop: $(this).parent('.accordion__panel').offset().top,
			}, 500);
		});
	});
	$(document).on('click', '.accordion__panel--open > .panel__title', function (e) {
		e.preventDefault();
		$(this).parent('.accordion__panel').removeClass('accordion__panel--open').addClass('accordion__panel--closed');
		$(this).parent('.accordion__panel').find('.panel__content').slideUp(500);
		$(this).parent('.accordion__panel').find('.accordion__panel--open .panel__content').each(function () {
			$(this).slideUp(500);
			$(this).parent('.accordion__panel').removeClass('accordion__panel--open').addClass('accordion__panel--closed');
		});
	});
		
	/*
	 * Video polyfill
	 */
	$('video').each(function () {
		enableInlineVideo(this, {
			iPad: true
		});
	});
		
	/*
	 * Wrap iFrames
	 */
	if ($('iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0) {
		$('iframe[src*="youtube"], iframe[src*="vimeo"]').each(function() {
			$(this).wrap('<div class="object-embed">');
		});
	}
		
	/*
	 * Fancybox
	 */
	$('[data-fancybox], a[href$=".gif"], a[href$=".jpg"], a[href$=".png"], a[href$=".bmp"]').fancybox({
		infobar : false,
		buttons : [
			'close'
		],
		animationEffect : 'fade',
		loop : true
	});
	
	$('[data-fancybox-iframe]').fancybox({
		type : 'iframe',
		infobar : false,
		buttons : [
			'close'
		],
		animationEffect : 'fade'
	});
	
	/* 
	 * Custom select
	 */
	jcf.setOptions('Select', {
		wrapNative: false,
		wrapNativeOnMobile: true,
		fakeDropInBody: false,
		maxVisibleItems: 6
	});
	jcf.replace($('select'));
	$(document).bind('gform_page_loaded', function(){
		jcf.replace($('select'));
	});
	$(document).bind('gform_post_render', function(){
		jcf.replace($('select'));
	});
	
	// Location Map
	if ($('.location-map-container').length >= 1) {
		initLocationMap();
	}
	
});
	
//Adjust video size
$.fn.resizeVideo = function() {
  
	//Gather browser and current image size
	var srcWidth			= $(this).prop('videoWidth'),
	srcHeight			= $(this).prop('videoHeight'),
	containerWidth		= $(this).parent().outerWidth(),
	containerHeight		= $(this).parent().outerHeight(),
	ratio				= srcHeight / srcWidth;

	//Resize image to proper ratio
	if ((containerHeight / containerWidth) > ratio){
		$(this).css({height:containerHeight});
		$(this).css({width:containerHeight / ratio});
	} else {
		$(this).css({width:containerWidth});
		$(this).css({height:containerWidth * ratio});
	}
	
	return false;
};

function resizeElements() {
	"use strict";
	
	setTimeout(function() { 
		$("video.js-banner-video").each(function () {
			$(this).resizeVideo();
			$(this).addClass("js-banner-video--active");
		})
	}, 500);
}

function defaultSlider(sliderInstance) {
	"use strict";

	$(sliderInstance).each(function () {
		
		var _animation		= $(this).attr('data-animation'),
			_controlNav		= $(this).attr('data-controlNav'),
			_directionNav	= $(this).attr('data-directionNav'),
			_animationLoop	= $(this).attr('data-animationLoop'),
			_pauseOnAction	= $(this).attr('data-pauseOnAction'),
			_pauseOnHover	= $(this).attr('data-pauseOnHover'),
			_startAt		= $(this).attr('data-startAt'),
			_slideshow		= $(this).attr('data-slideshow'),
			_slideshowSpeed	= $(this).attr('data-slideshowSpeed'),
			_animationSpeed	= $(this).attr('data-animationSpeed');
		
		$(this).flexslider({
			animation: _animation ? _animation : 'fade',
			controlNav: _controlNav === 'false' ? false : true,
			directionNav: _directionNav === 'true' ? true : false,
			prevText: '<span class="slider-nav-icon"><i class="far fa-chevron-left"></i></span>',
			nextText: '<span class="slider-nav-icon"><i class="far fa-chevron-right"></i></span>', 
			controlsContainer: $(this).parents('section').find('.flexslider .manual-controls'),
			manualControls: $(this).parents('section').find('.flex-control-nav li'),
			customDirectionNav: $(this).parents('section').find('.slider-controls ul li a'),
			animationLoop: _animationLoop === 'false' ? false : true,
			pauseOnAction: _pauseOnAction === 'false' ? false : true,
			pauseOnHover: _pauseOnHover === 'false' ? false : true,
			startAt: _startAt ? _startAt : 0,
			slideshow: _slideshow === 'false' ? false : true,
			slideshowSpeed: _slideshowSpeed ? _slideshowSpeed : 7500,
			animationSpeed: _animationSpeed ? _animationSpeed : 1000,
			before: function (slider) {
				if (slider.find('iframe').length >= 1) {
					slider.find('iframe').each(function () {
						var iframe_src	= $(this).attr('src');
						
						$(this).attr('src', ''); 
						$(this).attr('src', iframe_src);
					})
				}
				slider.resize();
			},
			after: function (slider) {
				slider.resize();
			}
		});
		
	});
}

function columnSlider(sliderInstance, columnSize) {
	"use strict";
	
	$(sliderInstance).each(function () {
		
		var _animation		= $(this).attr('data-animation'),
			_controlNav		= $(this).attr('data-controlNav'),
			_directionNav	= $(this).attr('data-directionNav'),
			_animationLoop	= $(this).attr('data-animationLoop'),
			_pauseOnAction	= $(this).attr('data-pauseOnAction'),
			_pauseOnHover	= $(this).attr('data-pauseOnHover'),
			_startAt		= $(this).attr('data-startAt'),
			_slideshow		= $(this).attr('data-slideshow'),
			_slideshowSpeed	= $(this).attr('data-slideshowSpeed'),
			_animationSpeed	= $(this).attr('data-animationSpeed');
		
		$(this).flexslider({
			animation: 'slide',
			controlNav: _controlNav === 'false' ? false : true,
			directionNav: _directionNav === 'true' ? true : false,
			prevText: '<span class="link-icon"><i class="far fa-arrow-left"></i></span>',
			nextText: '<span class="link-icon"><i class="far fa-arrow-right"></i></span>', 
			controlsContainer: $(this).parents('section').find('.slider-pagination'),
			customDirectionNav: $(this).parents('section').find('.slider-controls ul li a'),
			animationLoop: _animationLoop === 'false' ? false : true,
			pauseOnAction: _pauseOnAction === 'false' ? false : true,
			pauseOnHover: _pauseOnHover === 'false' ? false : true,
			startAt: _startAt ? _startAt : 0,
			slideshow: _slideshow === 'false' ? false : true,
			slideshowSpeed: _slideshowSpeed ? _slideshowSpeed : 7500,
			animationSpeed: _animationSpeed ? _animationSpeed : 1000,
			itemWidth: 300,
			itemMargin: 0,
			minItems: columnSize,
			maxItems: columnSize,
			move: columnSize,
			start: function (slider) {
				if (columnSize === 1) {
					if (_startAt == null) _startAt = 0;
					var first_slide		= +_startAt + 1,
						current_slide	= slider.find('li:nth-child(' + first_slide + ')');
					$(current_slide).addClass('flex-active-slide');
				}
			},
			before: function (slider) {				
				if (slider.find('iframe').length >= 1) {
					slider.find('iframe').each(function () {
						var iframe_src	= $(this).attr('src');
						
						$(this).attr('src', ''); 
						$(this).attr('src', iframe_src);
					})
				}
				slider.resize();
			},
			after: function (slider) {
				if (columnSize === 1) {
					var current_slide	= slider.find('li:nth-of-type(' + (slider.currentSlide+1) + ')')[0];
					slider.find('.flex-active-slide').removeClass('flex-active-slide');
					$(current_slide).addClass('flex-active-slide');
				}
				slider.resize();
			}
		});
		
	});
}

function initLocationMap() {
    
	var coordLat = Number($('.location-map-container').data('lat')),
		coordLng = Number($('.location-map-container').data('lng'));
	
		var mapStyles = [
			{
			  "stylers": [
				{ "saturation": -100 }
			  ]
			}
		  ];
	
	var myOptions = {
	  zoom: 14,
	  draggable: true,
	  scrollwheel: false,
	  mapTypeControl: false,
	  panControl: false,
	  streetViewControl: false,
	  fullscreenControl: false,
	  zoomControlOptions: false,
	  center: new google.maps.LatLng(coordLat,coordLng),
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	  
	}
	
	var map = new google.maps.Map(document.getElementsByClassName('location-map-container')[0], myOptions);
	
	/*var templateUrl = themeurl.templateUrl;
	
	var image = templateUrl + '/img/svg/map-marker.svg';
	var marker = {
		url: image,
		size: new google.maps.Size(100, 150),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25, 75),
		scaledSize: new google.maps.Size(50, 75)
	};*/
	
	var bodyStyles		= window.getComputedStyle(document.body),
		colorPrimary	= bodyStyles.getPropertyValue('--color-highlight-400');
	
	var marker = {
		path: "M50,25c0,20-25,31.2-25,50C25,56.2,0,45.1,0,25C0,11.2,11.2,0,25,0S50,11.2,50,25z",
		fillColor: colorPrimary,
		fillOpacity: 1,
		strokeWeight: 0,
		rotation: 0,
		scale: 1,
		anchor: new google.maps.Point(25, 75),
	};
	
	var companyPos = new google.maps.LatLng(coordLat,coordLng);
	
	var companyMarker = new google.maps.Marker({
		position: companyPos,
		animation: google.maps.Animation.DROP,
		map: map,
		icon: marker,
		zIndex: 10
	});
	
	// Set style to map
	map.setOptions({styles: mapStyles});
	
	google.maps.event.addDomListener(window, 'resize', function() {
		var center = new google.maps.LatLng(coordLat, coordLng);
		map.setCenter(center);
	});
}