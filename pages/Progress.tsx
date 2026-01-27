import React from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { grades } from '../utils';

export const Progress: React.FC = () => {
  const { sessions } = useStore();

  // 1. Sessions per Week (Volume)
  const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
  });

  const sessionData = last7Days.map(dateStr => {
      const count = sessions.filter(s => s.date.startsWith(dateStr)).length;
      return {
          day: new Date(dateStr).toLocaleDateString('en-US', {weekday: 'short'}),
          count: count
      };
  });

  // 2. Grade Distribution (Histogram)
  // Calculate total sends per grade for all time (or last 30 days if we wanted to filter)
  const gradeDistribution = grades.map(g => {
      let count = 0;
      sessions.forEach(s => {
          s.climbs.forEach(c => {
              if (c.sent && c.grade === g) count++;
          });
      });
      return { grade: g, count };
  }).filter(d => d.count > 0); // Only show grades with sends? Or show all up to max?
  // Let's filter to remove empty trailing/leading grades to keep chart clean, 
  // but keep gaps in middle if any.
  
  // Find min and max index
  const hasData = gradeDistribution.length > 0;

  return (
    <div className="pb-20 space-y-8">
      <h1 className="text-2xl font-bold text-stone-100">Progress</h1>

      {/* Grade Distribution Chart */}
      <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <h3 className="text-sm font-bold text-stone-400 mb-4 uppercase">Grade Profile (Total Sends)</h3>
          {hasData ? (
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <XAxis dataKey="grade" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fbbf24' }}
                        cursor={{fill: '#292524'}}
                    />
                    <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(45, 96%, ${Math.max(40, 60 - index * 2)}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-stone-500 text-sm italic">
                Log some sends to see your grade profile.
            </div>
          )}
      </div>

      {/* Session Volume Chart */}
      <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
          <h3 className="text-sm font-bold text-stone-400 mb-4 uppercase">Training Frequency (7 Days)</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fbbf24' }}
                    cursor={{fill: '#292524'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#57534e' : '#292524'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
              <div className="text-2xl font-bold text-white">{sessions.length}</div>
              <div className="text-xs text-stone-500 uppercase">Total Sessions</div>
          </div>
          <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
              <div className="text-2xl font-bold text-white">
                  {sessions.reduce((acc, s) => acc + s.climbs.length, 0)}
              </div>
              <div className="text-xs text-stone-500 uppercase">Total Climbs</div>
          </div>
      </div>
    </div>
  );
};
