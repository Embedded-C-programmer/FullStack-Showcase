// import React, { useState, useRef, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useChat } from '../context/ChatContext';
// import socketService from '../services/socket';
// import uploadService from '../services/upload';
// import { motion, AnimatePresence } from 'framer-motion';
// import EmojiPicker from 'emoji-picker-react';
// import { useDropzone } from 'react-dropzone';
// import { FiPaperclip, FiSmile, FiSend, FiMic, FiX, FiImage } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const MessageInput = () => {
//     const { user } = useAuth();
//     const { activeConversation, sendMessage } = useChat();
//     const [message, setMessage] = useState('');
//     const [isTyping, setIsTyping] = useState(false);
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const [uploadingFile, setUploadingFile] = useState(null);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [isRecording, setIsRecording] = useState(false);
//     const textareaRef = useRef(null);
//     const typingTimeoutRef = useRef(null);
//     const emojiPickerRef = useRef(null);
//     const fileInputRef = useRef(null);
//     const mediaRecorderRef = useRef(null);
//     const audioChunksRef = useRef([]);

//     useEffect(() => {
//         if (textareaRef.current) {
//             textareaRef.current.style.height = 'auto';
//         }
//         setMessage('');
//         setShowEmojiPicker(false);
//     }, [activeConversation?._id]);

//     // Close emoji picker when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
//                 setShowEmojiPicker(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const handleTyping = () => {
//         if (!isTyping) {
//             setIsTyping(true);
//             socketService.startTyping(activeConversation._id);
//         }

//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }

//         typingTimeoutRef.current = setTimeout(() => {
//             setIsTyping(false);
//             socketService.stopTyping(activeConversation._id);
//         }, 1000);
//     };

//     const handleChange = (e) => {
//         setMessage(e.target.value);
//         handleTyping();

//         e.target.style.height = 'auto';
//         e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
//     };

//     const handleEmojiClick = (emojiData) => {
//         setMessage(prev => prev + emojiData.emoji);
//         textareaRef.current?.focus();
//     };

//     const handleFileSelect = async (files) => {
//         if (!files || files.length === 0) return;

//         const file = files[0];

//         try {
//             uploadService.validateFile(file);

//             setUploadingFile({
//                 name: file.name,
//                 size: uploadService.formatFileSize(file.size),
//                 type: file.type
//             });

//             const fileData = await uploadService.uploadFile(file, (progress) => {
//                 setUploadProgress(progress);
//             });

//             // Send message with file
//             const fileType = uploadService.getFileType(file.type);
//             sendMessage(activeConversation._id, file.name, {
//                 type: fileType,
//                 fileUrl: fileData.fileUrl,
//                 fileName: fileData.fileName,
//                 fileSize: fileData.fileSize,
//                 mimeType: fileData.mimeType,
//                 thumbnail: fileData.thumbnail
//             }, user?._id);

//             setUploadingFile(null);
//             setUploadProgress(0);
//             toast.success('File sent successfully');

//         } catch (error) {
//             console.error('File upload error:', error);
//             toast.error(error.message || 'Failed to upload file');
//             setUploadingFile(null);
//             setUploadProgress(0);
//         }
//     };

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         onDrop: handleFileSelect,
//         noClick: true,
//         noKeyboard: true
//     });

//     const startRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             const mediaRecorder = new MediaRecorder(stream);
//             mediaRecorderRef.current = mediaRecorder;
//             audioChunksRef.current = [];

//             mediaRecorder.addEventListener('dataavailable', (event) => {
//                 audioChunksRef.current.push(event.data);
//             });

//             mediaRecorder.addEventListener('stop', async () => {
//                 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
//                 const audioFile = new File([audioBlob], 'voice-message.ogg', { type: 'audio/ogg' });

//                 stream.getTracks().forEach(track => track.stop());

//                 await handleFileSelect([audioFile]);
//             });

//             mediaRecorder.start();
//             setIsRecording(true);
//             toast.success('Recording started');
//         } catch (error) {
//             console.error('Recording error:', error);
//             toast.error('Failed to start recording');
//         }
//     };

//     const stopRecording = () => {
//         if (mediaRecorderRef.current && isRecording) {
//             mediaRecorderRef.current.stop();
//             setIsRecording(false);
//             toast.success('Recording stopped');
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         if (!message.trim()) return;

//         sendMessage(activeConversation._id, message.trim(), null, user?._id);
//         setMessage('');

//         if (textareaRef.current) {
//             textareaRef.current.style.height = 'auto';
//         }

//         if (isTyping) {
//             setIsTyping(false);
//             socketService.stopTyping(activeConversation._id);
//         }

//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSubmit(e);
//         }
//     };

//     return (
//         <div {...getRootProps()} className="message-input-wrapper">
//             {isDragActive && (
//                 <div className="drop-overlay">
//                     <FiImage size={48} />
//                     <p>Drop file to upload</p>
//                 </div>
//             )}

