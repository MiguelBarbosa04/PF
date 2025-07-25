import React, {useState} from 'react';
import ChatForm from '../components/ChatForm.jsx';

const Chat = () => {
      const [modo, setModo] = useState("exploratório");
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <ChatForm modo={modo} setModo={setModo}/>
    </div>
  );
};

export default Chat;