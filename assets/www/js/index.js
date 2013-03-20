/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var myMedia = null;
var mediaUri = null;
var mediaTimer = null;
var actionByUser = false; // stopped by user or end of song
var mediaState = 0;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    updateMedia: function(songUrl) {
    	if(myMedia != null) {
    		myMedia.release();
    	}
       	document.getElementById('audio_title').innerHTML = app.getTitleByUri(songUrl);
       	mediaUri = songUrl;
    	myMedia = new Media(songUrl,
    				function() { // success callback
    					console.log("Media instance success.");
    				},
    				function() { // error callback
    					console.log("Media error");
    				},
    				function(status) {
    					///console.log("status: "+status);
    					mediaState = status;
    					if(status == Media.MEDIA_NONE) {
    						console.log("MEDIA_NONE");
    					} else if(status == Media.MEDIA_STARTING) {
    						console.log("MEDIA_STARTING");
//    				       	document.getElementById('audio_position').innerHTML = 'loading';
//    				   		document.getElementById('play').innerHTML = "P A U S E";
    						$('#play .ui-btn-text').text("P A U S E");
    					} else if(status == Media.MEDIA_RUNNING) {
    						console.log("MEDIA_RUNNING");
//    					   	document.getElementById('play').innerHTML = "P A U S E";
    						$('#play .ui-btn-text').text("P A U S E");
    					} else if(status == Media.MEDIA_PAUSED) {
    						console.log("MEDIA_PAUSED");
//    			    		document.getElementById('play').innerHTML = "P L A Y";
    						$('#play .ui-btn-text').text("P L A Y");
    					} else if(status == Media.MEDIA_STOPPED) {
    						console.log("MEDIA_STOPPED");
//    				       	document.getElementById('audio_position').innerHTML = '<3';
//    			    		document.getElementById('play').innerHTML = "P L A Y";
    						if(actionByUser == true) {
        						$('#play .ui-btn-text').text("P L A Y");
    						}
    						else {
    							console.log("MEDIA_STOPPED_FALSE_ACTIONBYUSER");
        						if(app.isLastSongByUri(mediaUri)) {
            						$('#play .ui-btn-text').text("P L A Y");
        						}
        						else {
        					    	app.updateMedia(app.getNextSongByUri(mediaUri));
        					    	app.playAudio();
        						}
    						}
    					} else {
    						console.log("MEDIA_UNKNOWN");
    					}
    				});
    },
    updatePlayAudio: function(songUrl) {
    	actionByUser = true;
    	app.updateMedia(songUrl);
    	app.playAudio();
    },
    playAudio: function() {
    	actionByUser = false;
    	if(myMedia == null) { // init without selecting song
    		this.updateMedia(album[0].asset);
    	}
    	if(mediaState != Media.MEDIA_STARTING && mediaState != Media.MEDIA_RUNNING) {
    		myMedia.play();
    		app.getIndexByUri(mediaUri);
    		// Update myMedia position every second
            if (mediaTimer == null) {
                mediaTimer = setInterval(function() {
                    // get myMedia position
                    myMedia.getCurrentPosition(
                        // success callback
                        function(position) {
                            if (mediaState == 2 && position > -1) {
                            	var mdur = myMedia.getDuration();
                            	var tsecs = Math.round(mdur % 60);
                            	var tmins = Math.round((mdur-tsecs) / 60);
                            	var mpos = position;
                            	var psecs = Math.round(mpos % 60);
                            	var pmins = Math.round((mpos-psecs) / 60);
                            	document.getElementById('position_time').innerHTML = pmins + ':' + psecs + '/' + tmins + ':' + tsecs + '.';
                            	$('#audio_position').attr("min", 0);
                            	$('#audio_position').attr("max", myMedia.getDuration());
                            	$('#audio_position').val(position);
                            	$('#audio_position').slider('refresh');
                            }
                        },
                        // error callback
                        function(e) {
                            console.log("Error getting pos=" + e);
//                        	document.getElementById('audio_position').innerHTML = "Error: " + e;
                        }
                    );
                }, 1000);
            }
    	} else {
    		myMedia.pause();
    	}
    },
    stopAudio: function() {
    	actionByUser = true;
    	$('#audio_position').attr("min", 0);
    	$('#audio_position').attr("max", myMedia.getDuration());
    	$('#audio_position').val(0);
    	$('#audio_position').slider('refresh');
    	myMedia.stop();
    	clearInterval(mediaTimer);
    	mediaTimer = null;
    },
    getTitleByUri: function(uri) {
    	var retval = '<3';
    	for (var i=0;i<album.length;i++) {
    		if(album[i].asset == uri) {
    			retval = album[i].title;
    			console.log(i+"|getTitleByUri|"+album[i].title);
    			break;
    		}
    	}
    	return retval;
    },
    getIndexByUri: function(uri) {
    	var retval = -1;
    	for (var i=0;i<album.length;i++) {
    		if(album[i].asset == uri) {
    			retval = i;
    			console.log(i+"|getIndexByUri|"+album[i].title);
    			break;
    		}
    	}
    	return retval;
    },
    isLastSongByUri: function(uri) {
    	var retval = false; // init/default
    	if(album[album.length-1].asset == uri) {
    		retval = true;
    	}
    	return retval;
    },
    getNextSongByUri: function(uri) {
    	var retval = uri;
    	for (var i=0;i<album.length-1;i++) {
    		if(album[i].asset == uri) {
    			retval = album[i+1].asset;
    			console.log(i+"|getNextSongByUri|"+album[i].title);
    			break;
    		}
    	}
    	return retval;
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
