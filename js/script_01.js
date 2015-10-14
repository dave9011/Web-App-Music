
;( function(app, undefined) {

	"use strict";
	
	app.Albums = {
		_808 : 0,      //app.Albums.properties[app.Albums._808]
		_YEEZUS : 1,
		properties: {
			0 : { name : "808's & Heartbreak",
					artist : 'Kanye West (G.O.A.T.)',
					year : '2008',
					cover : 'ic/808_album_cover.jpg',
					songs : {},
					num_songs : 0,
			},
			1 : { name : "Yeezus",
					artist : 'Kanye West',
					year : '2013',
					cover : 'ic/cover_yeezus.jpg',
					songs : {},
					num_songs : 0
			}
		}
	};
	
	app.play_state = {
		_stopped : 0,
		_paused : 1,
		_playing : 2,
		state : 0   //initially stopped
	}
	
	app.options = {
		loop : false
	}
	
	app.source_set = false;
	
	var $albums = app.Albums;
	
	addAllSongs($albums);

	var num_albums = Object.keys($albums.properties).length;
	var $song_containers = $('.songs_list');
	
	for (var a=0; a < num_albums; a++){
	
		$('#albums_list').append('<div class="album_item noSelect" data-index="' + a + '">'
                                    + '<p><span>' +  (a+1) + ' -</span> ' + $albums.properties[a].name + '</p>'
                                    + '<img src="ic/info.svg">'
                                + '</div>');
        
		$( $song_containers[a] ).attr('data-index', a)
		var num_songs = $albums.properties[a].num_songs;
		for(var s=1; s <= num_songs; s++){
			var name = ($albums.properties[a].songs['_'+s].name);
			$($song_containers[a]).append('<div class="song_item noSelect clearfix" data-index="' + s + '">' + 
														'<p><span>' + s + ' -</span> ' + name + '</p>' 
														//+ '<img src="ic/play_light.svg">'
													+ '</div>');
		}
		
		//seet index of first song
		var first_song_index = app.Albums.properties[a].songs[Object.keys(app.Albums.properties[a].songs)[0]].track_no;
		app.Albums.properties[a].first_song_index = first_song_index;
		
		//set index of last song
		var last_song_index = app.Albums.properties[a].songs[Object.keys(app.Albums.properties[a].songs)[app.Albums.properties[a].num_songs-1]].track_no;
		app.Albums.properties[a].last_song_index = last_song_index;
		
	}
	
	app.currentAlbum = app.Albums._808;
	
	$('#artist_name').html(app.Albums.properties[app.currentAlbum].artist);
	
	$(".album_item[data-index='"+ app.currentAlbum +"']").addClass("album_playing");
	
	$('#album_info').append(
			'<p><span>Name</span></p>' +
			'<p><span>Year</span></p>' +
			'<p><span>Company</span></p>'
	);
	
	//add mute feature on mute button click
	$('#sound-button').click(function(){ 
		var curr_volume = music.volume;
		if(typeof app.cached_volume == 'undefined'  ){
			app.cached_volume = curr_volume;
		}
		if(curr_volume == 0){
			music.volume = app.cached_volume ;
			$( "#master" ).slider({ value : app.cached_volume*100 });
			
		} else {
			music.volume = 0; 
			$( "#master" ).slider({ value : 0 });
		}
		app.cached_volume = curr_volume;
		
	});
	
	//Handle song item click
	$('.songs_list').find('.song_item').click( function() {  

		//return if the user clicked on the song already playing
		if($(this).hasClass("playing")){
			return;
		}
		
		app.current_song = parseInt( $(this).attr('data-index') );
		var song_index =  $(this).attr( "data-index");  
		var album_index = $(this).parent().attr('data-index');
		var path = $albums.properties[album_index].songs['_'+song_index].path;
		music.src = path;
		app.source_set = true;
		$('#album_cover').css('background-image', 'url(' + $albums.properties[album_index].cover + ')');
		$('.songs_list').find('.playing').removeClass('playing');
		$(this).addClass('playing');
		console.log('1');
		playAudio();
		
	});
	
	//Handle album item click
	$('.album_item').click( function(){
		
		if($(this).hasClass("album_playing")){
			return;
		}
		
		var prev_selected = $('.album_playing');
		
		var old_index = $(prev_selected).attr('data-index');
		var new_index = $(this).attr('data-index');
	
		$( $('.songs_list')[old_index] ).slideUp( function() {
			$( $('.songs_list')[new_index] ).slideDown(); 
		}); 
		
		app.currentAlbum = $(this).attr('data-index');
	
		$('#artist_name').html(app.Albums.properties[app.currentAlbum].artist);
		
		$(prev_selected).removeClass('album_playing');
		$(this).addClass('album_playing');
		
	});
	
	app.musicControls = {
		player : $('#music')[0],
		play_button : $('#play-button')[0],
		timeline : $('#timeline')[0],
		playhead : $('#playhead')[0],
		playhead_timer : $('#timer')[0]
	};
	
	var $player = app.musicControls.player;
	
	$player.volume = 0.3;
	
	app.playButton = $('#play-button');
	$(app.playButton).click( function() {
		playAudio();
	});
	
	function playAudio() { 
	
		if(!app.source_set){
			return;
		}
		if(music.paused) {   
			music.play();
			app.musicControls.play_button.setAttribute("class", "");
			app.musicControls.play_button.setAttribute("class", "pause active_button");
			if(app.play_state.state === app.play_state._stopped){
				turnPause();
			} else if(app.play_state.state !== app.play_state._playing){
				turnPause();
			}
			app.play_state.state = app.play_state._playing;
			
		} else {				   
			music.pause();
			app.musicControls.play_button.setAttribute("class", "active_button");
			app.musicControls.play_button.setAttribute("class", "play active_button");
			if(app.play_state.state !== app.play_state._paused){
				turnPlay();
			}
			app.play_state.state = app.play_state._paused;
		}
	}
	
	//functionality to play next song once previous one ends
	app.musicControls.player.addEventListener("ended", function() {
		
		var curr_album = app.currentAlbum;
		var curr_song_index = app.current_song;
		var next_song_index = curr_song_index + 1;
		
		if( next_song_index <= app.Albums.properties[curr_album].num_songs) {
			app.current_song = next_song_index;
		} else if(app.options.loop) {
			app.current_song = app.Albums.properties[curr_album].first_song_index;
		} else {
			return;
		}
		
		var path = app.Albums.properties[app.currentAlbum].songs['_'+app.current_song].path;
		app.musicControls.player.src = path;
		
		var $album = $(".songs_list[data-index='" + curr_album + "']");
		
		$( $album ).find('.playing').removeClass('playing');

		$( $album ).find(".song_item[data-index='" + app.current_song + "']").addClass('playing');
		
		playAudio();
		
	}, false);
	
	function addSong(album_index, trackNum, trackName, trackPath ){
		var song = {
			name : trackName,
			path : trackPath,
			track_no : trackNum 
		}
		app.Albums.properties[album_index].songs['_' + trackNum] = song;
		app.Albums.properties[album_index].num_songs++;		
	}
	
	function addAllSongs(albums) {
	
		addSong(albums._808, 1, 'Say You Will', 'music\\01 Say You Will.m4a');
		addSong(albums._808, 2, 'Welcome to Heartreak (ft. Kid Cudi)', 'music\\02 Welcome to Heartbreak (feat. Kid Cudi).m4a');
		addSong(albums._808, 3, 'Heartless', 'music\\03 Heartless.m4a');
		addSong(albums._808, 4, 'Amazing (ft. Young Jeezy)', 'music\\04 Amazing (feat. Young Jeezy).m4a');
		addSong(albums._808, 5, 'Love Lockdown', 'music\\05 Love Lockdown.m4a');
		addSong(albums._808, 6, 'Paranoid (ft. Mr. Hudson)', 'music\\06 Paranoid (feat. Mr. Hudson).m4a');
		addSong(albums._808, 7, 'RoboCop', 'music\\07 RoboCop.m4a');
		addSong(albums._808, 8, 'Street Lights', 'music\\08 Street Lights.m4a');
		addSong(albums._808, 9, 'Bad News', 'music\\09 Bad News.m4a');
		addSong(albums._808, 10, 'See You in My Nightmares', 'music\\10 See You In My Nightmares (feat. Lil Wayne).m4a');
		addSong(albums._808, 11, 'Coldest Winter', 'music\\11 Coldest Winter.m4a');
		addSong(albums._808, 12, 'Pinocchio Story', 'music\\12 Pinocchio Story (Freestyle Live from Singapore).m4a');
		
		addSong(albums._YEEZUS, 1, 'On Sight', 'music\\Yeezus\\01 Kanye West - On Sight.mp3');
		addSong(albums._YEEZUS, 2, 'Black Skinhead', 'music\\Yeezus\\02 Kanye West - Black Skinhead.mp3');
		addSong(albums._YEEZUS, 3, 'I Am A God', 'music\\Yeezus\\03 Kanye West - I Am A God.mp3');
		addSong(albums._YEEZUS, 4, 'New Slaves', 'music\\Yeezus\\04 Kanye West - New Slaves.mp3');
		addSong(albums._YEEZUS, 5, 'Hold My Liquor', 'music\\Yeezus\\05 Kanye West - Hold My Liquor.mp3');
		addSong(albums._YEEZUS, 6, "I'm In It", "music\\Yeezus\\06 Kanye West - I'm In It.mp3");
		addSong(albums._YEEZUS, 7, 'Blood On The Leaves', 'music\\Yeezus\\07 Kanye West - Blood On The Leaves.mp3');
		addSong(albums._YEEZUS, 8, 'Guilt Trip', 'music\\Yeezus\\08 Kanye West - Guilt Trip.mp3');
		addSong(albums._YEEZUS, 9, 'Send It Up', 'music\\Yeezus\\09 Kanye West - Send It Up.mp3');
		addSong(albums._YEEZUS, 10, 'Bound 2', 'music\\Yeezus\\10 Kanye West - Bound 2.mp3');
	}
	
	
})( window.app = window.app || {} );


