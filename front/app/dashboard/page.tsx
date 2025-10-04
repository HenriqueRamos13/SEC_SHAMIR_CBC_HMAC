'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Member = {
  userId: string;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [threshold, setThreshold] = useState(3);
  const [roundResult, setRoundResult] = useState<any>(null);

  // Reconstruct form
  const [roundId, setRoundId] = useState('');
  const [sharesInput, setSharesInput] = useState('');
  const [encryptedList, setEncryptedList] = useState('');
  const [iv, setIv] = useState('');
  const [hmac, setHmac] = useState('');
  const [decryptedResult, setDecryptedResult] = useState<any>(null);

  const [newMember, setNewMember] = useState({ name: '', email: '' });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([
        ...members,
        { userId: crypto.randomUUID(), name: newMember.name, email: newMember.email },
      ]);
      setNewMember({ name: '', email: '' });
    }
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((m) => m.userId !== userId));
  };

  const handleGenerateRound = async () => {
    if (members.length < threshold) {
      alert('Not enough members for the threshold');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/generateRound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId: crypto.randomUUID(),
          groupName,
          members,
          threshold,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to generate round');
        return;
      }

      setRoundResult(data);
      alert(
        `Round generated! ${data.emailsSent} emails sent with shares.\nCheck MailHog at http://localhost:8025`
      );
    } catch (err) {
      alert('Network error. Is the backend running?');
    }
  };

  const handleReconstructKey = async () => {
    const sharesArray = sharesInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s);

    if (sharesArray.length < threshold) {
      alert(`You need at least ${threshold} shares`);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/reconstructKey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roundId,
          shares: sharesArray,
          encryptedList,
          iv,
          hmac,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to reconstruct key');
        return;
      }

      setDecryptedResult(data);
    } catch (err) {
      alert('Network error. Is the backend running?');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ElPAGADOR Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate Round */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Round</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Threshold (k friends needed)
              </label>
              <input
                type="number"
                min={2}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">Add Member</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder:text-gray-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2 text-gray-900">Members ({members.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateRound}
              disabled={members.length < threshold}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Generate Round
            </button>

            {roundResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-900">Round generated successfully!</p>
                <p className="text-sm text-gray-900">Round ID: {roundResult.roundId}</p>
                <p className="text-sm text-gray-900">{roundResult.emailsSent} emails sent</p>
                <p className="text-sm text-gray-600 mt-2">
                  Check MailHog at{' '}
                  <a
                    href="http://localhost:8025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    http://localhost:8025
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Reconstruct Key */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Reconstruct & Decrypt</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Round ID</label>
                <input
                  type="text"
                  value={roundId}
                  onChange={(e) => setRoundId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Paste round ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Shares (one per line, need {threshold})
                </label>
                <textarea
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Paste shares from emails, one per line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Encrypted List</label>
                <input
                  type="text"
                  value={encryptedList}
                  onChange={(e) => setEncryptedList(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Paste encrypted list"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">IV</label>
                <input
                  type="text"
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Paste IV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">HMAC</label>
                <input
                  type="text"
                  value={hmac}
                  onChange={(e) => setHmac(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Paste HMAC"
                />
              </div>

              <button
                onClick={handleReconstructKey}
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
              >
                Reconstruct & Decrypt
              </button>

              {decryptedResult && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <p className="font-medium text-lg mb-2 text-gray-900">🎉 Who Pays:</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {decryptedResult.decryptedList}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    ✓ HMAC Verified: {decryptedResult.verified ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
