import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const USER_ID = '6ab8cd53693d34b653aa0af4';

  const [academicStats, setAcademicStats] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // GET DASHBOARD DATA FROM BACKEND
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/dashboard/${USER_ID}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        setAcademicStats(data.analytics || []);
        setTimetable(data.timetable || []);
      } catch (err) {
        console.error(err);
        setError('Unable to connect to backend');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-indigo-400 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-5">
          <h2 className="font-bold text-red-300">
            Backend Connection Error
          </h2>
          <p className="text-red-200 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* HEADER */}
      <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-400">
            PeerTrack System
          </h1>

          <p className="text-gray-400 text-sm">
            Decentralized Academic Performance Engine
          </p>
        </div>

        <div className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold">
          ⚡ Core Engine Online
        </div>
      </header>


      {/* BACKLOG WARNING */}
      {academicStats.some(
        (s) => s.status === 'Backlog'
      ) && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 mb-8 flex justify-between items-center">

          <div>
            <h3 className="font-bold text-red-200">
              Alert: Critical Academic Backlogs Detected
            </h3>

            <p className="text-sm text-red-300">
              You have critical backlogs. Connect with peer mentors immediately.
            </p>
          </div>

          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium text-xs transition-colors">
            Find P2P Mentors
          </button>

        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ACADEMIC PERFORMANCE */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">

            <h2 className="text-xl font-bold mb-4 text-indigo-300">
              Subject Performance Matrix
            </h2>

            {academicStats.length === 0 ? (
              <p className="text-gray-400">
                No academic records found.
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">

                      <th className="pb-3">
                        Subject Name
                      </th>

                      <th className="pb-3">
                        Exam Score
                      </th>

                      <th className="pb-3">
                        Time Invested
                      </th>

                      <th className="pb-3">
                        Current Status
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700/50">

                    {academicStats.map((item, idx) => (

                      <tr key={item._id || idx} className="text-sm">

                        <td className="py-4 font-medium">
                          {item.subjectName}
                        </td>

                        <td className="py-4 font-semibold">
                          {item.score} / 100
                        </td>

                        <td className="py-4 text-gray-300">
                          {(item.totalMinutesStudied / 60).toFixed(1)} hrs
                        </td>

                        <td className="py-4">

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === 'Good Marks'
                                ? 'bg-green-900/60 text-green-300'
                                : item.status === 'Backlog'
                                ? 'bg-red-900/60 text-red-300'
                                : 'bg-yellow-900/60 text-yellow-300'
                            }`}
                          >
                            {item.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>


        {/* TIMETABLE */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">

          <h2 className="text-xl font-bold mb-4 text-indigo-300">
            Weekly Target Blocks
          </h2>

          <div className="space-y-4">

            {timetable.length === 0 ? (

              <p className="text-gray-400">
                No timetable entries found.
              </p>

            ) : (

              timetable.map((slot, index) => (

                <div
                  key={slot._id || index}
                  className="bg-gray-700/40 p-4 rounded-lg border border-gray-700 flex flex-col justify-between"
                >

                  <div>

                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      {slot.dayOfWeek}
                    </span>

                    <h4 className="font-semibold text-md text-white mt-0.5">
                      {slot.subjectName}
                    </h4>

                  </div>

                  <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">

                    <span>
                      ⏰ {slot.startTime} - {slot.endTime}
                    </span>

                    <button className="text-indigo-400 hover:underline font-medium">
                      Log Hours
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>
  );
}