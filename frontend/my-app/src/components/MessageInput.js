import SocketContext from '../context/SocketContext';
import {useContext} from "react";
const MessageInput = () => {
    const socket = useContext(SocketContext);

    return (
        <div className="p-2">
            <input type="text" placeholder="Enter Message Here" className="input input-bordered w-full" />
        </div>
    );
};

export default MessageInput;