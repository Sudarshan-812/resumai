'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function ScoreChart({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: score > 70 ? '#16a34a' : '#ea580c' }];

  return (
    <div className="w-full h-[200px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="80%" 
          outerRadius="100%" 
          barSize={10} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
        <span className="text-4xl font-black text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">ATS Score</span>
      </div>
    </div>
  );
}