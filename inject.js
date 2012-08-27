// Declare globals.

var viewType;

// Safari extension handlers.

function messageAnswer( theMessageEvent ) {
	switch ( theMessageEvent.name ) {
		case 'style':
			injectStyle( theMessageEvent.message );
			break;

		case 'view':
			viewType = theMessageEvent.message;
			break;

		case 'collapseread':
			if ( true === theMessageEvent.message )
				collapseSubscriptions();
			break;
	}
}
safari.self.addEventListener( 'message', messageAnswer, false );

// Load user settings.

safari.self.tab.dispatchMessage( 'style' );
safari.self.tab.dispatchMessage( 'view' );
safari.self.tab.dispatchMessage( 'collapseread' );

// Functions to handle stylesheets.

function injectStyle( style ) {
	switch ( style ) {
		case 'helvetireader.2.min':
		case 'lucidica.min':
		case 'mac-os-x-snow-leopard.min':
			var cssNode = document.createElement( 'link' );
			cssNode.type = 'text/css';
			cssNode.rel = 'stylesheet';
			cssNode.href = safari.extension.baseURI + 'css/' + style + '.css';
			cssNode.media = 'screen';
			cssNode.title = 'dynamicLoadedSheet';
			document.getElementsByTagName( 'head' )[0].appendChild( cssNode );
			break;

		case 'helvetireader.2.min-followers':
			injectStyle( 'helvetireader.2.min' );

			var cssNode = document.createElement( 'style' );
			cssNode.type = 'text/css';
			cssNode.innerText = 'ul#friends-tree.scroll-tree { display: block !important; } ul#friends-tree.scroll-tree #friends-tree-item-1-main { display: none !important; }';
			document.getElementsByTagName( 'head' )[0].appendChild( cssNode );
			break;
	}
}

function collapseSubscriptions() {
	var cssNode = document.createElement( 'style' );
	cssNode.type = 'text/css';
	cssNode.innerText = '#sub-tree-container #sub-tree ul li.unread{ height: 22px; opacity: 1; -webkit-transition-property: height, opacity; -webkit-transition-duration: 1s, 0.5s; -webkit-transition-timing-function: ease, linear; -webkit-transition-delay: 0s, 0.5s; } #sub-tree-container #sub-tree ul li{ height: 0; opacity: 0; -webkit-transition-property: height, opacity; -webkit-transition-duration: 0.5s, 1s; -webkit-transition-timing-function: ease, linear; -webkit-transition-delay: 0.5s, 0s; }';
	document.getElementsByTagName( 'head' )[0].appendChild( cssNode );
}

// Functions to handle FancyBox.

function viewOriginal( altKey ) {
	if ( 'instapaper' == viewType ) {
		var result = ( true === altKey ) ? true : false;
	} else {
		var result = ( true === altKey ) ? false : true;
	}

	return result;
}

function isSSL() {
	return ( 'https:' == document.location.protocol ) ? true : false;
}

function schema() {
	return ( isSSL() ) ? 'https://' : 'http://';
}

function FancyBox( altKey, href ) {
	$.fancybox({
		'width'				: viewOriginal( altKey ) ? '95%' : 768,
		'height'			: '95%',
		'overlayOpacity'	: 0.75,
		'overlayColor'		: '#000',
		'autoScale'			: false,
		'transitionIn'		: 'fade',
		'transitionOut'		: 'fade',
		'speedIn'			: 300,
		'speedOut'			: 125,
		'type'				: 'iframe',
		'href'				: viewOriginal( altKey ) ? href : schema() + 'www.instapaper.com/text?u=' + encodeURIComponent( href )
	});
}

// jQuery hooks to call FancyBox.

$( document ).ready( function() {
	$( 'div#current-entry a.entry-title-link' ).live( 'click', function( event ) {
		if ( 'none' == viewType || true === event.metaKey )
			return;

		event.preventDefault();

		FancyBox( event.altKey, event.toElement.href );
	});

	$( document ).keypress( function( event ) {
		if ( ( 98 == event.which || 8747 == event.which ) && 'none' != viewType ) {
			if ( !$.fancybox.close() )
				FancyBox( event.altKey, $( 'div#current-entry a.entry-title-link' ).attr( 'href' ) );
		}
	});
});