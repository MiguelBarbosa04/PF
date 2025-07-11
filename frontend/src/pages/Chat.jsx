import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatForm from '../components/ChatForm.jsx';

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <ChatForm />
    </div>
  );
};

export default Chat;