
function playAudio() { 
	
		if(!music.src){
			return;
		}
	
		if(music.paused) {
			music.play();
			pButton.className = "";
			pButton.className = "pause";
			pButton.style.opacity = 1;
		} else {
			music.pause();
			pButton.className = "";
			pButton.className = "play";
		}
	}

$(document).ready( function() {

	function song(name, artist, album, year, path, album_cover){
		this.name = name,
		this.artist = artist,
		this.album = album,
		this.year = year,
		this.path = path,
		this.cover = album_cover
	}
	
	var songs = [];
	songs.push(new song('Say You Will', 'Kanye West', "808's & Heartbreak", '2008', 'music\01 Say You Will.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Welcome to Heartreak (ft. Kid Cudi)', 'Kanye West', "808's & Heartbreak", '2008', 'music\\02 Welcome to Heartbreak (feat. Kid Cudi).m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Heartless', 'Kanye West', "808's & Heartbreak", '2008', 'music\03 Heartless.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Amazing (ft. Young Jeezy)', 'Kanye West', "808's & Heartbreak", '2008', 'music\\04 Amazing (feat. Young Jeezy).m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Love Lockdown', 'Kanye West', "808's & Heartbreak", '2008', 'music\\05 Love Lockdown.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Paranoid (ft. Mr. Hudson)', 'Kanye West', "808's & Heartbreak", '2008', 'music\\06 Paranoid (feat. Mr. Hudson).m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('RoboCop', 'Kanye West', "808's & Heartbreak", '2008', 'music\\07 RoboCop.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Street Lights', 'Kanye West', "808's & Heartbreak", '2008', 'music\\08 Street Lights.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Bad News', 'Kanye West', "808's & Heartbreak", '2008', 'music\\09 Bad News.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('See You in My Nightmares', 'Kanye West', "808's & Heartbreak", '2008', 'music\\10 See You In My Nightmares (feat. Lil Wayne).m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Coldest Winter', 'Kanye West', "808's & Heartbreak", '2008', 'music\\11 Coldest Winter.m4a', 'icons/808_album_cover.jpg'));
	songs.push(new song('Pinocchio Story', 'Kanye West', "808's & Heartbreak", '2008', 'music\\12 Pinocchio Story (Freestyle Live from Singapore).m4a', 'icons/808_album_cover.jpg'));
	
	var musicArray = {};
	musicArray.num_songs = songs.length;
	musicArray.songs = songs;
	
	for(var i=0; i < musicArray.num_songs; i++){
		$('#songs_list').append('<p class="song_item" data-index="' + i + '"><span>' +  (i+1) + ' -</span> ' + musicArray.songs[i].name + '</p>');
	}
	
	var x = document.getElementsByClassName("song");
	
	var num_players=0;
	var players = [];
	
	var num_squares, squares_array, square_transition;
	
	var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
	
	
	
	function fadeSquares() {
		var s=0, delay=0; 
		for(s=0; s < squares_array.length; s++){
			squares_array[s].style.transitionDelay = delay+"s";
			squares_array[s].style.opacity = 0;
			delay+=square_transition;
		}
	}
	
	var album_cover_size = 500, square_size = 100, x_pos=0, y_pos=0;
	
	$('#album_cover').height(500);
	$('#album_cover').width(500);
	
	num_squares = $('#album_cover').height()/square_size;
	
	$( "<style>.squares {height: " + square_size + "px; width: " + square_size + "px;}</style>" ).appendTo( "head" );

	var s=0;
	for(s=0; s<num_squares*num_squares; s++){
		if(x_pos === album_cover_size){
			x_pos = 0;
			y_pos += square_size;
		}
		$('#album_cover').append('<div class="squares" style="left:' + x_pos + 'px; top:' + y_pos + 'px;"></div>');
		x_pos += square_size;
	}
	
	squares_array = document.getElementsByClassName("squares");

	var music = document.getElementById('music');

	$('.player').each( function(){
		
		$(this).append('<input class="aud_file" id="audio_file_ ' + num_players + '" type="file" accept="audio/*" />')
				 .after('<audio id="audio_player_' + num_players +'" />');
					
		num_players++;
		
	});
	
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
	
	function calculateTranstion() {
		duration = music.duration;
		square_transition = duration / (num_squares*num_squares);
		square_transition = Math.ceil(square_transition * 10) / 10;
		$( "<style>.squares {transition: " + square_transition + "s;}</style>" ).appendTo( "head" );
		fadeSquares();
		playAudio();
	}
	
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
		value: 60,
		orientation: "horizontal",
		range: "min",
		animate: true,
		change : function( event, ui ) {
			var new_vol = (ui.value / 100);
			music.volume = new_vol;
		}
	});
	
	$('#songs_list').find('.song_item').click( function() {     
		var index =  $(this).attr( "data-index");   
		var path = (musicArray.songs[index].path);
		music.src = path;
		$('#album_cover').css('background-image', 'url(' + musicArray.songs[index].cover + ')');
		$('#songs_list').find('.playing').removeClass('playing');
		$(this).addClass('playing');
	});
	
}); 
			