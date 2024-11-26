import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const TopicSelectionPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [existingTicket, setExistingTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingTicket();
  }, []);

  const checkExistingTicket = async () => {
    try {
      const response = await axios.get('/api/user-ticket');
      if (response.data.ticket && response.data.ticket.status === 'open') {
        setExistingTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Error checking existing ticket:', error);
    }
  };

  const topics = [
    'Masalah Akun',
    'Masalah Pembayaran',
    'Dukungan Teknis',
    'Pertanyaan Produk',
    'Pengiriman dan Pengantaran',
    'Lainnya'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subject = selectedTopic === 'Lainnya' ? customTopic : selectedTopic;
    try {
      if (existingTicket) {
        navigate('/bantuan');
      } else {
        const response = await axios.post('/api/create-ticket', { subject });
        if (response.data.ticket) {
          navigate('/bantuan');
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (existingTicket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#171D34] text-white p-4">
        <ArrowLeft
          className="absolute top-4 left-4 cursor-pointer text-white"
          onClick={() => navigate('/')}
          size={24}
        />
        <h2 className="text-2xl mb-4">Anda memiliki tiket dukungan yang sedang berlangsung</h2>
        <p className="mb-4">Topik: {existingTicket.subject}</p>
        <button
          onClick={() => navigate('/bantuan')}
          className="bg-[#3A4468] text-white px-4 py-2 rounded"
        >
          Lanjutkan Obrolan
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#171D34] text-white p-4">
      <ArrowLeft
        className="absolute top-4 left-4 cursor-pointer text-white"
        onClick={() => navigate('/')}
        size={24}
      />
      <h1 className="text-3xl mb-6">Pilih Topik Bantuan</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full p-2 mb-4 bg-[#222745] rounded"
          required
        >
          <option value="">Pilih topik</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        {selectedTopic === 'Lainnya' && (
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Masukkan topik Anda"
            className="w-full p-2 mb-4 bg-[#222745] rounded"
            required
          />
        )}
        <button
          type="submit"
          className="w-full bg-[#3A4468] text-white px-4 py-2 rounded"
        >
          Mulai Obrolan
        </button>
      </form>
    </div>
  );
};

export default TopicSelectionPage;
