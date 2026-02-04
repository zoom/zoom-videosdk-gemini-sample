import React from 'react';
import './ChatBubble.css'; // Link the CSS file

const ChatBubble = ({ message }) => {
  return (
    <div className="bubble-container other-bubble">
      <div className="bubble">
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;