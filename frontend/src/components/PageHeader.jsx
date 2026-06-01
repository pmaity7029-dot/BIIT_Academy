import { Button, Typography } from 'antd';
import React from "react";

export default function PageHeader({ icon, title, subtitle, actionText, actionIcon, onAction }) {
  return (
    <div className="page-heading">
      <div className="page-title-row">
        <div className="page-title-icon">{icon}</div>
        <div>
          <Typography.Title level={2} className="page-title">{title}</Typography.Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </div>
      </div>
      {actionText && (
        <Button type="primary" size="large" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
