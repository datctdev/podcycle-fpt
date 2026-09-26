import { User } from '../types';

export const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'usr_student_1',
    fullName: 'Châu Thành Đạt',
    email: 'datct.se18@fpt.edu.vn',
    password: '123',
    phone: '0901234567',
    studentId: 'SE180123',
    role: 'CUSTOMER',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_tech_1',
    fullName: 'Nguyễn Văn Minh (Kỹ Thuật Viên Trưởng Ca)',
    email: 'technician@fpt.edu.vn',
    password: '123',
    phone: '0988776655',
    studentId: 'TECH-FPT-01',
    role: 'TECHNICIAN',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_tech_2',
    fullName: 'Trương Lâm Tấn (Kỹ Thuật Viên Sảnh)',
    email: 'tantl@fpt.edu.vn',
    password: '123',
    phone: '0912345678',
    studentId: 'TECH-FPT-02',
    role: 'TECHNICIAN',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  }
];
