import type { LucideProps } from 'lucide-react';
import { FileText, Phone, Code, Building2, Award, ClipboardCheck, Briefcase } from 'lucide-react';

interface StageIconProps extends LucideProps {
  stageName: string;
}

export function StageIcon({ stageName, ...props }: StageIconProps) {
  const lowerCaseName = stageName.toLowerCase();
  
  if (lowerCaseName.includes('application')) return <FileText {...props} />;
  if (lowerCaseName.includes('phone') || lowerCaseName.includes('screen')) return <Phone {...props} />;
  if (lowerCaseName.includes('technical') || lowerCaseName.includes('code') || lowerCaseName.includes('coding')) return <Code {...props} />;
  if (lowerCaseName.includes('site') || lowerCaseName.includes('office')) return <Building2 {...props} />;
  if (lowerCaseName.includes('offer')) return <Award {...props} />;
  if (lowerCaseName.includes('final') || lowerCaseName.includes('manager')) return <ClipboardCheck {...props} />;

  return <Briefcase {...props} />;
}
