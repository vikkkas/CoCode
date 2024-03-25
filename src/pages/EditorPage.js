/** @format */

import React, {useEffect, useState, useRef} from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import {initSocket} from "../socket";
import axios from 'axios';
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { sessionId } = useParams();
    const reactNavigator = useNavigate();
    const [clients,setClients] = useState([]);


    useEffect(()=>{
        const init = async () =>{
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }
            socketRef.current.emit(ACTIONS.JOIN,{
                sessionId,
                username: location.state?.username,
            });
            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the session.`);
                        console.log(`${username} joined`); 
                    }
                    setClients(clients);
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
                code: codeRef.current,
                socketId,
            });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the session.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            // Cleaning the functions to prevent memory leak.
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    },[]);
    
    async function copySessionId() {
        try {
            await navigator.clipboard.writeText(sessionId);
            toast.success('Session ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveSession() {
        reactNavigator('/');
    }
function downloadEditorText() {
    // Get the text from the codeRef
    var text = codeRef.current;

    // Create a new Blob object using the text
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});

    // Create a link element
    var link = document.createElement("a");

    // Set the download attribute of the link
    link.download = "CoCode-"+Date.now()+".txt";

    // Create a URL for the Blob and set it as the href of the link
    link.href = URL.createObjectURL(blob);

    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click on the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
}

function saveCodeToDatabase() {
    // Get the text from the codeRef
    var text = codeRef.current;

    // Get the session id
    // You need to replace this with the actual way of getting the session id in your application

    // Make a POST request to the backend service
    console.log(sessionId);
    axios.post('http://localhost:5000/save-code', {
        sessionId: sessionId,
        code: text
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.error(error);
    });
}
    if (!location.state) {
        return <Navigate to="/" />;
    }
     
    return (
        <div className="mainWrap">
            {/* Left Pannel */}
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/logo.png"
                            alt="logo"
                        />
                    </div>
                    
                    <h3>Connected</h3>

                    <div className="clientLists">
                        {
                            clients.map((client)=> (<Client key={client.socketId} username={client.username}/>))
                        }
                    </div>

                </div>
                <button className ="btn downloadBtn" onClick={downloadEditorText}>Download Code</button>
                <button className="btn saveBtn" onClick={saveCodeToDatabase}>Save Code</button>
                <button className="btn copyBtn" onClick={copySessionId}> Copy Session ID</button>
                <button className="btn leaveBtn" onClick={leaveSession}>Leave Session</button>
            </div>
            <div className="editorWrap">
             <Editor socketRef={socketRef} sessionId={sessionId} onCodeChange = {(code)=>{codeRef.current=code;}}/>
            </div>
            
        </div>
    );
};



export default EditorPage;
