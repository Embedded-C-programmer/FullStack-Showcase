// import React, { useState } from 'react';
// import { format } from 'date-fns';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiDownload, FiFile, FiImage, FiVideo, FiMusic, FiEdit2, FiTrash2, FiMoreVertical, FiCheck, FiX } from 'react-icons/fi';
// import uploadService from '../services/upload';
// import { useChat } from '../context/ChatContext';

// const MessageItem = ({ message, isOwn }) => {
//     const { editMessage, deleteMessage } = useChat();
//     const [showMenu, setShowMenu] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editContent, setEditContent] = useState(message.content);
//     const time = format(new Date(message.createdAt), 'HH:mm');
//     const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

//     const handleEdit = () => {
//         if (editContent.trim() && editContent !== message.content) {
//             editMessage(message._id, editContent.trim());
//         }
//         setIsEditing(false);
//         setShowMenu(false);
//     };

//     const handleDelete = () => {
//         if (window.confirm('Delete this message?')) {
//             deleteMessage(message._id, message.conversationId);
//         }
//         setShowMenu(false);
//     };

//     const renderFileContent = () => {
//         if (!message.fileUrl) return null;

//         const fileUrl = `${API_URL}${message.fileUrl}`;

//         switch (message.type) {
//             case 'image':
//                 return (
//                     <div className="message-image">
//                         <img
//                             src={message.thumbnail ? `${API_URL}${message.thumbnail}` : fileUrl}
//                             alt={message.fileName}
//                             onClick={() => window.open(fileUrl, '_blank')}
//                         />
//                         <a
//                             href={fileUrl}
//                             download={message.fileName}
//                             className="download-btn"
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <FiDownload size={16} />
//                         </a>
//                     </div>
//                 );

//             case 'video':
//                 return (
//                     <div className="message-video">
//                         <video controls>
//                             <source src={fileUrl} type={message.mimeType} />
//                             Your browser does not support the video tag.
//                         </video>
//                         <div className="file-info">
//                             <FiVideo size={16} />
//                             <span>{message.fileName}</span>
//                             <span className="file-size">
//                                 {uploadService.formatFileSize(message.fileSize)}
//                             </span>
//                         </div>
//                     </div>
//                 );

//             case 'audio':
//                 return (
//                     <div className="message-audio">
//                         <FiMusic size={20} />
//                         <audio controls>
//                             <source src={fileUrl} type={message.mimeType} />
//                             Your browser does not support the audio tag.
//                         </audio>
//                     </div>
//                 );

//             case 'file':
//             default:
//                 return (
//                     <a
//                         href={fileUrl}
//                         download={message.fileName}
//                         className="message-file"
//                     >
//                         <div className="file-icon">
//                             <FiFile size={24} />
//                         </div>
//                         <div className="file-details">
//                             <span className="file-name">{message.fileName}</span>
//                             <span className="file-size">
//                                 {uploadService.formatFileSize(message.fileSize)}
//                             </span>
//                         </div>
//                         <FiDownload size={20} />
//                     </a>
//                 );
//         }
//     };

//     return (
//         <motion.div
//             className={`message ${isOwn ? 'own' : ''}`}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.2 }}
//             onMouseEnter={() => isOwn && setShowMenu(true)}
//             onMouseLeave={() => !isEditing && setShowMenu(false)}
//         >
//             {!isOwn && (
//                 <img
//                     src={message.sender.avatar}
//                     alt={message.sender.username}
//                     className="message-avatar"
//                 />
//             )}

//             <div className="message-content">
//                 {!isOwn && (
//                     <div className="message-sender">{message.sender.username}</div>
//                 )}

//                 {message.fileUrl && renderFileContent()}

//                 {message.type === 'text' && (
//                     <div className={`message-bubble ${message.deleted ? 'deleted' : ''}`}>
//                         {isEditing ? (
//                             <div className="message-edit-box">
//                                 <input
//                                     type="text"
//                                     value={editContent}
//                                     onChange={(e) => setEditContent(e.target.value)}
//                                     onKeyDown={(e) => {
//                                         if (e.key === 'Enter') handleEdit();
//                                         if (e.key === 'Escape') {
//                                             setIsEditing(false);
//                                             setEditContent(message.content);
//                                         }
//                                     }}
//                                     autoFocus
//                                 />
//                                 <div className="edit-actions">
//                                     <button onClick={handleEdit} className="edit-save">
//                                         <FiCheck size={16} />
//                                     </button>
//                                     <button onClick={() => {
//                                         setIsEditing(false);
//                                         setEditContent(message.content);
//                                     }} className="edit-cancel">
//                                         <FiX size={16} />
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {message.content}
//                                 {message.edited && !message.deleted && (
//                                     <span className="message-edited"> (edited)</span>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 )}

