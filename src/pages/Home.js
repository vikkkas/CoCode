/** @format */

import React, {useState} from "react";
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';


const Home = () => {

    const [sessionId,setSessionId] = useState('');
    const [username,setUsername] = useState('');

    // Creating unique session ids for each session with help of UUID library.
    const createNewSession = (e) =>{
        e.preventDefault();
        const id = uuidV4();
        setSessionId(id);
        toast.success('Created a new Session')
    }
return (
    // Logo Section 
        <div className="homePageBox">
            <div className="formBox">
                <img
                    className="homePageLogo"
                    src="/logo.png"
                />                
                
    {/*  Session Id Form Section */}
        <h4 className="mainLabel">Paste Session ID</h4>
        <div className="inputGroup">
            <input
                type="text"
                className="inputBox"
                placeholder="Session ID"
                onChange ={(e) => setSessionId(e.target.value)}
                value={sessionId}
                />

    {/*  Username Id Form Section */}
            <input
                type="text"
                className="inputBox"
                placeholder="USERNAME"
                onChange ={(e) => setUsername(e.target.value)}
                value={username}
                />
            <button className="btn joinBtn" >
                Join
            </button>
            <span className="createInfo">
                If you don't have an invite then create &nbsp;
                <a onClick={createNewSession} href="" className="createNewBtn">
                    new session
                </a>
            </span>
        </div>
    </div>

    {/*  Footer Section */}
            <footer>
                <h4>
                    Built with ❤️ &nbsp;by &nbsp;
                    <a href="https://github.com/vikkkas">Vikas Prasad</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;