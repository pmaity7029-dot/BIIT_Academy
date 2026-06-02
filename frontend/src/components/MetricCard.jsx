import { Card, Statistic } from 'antd';
import React from 'react';

export default function MetricCard({ title, value, icon, suffix }) {
  return (
    <Card className="metric-card" variant="borderless">
      <div className="metric-inner">
        <Statistic
          title={title}
          value={value}
          suffix={suffix}
          valueStyle={{ color: '#143f75', fontWeight: 800 }}
        />
        <div className="metric-icon">{icon}</div>
      </div>
    </Card>
  );
}