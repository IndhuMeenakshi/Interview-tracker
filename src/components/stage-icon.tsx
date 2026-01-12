import type { LucideProps } from 'lucide-react';
import { FileText, Phone, Code, Building2, Award, ClipboardCheck, Briefcase, UserCheck } from 'lucide-react';

interface StageIconProps extends LucideProps {
  stageName: string;
}

export function StageIcon({ stageName, ...props }: StageIconProps) {
  const lowerCaseName = stageName.toLowerCase();
  
  if (lowerCaseName.includes('applied') || lowerCaseName.includes('application')) return <FileText {...props} />;
  if (lowerCaseName.includes('phone') || lowerCaseName.includes('screen')) return <Phone {...props} />;
  if (lowerCaseName.includes('technical') || lowerCaseName.includes('code') || lowerCaseName.includes('coding')) return <Code {...props} />;
  if (lowerCaseName.includes('on-site') || lowerCaseName.includes('office')) return <Building2 {...props} />;
  if (lowerCaseName.includes('offer')) return <Award {...props} />;
  if (lowerCaseName.includes('manager') || lowerCaseName.includes('managerial')) return <UserCheck {...props} />;
  if (lowerCaseName.includes('final') || lowerCaseName.includes('hr')) return <ClipboardCheck {...props} />;

  return <Briefcase {...props} />;
}
