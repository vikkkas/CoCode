/** @format */

import React, {useState} from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";

const EditorPage = () => {
    const [clients,setClients] = useState(
        [
            {socketId: 1, username: 'Rakesh k'},
            {socketId: 2, username: 'John doe'},
            {socketId: 3, username: 'John doe'}

        ]
    );
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
                <button className="btn copyBtn"> Copy Session ID</button>
                <button className="btn leaveBtn ">Leave Session</button>
            </div>
            <div className="editorWrap">
             <Editor/>
            </div>
        </div>
    );
};



export default EditorPage;
