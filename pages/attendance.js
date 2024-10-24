import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Attendance() {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => setAttendance(data));
  }, []);

  if (!attendance) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome {attendance.name}</h1>
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sr No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {attendance.attendanceData.map((row) => {
                const percentage = parseInt(row[5]);
                const bgColor = percentage >= 80 ? 'bg-green-600' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-600';
                
                return (
                  <tr key={row[0]} className="bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row[1]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row[2]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row[3]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row[4]}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${bgColor}`}>
                      {row[5]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
