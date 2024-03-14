import React, { useEffect,useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
// import ACTIONS from '../Actions';

const Editor = ({socketRef, sessionId, onCodeChange}) => {
    const editorRef = useRef(null);
    useEffect(() => {
            async function init() {
                editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),
            {
                mode: { name: 'javascript', json:'true' },
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });
            editorRef.current.on('change',(instace,changes)=>{
                console.log(changes);
                const {origin} = changes;
                const code = instace.getValue();
                onCodeChange(code);
                if (origin !== 'setValue'){
                    // Emitting code to the server.js (server)
                    socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                        sessionId,
                        code,
                    });
                }
                console.log(code);
            });


    }
    init();
}, []);

useEffect(()=>{
    if(socketRef.current){socketRef.current.on(ACTIONS.CODE_CHANGE,({code}) =>{
        if(code !== null){
            editorRef.current.setValue(code);
        }
    });}
},[socketRef.current])

  return <textarea id="realtimeEditor"> </textarea>;
};

export default Editor   