$(document).ready( function() {

	function calculateTranstion() {
		duration = music.duration;
		square_transition = duration / (num_squares*num_squares);
		square_transition = Math.ceil(square_transition * 10) / 10;
		$( "<style>.time_square_wrapper {transition: " + square_transition + "s;}</style>" ).appendTo( "head" );
		fadeSquares();
	}

	function playAudio() { 
		if(!music.src){
			return;
		}
		if(music.paused) {
			music.play();
			pButton.className = "";
			pButton.className = "pause active_button";
		} else {
			music.pause();
			pButton.className = "active_button";
			pButton.className = "play active_button";
		}
	}
	
	var timeSquares = [];
	
	function timeSquare(square, start_time, end_time){
		this.square = square,
		this.start_time = start_time,
		this.end_time = end_time
	}
	
	var delay_start;
	var delay_end;
	
	function fadeSquares() {
	
		var s=0, delay=0; 
		
		for(s=0; s < squares_array.length; s++){
			squares_array[s].style.transitionDelay = delay+"s";
			squares_array[s].style.backgroundColor = 'transparent';
			var new_delay = delay + square_transition;
			var $square = $(squares_array[s]);
			var child_sq = $square.children();
			
			child_sq.attr("data-startTime", delay);
			
			var start_minutes, start_seconds;
			start_minutes = Math.floor(delay / 60);
			start_seconds = Math.floor( delay % 60 );
			
			if(start_seconds < 10) {
				start_seconds = '0' + start_seconds;
			}
			
			var end_minutes, end_seconds;
			end_minutes = Math.floor(new_delay / 60);
			end_seconds = Math.floor( new_delay % 60 );
		
			if(end_seconds < 10) {
				end_seconds = '0' + end_seconds;
			}
			
			//on a time square click, set the current audio time to the start time of that square
			child_sq.click( function() {
				music.currentTime = $(this).attr("data-startTime");
			});
			
			child_sq.html('<span>' + (s+1) + '</span><br>' +start_minutes + ':' + start_seconds + ' - ' + end_minutes + ':' + end_seconds);
			timeSquares.push( new timeSquare(child_sq, delay, new_delay) );
			delay = new_delay;
		}
		
	}
	
	var num_squares, squares_array, square_transition;
	
	var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
	
	var album_cover_size = $('#album_cover').width(), 
			squares_per_row = 5,
			square_size = (album_cover_size/ squares_per_row), 
			x_pos=0, 
			y_pos=0;
	
	$('#album_cover').height(album_cover_size);
	$('#album_cover').width(album_cover_size);
	
	num_squares = $('#album_cover').height()/square_size;
	
	$( "<style>.time_square_wrapper {height: " + square_size + "px; width: " + square_size + "px;}</style>" ).appendTo( "head" );

	//Create squares and place them inside album cover container
	var s=0;
	for(s=0; s<num_squares*num_squares; s++){
		if(x_pos === album_cover_size){
			x_pos = 0;
			y_pos += square_size;
		}
		$('#album_cover').append('<div class="time_square_wrapper"><div class="time_square" style="line-height:' + square_size/2 + 'px;"></div></div>'); // style="left:' + x_pos + 'px; top:' + y_pos + 'px;"></div>');
		x_pos += square_size;
	}
	
	squares_array = document.getElementsByClassName("time_square_wrapper");

	var music = document.getElementById('music');
	
	var duration;
	var music_2 = document.getElementById('playhead');

	music.addEventListener("timeupdate", timeUpdate, false);
	
	function timeUpdate() {
	
		var time = music.currentTime;
	
		var playPercent = timelineWidth * (time / duration);
		if (time == duration) {
			pButton.className = "";
			pButton.className = "play";
			music.currentTime = 0;
		}
		playhead.style.marginLeft = playPercent + "px";
		
		var minutes, seconds;
		minutes = Math.floor(time / 60);
		seconds = Math.floor( time % 60 );
		
		if(seconds < 10) {
			seconds = '0' + seconds;
		}
		
		$('#timer').html(minutes + ":" + seconds);
	}
	
	music.addEventListener("loadedmetadata", function() {
		calculateTranstion();
	}, false);
	
	music.addEventListener("volumechange", function() {
		setVolumeSVG();
	}, false);
	
	timeline.addEventListener("click", function(event) {
		movePlayHead(event);
		music.currentTime = duration * clickPercent(event);
	}, false);
	
	function clickPercent(e) {
		return (e.pageX - timeline.offsetLeft) / timelineWidth;
	}
	
	function movePlayHead(e) {
		var newMargLeft = e.pageX - timeline.offsetLeft;
		
		if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
			playhead.style.marginLeft = newMargLeft + "px";
		}
		 if (newMargLeft < 0) {
			playhead.style.marginLeft = "0px";
		}
		if (newMargLeft > timelineWidth) {
			playhead.style.marginLeft = timelineWidth + "px";
		}
		
	}
	
	$( "#master" ).slider({
		value: (app.musicControls.player.volume*100),
		orientation: "horizontal",
		range: "min",
		animate: true,
		change : function( event, ui ) {
			music.volume = (ui.value / 100);
		}
	});
	
	
}); 
			