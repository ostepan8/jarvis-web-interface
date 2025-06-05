'use client';
import React from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Weekly Calendar</h1>
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
          <div></div>
          {days.map((day) => (
            <div key={day} className="p-2 text-center font-semibold border-b border-gray-700">
              {day}
            </div>
          ))}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 border-b border-gray-800 text-right pr-3 text-sm whitespace-nowrap">
                {hour}
              </div>
              {days.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="border border-gray-800 h-16 hover:bg-blue-900/30 transition-colors"
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