//             {uploadingFile && (
//                 <div className="upload-progress">
//                     <div className="upload-info">
//                         <span>{uploadingFile.name}</span>
//                         <button onClick={() => {
//                             setUploadingFile(null);
//                             setUploadProgress(0);
//                         }}>
//                             <FiX />
//                         </button>
//                     </div>
//                     <div className="progress-bar">
//                         <div
//                             className="progress-fill"
//                             style={{ width: `${uploadProgress}%` }}
//                         />
//                     </div>
//                     <span className="progress-text">{uploadProgress}%</span>
//                 </div>
//             )}

//             <form className="message-input glass" onSubmit={handleSubmit}>
//                 <input
//                     {...getInputProps()}
//                     ref={fileInputRef}
//                     style={{ display: 'none' }}
//                 />

//                 <button
//                     type="button"
//                     className="icon-btn"
//                     onClick={() => fileInputRef.current?.click()}
//                     title="Attach file"
//                 >
//                     <FiPaperclip size={20} />
//                 </button>

//                 <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
//                     <button
//                         type="button"
//                         className="icon-btn"
//                         onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                         title="Emoji"
//                     >
//                         <FiSmile size={20} />
//                     </button>

//                     <AnimatePresence>
//                         {showEmojiPicker && (
//                             <motion.div
//                                 className="emoji-picker-container"
//                                 initial={{ opacity: 0, y: 10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 exit={{ opacity: 0, y: 10 }}
//                             >
//                                 <EmojiPicker
//                                     onEmojiClick={handleEmojiClick}
//                                     theme="dark"
//                                     skinTonesDisabled
//                                     searchDisabled
//                                     height={350}
//                                     width="100%"
//                                 />
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>

//                 <textarea
//                     ref={textareaRef}
//                     value={message}
//                     onChange={handleChange}
//                     onKeyDown={handleKeyDown}
//                     placeholder="Type a message..."
//                     rows={1}
//                     className="message-textarea"
//                     disabled={uploadingFile || isRecording}
//                 />

//                 {isRecording ? (
//                     <motion.button
//                         type="button"
//                         className="icon-btn recording"
//                         onClick={stopRecording}
//                         animate={{ scale: [1, 1.1, 1] }}
//                         transition={{ repeat: Infinity, duration: 1 }}
//                     >
//                         <FiMic size={20} />
//                     </motion.button>
//                 ) : message.trim() ? (
//                     <motion.button
//                         type="submit"
//                         className="send-btn"
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                     >
//                         <FiSend size={20} />
//                     </motion.button>
//                 ) : (
//                     <button
//                         type="button"
//                         className="icon-btn"
//                         onClick={startRecording}
//                         title="Voice message"
//                     >
//                         <FiMic size={20} />
//                     </button>
//                 )}
//             </form>
//         </div>
//     );
// };

// export default MessageInput;



import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import socketService from '../services/socket';
import uploadService from '../services/upload';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';
import { FiPaperclip, FiSmile, FiSend, FiMic, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const { user } = useAuth();
  const { activeConversation, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessage('');
    setShowEmojiPicker(false);
  }, [activeConversation?._id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(activeConversation._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(activeConversation._id);
    }, 1000);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
    
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      uploadService.validateFile(file);
      
      setUploadingFile({
        name: file.name,
        size: uploadService.formatFileSize(file.size),
        type: file.type
      });

      const fileData = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Send message with file
      const fileType = uploadService.getFileType(file.type);
      sendMessage(activeConversation._id, file.name, {
        type: fileType,
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
        thumbnail: fileData.thumbnail
      }, user?._id);

      setUploadingFile(null);
      setUploadProgress(0);
      toast.success('File sent successfully');

    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    noClick: true,
    noKeyboard: true
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
        const audioFile = new File([audioBlob], 'voice-message.ogg', { type: 'audio/ogg' });
        
        stream.getTracks().forEach(track => track.stop());
        
        await handleFileSelect([audioFile]);
      });

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    sendMessage(activeConversation._id, message.trim(), null, user?._id);
    setMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(activeConversation._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div {...getRootProps()} className="message-input-wrapper">
      {isDragActive && (
        <div className="drop-overlay">
          <FiImage size={48} />
          <p>Drop file to upload</p>
        </div>
      )}

      {uploadingFile && (
        <div className="upload-progress">
          <div className="upload-info">
            <span>{uploadingFile.name}</span>
            <button onClick={() => {
              setUploadingFile(null);
              setUploadProgress(0);
            }}>
              <FiX />
            </button>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}

      <form className="message-input glass" onSubmit={handleSubmit}>
        <input
          {...getInputProps()}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <button 
          type="button" 
          className="icon-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <FiPaperclip size={20} />
        </button>

        <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
          <button 
            type="button" 
            className="icon-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
          >
            <FiSmile size={20} />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="emoji-picker-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  skinTonesDisabled
                  searchDisabled
                  height={350}
                  width="100%"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="message-textarea"
          disabled={uploadingFile || isRecording}
        />

        {isRecording ? (
          <motion.button
            type="button"
            className="icon-btn recording"
            onClick={stopRecording}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FiMic size={20} />
          </motion.button>
        ) : message.trim() ? (
          <motion.button
            type="submit"
            className="send-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend size={20} />
          </motion.button>
        ) : (
          <button 
            type="button" 
            className="icon-btn"
            onClick={startRecording}
            title="Voice message"
          >
            <FiMic size={20} />
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;