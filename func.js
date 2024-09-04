const messagecontainer = document.getElementById('sent-container')
const roomcontainer = document.getElementById('room-container')
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
    var socket = io()
    
if(messagecontainer!=null){
    var name = prompt('what is your name')
    appendmsg('you joint')
    const messageform = document.getElementById('sent-button')
var input = document.getElementById('message-input')
    messageform.addEventListener('click',e=>{
        e.preventDefault
      
    var input1 = input.value
    appendmsg(`you:${input1}`)
    console.log(input1)
    socket.emit('inputmsg',roomName, input1)

    input.value = ''
    })
}

socket.on('roomcreated',room=>{
   
    const roomelement=document.createElement('div')
    roomelement.innertext=room
    const roomlink=document.createElement('a')
    roomlink.href=`/${room}`
    roomlink.innertext='join'
    roomcontainer.append(roomelement)
    roomcontainer.append(roomlink)
})


        socket.emit('username',roomName, name)
       
        socket.on('sent-username', data => {
            appendmsg(`${data} connected`)
           
        })
        socket.on('sentmsg', user => {
            console.log('data', `${user.name}:${user.message}`)
            appendmsg(`${user.name}:${user.message}`)
        })
        socket.on('userDisconnect',data=>{
            appendmsg(`${data} disconnect`)
        })
function appendmsg(user){
    var msg=document.createElement('div')
    msg.innerText=user
    var contain=document.getElementById('message-container')
    contain.append(msg)
}
//})