import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Camera } from 'lucide-react';
import axios from 'axios';

const ClientHelpCenter = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ticket, setTicket] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchOrCreateTicket();
  }, []);

  useEffect(() => {
    if (ticket) {
      fetchMessages();
    }
  }, [ticket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOrCreateTicket = async () => {
    try {
      const response = await axios.get('/api/user-ticket');
      if (response.data.ticket) {
        setTicket(response.data.ticket);
      } else {
        const newTicketResponse = await axios.post('/api/create-ticket', {
          subject: 'General Inquiry'
        });
        setTicket(newTicketResponse.data.ticket);
      }
    } catch (error) {
      console.error('Error fetching or creating ticket:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${ticket.ticket_id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && ticket) {
      try {
        await axios.post('/api/send-message', {
          ticketId: ticket.ticket_id,
          text: inputMessage,
          senderType: 'user'
        });
        setInputMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && ticket) {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('ticketId', ticket.ticket_id);
      try {
        await axios.post('/api/send-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchMessages();
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen bg-[#171D34]">
      <div className="flex items-center p-4 bg-[#222745] text-white">
        <ArrowLeft className="mr-4" onClick={() => {/* Handle navigation back */}} />
        <h1 className="text-xl font-semibold">Pusat Bantuan</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.message_id}
            className={`mb-4 ${
              message.sender_type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender_type === 'user'
                  ? 'bg-[#3A4468] text-white'
                  : 'bg-[#222745] text-white'
              }`}
            >
              {message.message}
              {message.file_path && (
                <img
                  src={`data:${message.file_type};base64,${message.file_path}`}
                  alt="Attachment"
                  className="mt-2 max-w-xs"
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#222745]">
        <div className="flex items-center bg-[#171D34] rounded-full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 p-3 bg-transparent text-white focus:outline-none"
          />
          <button onClick={() => fileInputRef.current.click()} className="p-3 text-white">
            <Camera size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <button onClick={handleSendMessage} className="p-3 text-white">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHelpCenter;