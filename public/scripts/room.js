const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
let myVideoStream
const myVideo = document.createElement('video')
let connectedUsers = []
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    
      console.log(userId)
      const call = myPeer.call(userId, stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })
      peers[userId] = call


}

function addVideoStream(video, stream) {
  let videoElements = document.querySelectorAll('video')
  if(videoElements.length === 0 ){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }else if(videoElements.length === 1){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    let videoGrid2 = document.querySelector('#video-grid-2')
    videoGrid2.append(video)
  }
}




const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}




const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('#mute-btn').classList.remove('btn-outline-success');
  document.querySelector('#mute-btn').classList.add('btn-success');
  document.querySelector('#mute-state').innerHTML = 'Mute';
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('#mute-btn').classList.add('btn-outline-success');
  document.querySelector('#mute-btn').classList.remove('btn-success');
  document.querySelector('#mute-state').innerHTML = 'Unmute';
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('#play-btn').classList.remove('btn-outline-warning');
  document.querySelector('#play-btn').classList.add('btn-outline-warning');

  document.querySelector('#mute-state').innerHTML = 'Show';
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('#play-btn').classList.add('btn-outline-warning');
  document.querySelector('#play-btn').classList.remove('btn-warning');

  document.querySelector('#mute-state').innerHTML = 'Hide';
}