//                 <div className="message-footer">
//                     <span className="message-time">{time}</span>
//                     {isOwn && (
//                         <div className="message-status">
//                             {message.readBy.length > 1 ? (
//                                 <svg className="check-icon read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <polyline points="20 6 9 17 4 12" />
//                                     <polyline points="20 6 9 17 4 12" transform="translate(4, 0)" />
//                                 </svg>
//                             ) : (
//                                 <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <polyline points="20 6 9 17 4 12" />
//                                 </svg>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {isOwn && showMenu && !message.deleted && message.type === 'text' && (
//                     <div className="message-menu">
//                         <button onClick={() => setIsEditing(true)} title="Edit">
//                             <FiEdit2 size={14} />
//                         </button>
//                         <button onClick={handleDelete} title="Delete">
//                             <FiTrash2 size={14} />
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </motion.div>
//     );
// };

// export default MessageItem;

import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiFile, FiImage, FiVideo, FiMusic, FiEdit2, FiTrash2, FiMoreVertical, FiCheck, FiX } from 'react-icons/fi';
import uploadService from '../services/upload';
import { useChat } from '../context/ChatContext';

const MessageItem = ({ message, isOwn }) => {
  const { editMessage, deleteMessage } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const time = format(new Date(message.createdAt), 'HH:mm');
  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message._id, editContent.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(message._id, message.conversationId);
    }
    setShowMenu(false);
  };

  const renderFileContent = () => {
    if (!message.fileUrl) return null;

    const fileUrl = `${API_URL}${message.fileUrl}`;

    switch (message.type) {
      case 'image':
        return (
          <div className="message-image">
            <img 
              src={message.thumbnail ? `${API_URL}${message.thumbnail}` : fileUrl} 
              alt={message.fileName}
              onClick={() => window.open(fileUrl, '_blank')}
            />
            <a 
              href={fileUrl} 
              download={message.fileName}
              className="download-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <FiDownload size={16} />
            </a>
          </div>
        );

      case 'video':
        return (
          <div className="message-video">
            <video controls>
              <source src={fileUrl} type={message.mimeType} />
              Your browser does not support the video tag.
            </video>
            <div className="file-info">
              <FiVideo size={16} />
              <span>{message.fileName}</span>
              <span className="file-size">
                {uploadService.formatFileSize(message.fileSize)}
              </span>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="message-audio">
            <FiMusic size={20} />
            <audio controls>
              <source src={fileUrl} type={message.mimeType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'file':
      default:
        return (
          <a 
            href={fileUrl} 
            download={message.fileName}
            className="message-file"
          >
            <div className="file-icon">
              <FiFile size={24} />
            </div>
            <div className="file-details">
              <span className="file-name">{message.fileName}</span>
              <span className="file-size">
                {uploadService.formatFileSize(message.fileSize)}
              </span>
            </div>
            <FiDownload size={20} />
          </a>
        );
    }
  };
  
  return (
    <motion.div
      className={`message ${isOwn ? 'own' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => isOwn && setShowMenu(true)}
      onMouseLeave={() => !isEditing && setShowMenu(false)}
    >
      {!isOwn && message.sender?.avatar && (
        <img 
          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}&background=random`} 
          alt={message.sender.username}
          className="message-avatar"
        />
      )}
      
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">{message.sender.username}</div>
        )}
        
        {message.fileUrl && renderFileContent()}

        {message.type === 'text' && (
          <div className={`message-bubble ${message.deleted ? 'deleted' : ''}`}>
            {isEditing ? (
              <div className="message-edit-box">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }
                  }}
                  autoFocus
                />
                <div className="edit-actions">
                  <button onClick={handleEdit} className="edit-save">
                    <FiCheck size={16} />
                  </button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }} className="edit-cancel">
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {message.content}
                {message.edited && !message.deleted && (
                  <span className="message-edited"> (edited)</span>
                )}
              </>
            )}
          </div>
        )}
        
        <div className="message-footer">
          <span className="message-time">{time}</span>
          {isOwn && (
            <div className="message-status">
              {message.readBy.length > 1 ? (
                <svg className="check-icon read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                  <polyline points="20 6 9 17 4 12" transform="translate(4, 0)"/>
                </svg>
              ) : (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          )}
        </div>

        {isOwn && showMenu && !message.deleted && message.type === 'text' && (
          <div className="message-menu">
            <button onClick={() => setIsEditing(true)} title="Edit">
              <FiEdit2 size={14} />
            </button>
            <button onClick={handleDelete} title="Delete">
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageItem;