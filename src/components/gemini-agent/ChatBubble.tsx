import './ChatBubble.css';

const ChatBubble = ({ message }: { message: string }) => {
  return (
    <div className="bubble-container other-bubble">
      <div className="bubble">
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;