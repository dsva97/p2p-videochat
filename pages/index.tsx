import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

type PeerCall = { answer: (arg0: MediaStream) => void; on: (arg0: string, arg1: (remoteStream: MediaProvider | null) => void) => void; }

function App() {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement>(null);
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [connInstance, setConnInstance] = useState<Peer | null>(null);

  const connect = (remotePeerId: string) => {
    const conn = peerInstance?.connect(remotePeerId)
    conn?.on('open', function() {
      // Receive messages
      conn?.on('data', function(data) {
        console.log('Received', data);
      });
    
      // Send messages
      conn?.send('Hello!');
      });
  }

  useEffect(() => {
    const peer = new (require('peerjs').peerjs.Peer)()

    peer.on('connection', console.log);

    peer.on('open', (id: string) => {
      setPeerId(id)
    });

    peer.on('call', (call: PeerCall) => {
      globalThis?.navigator.mediaDevices.getUserMedia({ audio: true })
      .then((mediaStream: MediaStream | undefined) => {
        if(currentUserVideoRef.current && mediaStream) {

          currentUserVideoRef.current.srcObject = mediaStream;
          currentUserVideoRef.current.play();
          call.answer(mediaStream)
          call.on('stream', function(remoteStream: MediaProvider | null) {
            if(remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
              remoteVideoRef.current.play();
            }
          });
        }
      }).catch(console.error)
    })

    peer.on('chat', console.log)

    setPeerInstance(peer)
  }, [])

  const call = (remotePeerId: string) => {
    globalThis?.navigator.mediaDevices.getUserMedia({ audio: true })
    .then((mediaStream: MediaStream | undefined) => {
      if(currentUserVideoRef.current && mediaStream) {

        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        
        const call = peerInstance?.call(remotePeerId, mediaStream)
        
        if(call) {
          call.on('stream', (remoteStream: MediaProvider| null) => {
            if(remoteVideoRef.current && remoteStream) {
              remoteVideoRef.current.srcObject = remoteStream
              remoteVideoRef.current.play();
            }
          });
        }
      }
    }).catch(console.error);
  }

  return (
    <div className="App">
      <h1>Current user id is {peerId}</h1>
      <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
      <button onClick={() => call(remotePeerIdValue)}>Call</button>
      <button onClick={() => connect(remotePeerIdValue)}>Connect</button>
      <div>
        <video ref={currentUserVideoRef} />
      </div>
      <div>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}

export default App;
